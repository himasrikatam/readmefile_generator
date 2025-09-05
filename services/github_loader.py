import requests

def fetch_repo_summary(repo_url: str) -> str:
    """
    Extracts basic repo metadata & important files using GitHub API.
    Returns summary string for LLM input.
    """
    try:
        # Convert GitHub URL to API
        owner_repo = repo_url.rstrip("/").split("github.com/")[-1]
        api_url = f"https://api.github.com/repos/{owner_repo}"

        # Fetch metadata
        repo_data = requests.get(api_url).json()
        name = repo_data.get("name", "")
        description = repo_data.get("description", "")
        language = repo_data.get("language", "")

        # Fetch repo contents (root only for MVP)
        contents_url = f"{api_url}/contents"
        contents = requests.get(contents_url).json()

        files_summary = []
        for file in contents:
            if file["type"] == "file" and file["name"].lower() in [
                "package.json", "requirements.txt", "setup.py", "pyproject.toml"
            ]:
                file_content = requests.get(file["download_url"]).text
                files_summary.append(f"File: {file['name']}\n{file_content[:1000]}")  # truncate

        repo_summary = f"""
        Repository: {name}
        Description: {description}
        Language: {language}
        Key Files:
        {''.join(files_summary)}
        """

        return repo_summary.strip()

    except Exception as e:
        raise Exception(f"Failed to fetch repo: {e}")