import os
import requests
from urllib.parse import urlparse

def fetch_repo_summary(repo_url: str) -> str:
    """
    Extracts basic repo metadata & important files using GitHub API.
    Uses a GitHub token if available to avoid rate limits.
    Returns summary string for LLM input.
    """

    # Setup headers
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "readme-generator"
    }
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    # Parse repo URL safely
    parsed = urlparse(repo_url)
    parts = [p for p in parsed.path.strip("/").split("/") if p]
    if len(parts) < 2:
        raise ValueError("Invalid GitHub repo URL. Expected format: https://github.com/<owner>/<repo>")

    owner, repo = parts[0], parts[1].removesuffix(".git")
    api_url = f"https://api.github.com/repos/{owner}/{repo}"

    def get_json(url: str):
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 403:
            if "X-RateLimit-Remaining" in r.headers and r.headers["X-RateLimit-Remaining"] == "0":
                raise RuntimeError("❌ GitHub rate limit exceeded. Please set a valid GITHUB_TOKEN.")
            raise RuntimeError(f"❌ Forbidden: {r.json().get('message','Unknown error')}")
        r.raise_for_status()
        return r.json()

    try:
        # Repo metadata
        repo_data = get_json(api_url)
        name = repo_data.get("name", "")
        description = repo_data.get("description", "") or ""
        language = repo_data.get("language", "") or ""

        # Root contents
        contents = get_json(f"{api_url}/contents")
        if not isinstance(contents, list):
            msg = contents.get("message", "unexpected response")
            raise RuntimeError(f"Unable to list repo contents: {msg}")

        # Files of interest
        target_files = {
            "package.json", "requirements.txt", "setup.py", "pyproject.toml",
            "pipfile", "poetry.lock", "environment.yml", "dockerfile",
            "makefile", "pnpm-lock.yaml", "yarn.lock", "cargo.toml"
        }

        files_summary = []
        for item in contents:
            if item.get("type") != "file":
                continue
            fname = item.get("name", "").lower()
            if fname not in target_files:
                continue

            download_url = item.get("download_url")
            if not download_url:
                continue

            resp = requests.get(download_url, headers=headers, timeout=15)
            resp.raise_for_status()
            snippet = resp.text[:1000]  # limit size
            files_summary.append(f"File: {fname}\n{snippet}")

        summary = (
            f"Repository: {name}\n"
            f"Description: {description}\n"
            f"Language: {language}\n"
            f"Key Files:\n\n" + ("\n\n".join(files_summary) if files_summary else "None found.")
        )

        return summary.strip()

    except Exception as e:
        raise Exception(f"Failed to fetch repo: {e}")
