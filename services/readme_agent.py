from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv
load_dotenv()

# Init Groq LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",  # Groq model
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)

if os.getenv("GROQ_API_KEY") is None:
    print("Warning: GROQ_API_KEY not set. Please set it in your environment variables.")
print("Using Groq model:")

# Prompt template
prompt = PromptTemplate(
    input_variables=["repo_summary"],
    template="""
You are an expert open-source contributor. 
Generate a professional README.md file for this repository.

Repository details:
{repo_summary}

README must include:
1. Project title
2. Description (purpose + features)
3. Installation steps
4. Usage examples
5. Tech stack
6. Contribution guidelines
7. License (if available)
8. Badges (if relevant)

Include emojis and markdown formatting for clarity and visual appeal.
Output only a complete Markdown README.md file.
"""
)

def generate_readme(repo_summary: str) -> str:
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run({"repo_summary": repo_summary})
    return result