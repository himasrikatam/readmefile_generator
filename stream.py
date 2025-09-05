import streamlit as st
import os
from services.readme_agent import generate_readme
from services.github_loader import fetch_repo_summary
from dotenv import load_dotenv
load_dotenv()

st.set_page_config(page_title="GitHub README Generator", page_icon="📄")
st.title("📄 GitHub README Generator")

github_link = st.text_input("Enter GitHub Repository URL")
if st.button("Generate README"):
    if github_link:
        with st.spinner("Generating README..."):
            try:
                repo_summary = fetch_repo_summary(github_link)
                readme_content = generate_readme(repo_summary)
                st.subheader("Generated README")
                st.text_area("README Content", readme_content, height=400)
            except Exception as e:
                st.error(f"Error: {e}")
    else:
        st.warning("Please enter a valid GitHub repository URL.")