import cohere
import os
import json
from dotenv import load_dotenv

load_dotenv()
co = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))

def summarize(text):
    prompt = f"""
    Below is a set of text data from insurance claim documents, including OCR-extracted text and structured data.
    Please generate a clear summary with the following sections:
    1. Patient Background (age, medical history, occupation)
    2. Reason for the Claim (incident or illness details)
    3. Additional Background (family situation, dependents, financial status)

    Text:
    {text}

    Summary:
    """

    response = co.chat_stream(
        model="command-r-plus-08-2024",
        messages=[{"role": "user", "content": prompt}],
    )

    
    summary = ""
    for event in response:
        if event.type == "content-delta":
            summary += event.delta.message.content.text
    return summary
