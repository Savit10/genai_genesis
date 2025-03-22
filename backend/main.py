from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from typing import Optional
from DocumentAIClassifier import process_document_sample, ocr_processing
import tempfile
from FormParser import get_data
from DocumentAIClassifier import document_classifier

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
async def upload_file(file: UploadFile = File(...)):
    # Process your file here
    print(file.filename)
    content = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        temp_file.write(content)
        temp_path = temp_file.name

    doc_type = document_classifier(temp_path=temp_path)

    print(doc_type)

    doc_types = ["claim_forms", "eobs", "written_notes"]

    if doc_type == doc_types[2]:
        # form_parser
        text = ocr_processing(temp_path)
    else:
        text = get_data(temp_path)
    print(text)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0000", port=8000) 