from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from typing import Optional
from DocumentAIClassifier import process_document_sample
import os
import tempfile

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

    doc_type = process_document_sample(
        project_id="genesis-genai-454505",
        location="us",
        processor_id="14e7ceab3f5db4d",
        file_path=temp_path,
        mime_type="application/pdf",
        field_mask="text,entities,pages.pageNumber",
        processor_version_id="9d9f356e7d49f10f"
    )

    print(doc_type)
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "message": "File processed successfully"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0000", port=8000) 