from flask import Flask, request, jsonify
from services.github_loader import fetch_repo_summary
from services.readme_agent import generate_readme
from flask_cors import CORS
app = Flask(__name__)

@app.route("/generate-readme", methods=["POST"])
def generate_readme_endpoint():
    data = request.json
    repo_url = data.get("repo_url")

    if not repo_url:
        return jsonify({"error": "Repo URL is required"}), 400

    try:
        # Step 1: Fetch repo metadata & summaries
        repo_summary = fetch_repo_summary(repo_url)

        # Step 2: Generate README with LLM
        readme_content = generate_readme(repo_summary)

        return jsonify({"readme": readme_content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

CORS(app)
if __name__ == "__main__":
    app.run(debug=True, port=5125)
