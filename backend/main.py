from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from typing import Optional, List
from DocumentAIProcessor import ocr_processing
from FormParser import get_data
from DocumentAIClassifier import document_classifier
from Summarizer import summarize
from validate_formdata import validate_form
from feature_embeddings import get_embeddings
import tempfile
import os
from FraudAgent import assess_fraud


app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(files: List[UploadFile] = File(...)):
    all_results = {
        "summary": None,
        "validation": None
    }

    # Get the current directory path and construct the full path to insurance_policy.pdf
    current_dir = os.path.dirname(os.path.abspath(__file__))
    policy_path = os.path.join(current_dir, "insurance_policy.pdf")
    
    policy_doc = ocr_processing(policy_path)
    combined_features = ""
    last_json_text = None  # Keep track of the last JSON for validation
    all_json_text = []  # Store all JSON data for fraud assessment
    
    for file in files:
        content = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            doc_type = document_classifier(temp_path=temp_path)
            
            if doc_type == "written_notes":
                raw_text = ocr_processing(temp_path)
                combined_features += raw_text
            else:
                json_text = get_data(temp_path)
                last_json_text = json_text  # Store the last JSON
                all_json_text.append(json_text)
                combined_features += "This is a JSON: " + "\n".join([f"{key}: {value}" for key, value in json_text.items() if value.strip() != ""])

        finally:
            os.unlink(temp_path)
    
    # Process combined results
    if combined_features:
        if last_json_text:  # Only validate if we have JSON data
            all_results["validation"] = validate_form(last_json_text)
            # Assess fraud risk
            combined_json_texts = {key: value for json_text in all_json_text for key, value in json_text.items()}
            fraud_risk = assess_fraud(combined_json_texts, policy_doc)
            all_results["fraud_risk"] = fraud_risk
        all_results["summary"] = summarize(combined_features)
    
    return {
        "status": "success",
        "message": f"Successfully processed {len(files)} files",
        "data": all_results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0000", port=8000) 


