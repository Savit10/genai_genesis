import json
import sys
from pinecone import Pinecone
import os
from dotenv import load_dotenv
import time
from llama_cloud_services import LlamaParse
from llama_index.core import SimpleDirectoryReader
from llama_index.core.text_splitter import TokenTextSplitter
from tqdm import tqdm
import cohere

load_dotenv()

pinecone_api_key = os.getenv("PINECONE_API_KEY")
if pinecone_api_key is None:
    raise ValueError("PINECONE_API_KEY environment variable is not set")
pc = Pinecone(api_key=pinecone_api_key)

index = pc.Index("genaigenesis")

def generate_response(user_input):
    start_time = time.time()
    embeddings = pc.inference.embed(
        model="multilingual-e5-large",
        inputs = user_input,
        parameters={"input_type": "query"}
    )

    # Step 2: Search Pinecone for relevant data
    search_results = index.query(
        namespace="insurance_policy",
        vector=embeddings.get("data")[0]["values"],
        top_k=3, 
        include_metadata=True
    )

     # Step 3: Format Retrieved Context
    context = "\n".join([
        f"Content: {match['metadata']['content']}\n"
        for match in search_results['matches']
    ])

    # Check if we found relevant results
    if not search_results['matches']:  # No matches found
        print("\nNo relevant information found in the database.")
        return

    # Define a similarity threshold (adjust as needed)
    similarity_threshold = 0.5  
    filtered_matches = [
        match for match in search_results['matches']
        if match["score"] >= similarity_threshold
    ]

    if not filtered_matches:
        print("\nThe retrieved information is not relevant enough.")
        return

    # Step 4: Pass Context + Query to LLaMA
    prompt = f"Context: {context}\n\nQuestion: {user_input}\nAnswer:"
    
    co = cohere.ClientV2()
    response = co.chat_stream(
        model="command-r-plus-08-2024",
        messages=[{"role": "user", "content": prompt}],
    )

    print(f"Response Generation Time: {time.time() - start_time:.2f} sec")

    # Step 5: Display Response
    for line in response.iter_lines():
        if line:
            try:
                json_data = json.loads(line)
                sys.stdout.write(json_data.get('response', ''))
                sys.stdout.flush() 
            except json.JSONDecodeError:
                print("Warning: Received invalid JSON chunk. Skipping...")
    print(f"Display Generation Time: {time.time() - start_time:.2f} sec")

def generate_vector_database(pdf_file_path):

    parser = LlamaParse(
        api_key=os.getenv("LLAMAPARSE_API_KEY"),
        result_type="markdown"  # "markdown" and "text" are available
    )

    file_extractor = {".pdf": parser}
    documents = SimpleDirectoryReader(input_files=[pdf_file_path], file_extractor=file_extractor).load_data()

    splitter = TokenTextSplitter(separator=" ", chunk_size=300, chunk_overlap=50)

    records = []
    chunk_count = 0

    print("Splitting documents and embedding in batches...")

    for doc in tqdm(documents, desc="Processing documents"):
        chunks = splitter.split_text(doc.text)

        batch_size = 10
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]

            # Embed this batch
            embedding_response = pc.inference.embed(
                model= "multilingual-e5-large",
                inputs=batch,
                parameters={"input_type": "query"}
            )
            embeddings = embedding_response.get("data")

            # Create Pinecone records
            for emb, chunk_text in zip(embeddings, batch):
                record = {
                    "id": f"{os.path.basename(pdf_file_path)}_chunk_{chunk_count}",
                    "values": emb["values"],
                    "metadata": {
                        "source_file": pdf_file_path,
                        "content": chunk_text
                    }
                }
                records.append(record)
                chunk_count += 1

            # Upsert every 50 records to Pinecone (tweak this as needed)
            if len(records) >= 50:
                index.upsert(vectors=records, namespace="insurance_policy")
                records = []

    # Upsert remaining records
    if records:
        index.upsert(vectors=records, namespace="insurance_policy")

    print(f"Completed indexing. Total chunks embedded: {chunk_count}")

def main():
    generate_vector_database("/Users/savit/Desktop/Code/genai_genesis/backend/sample-policy-contract.pdf")

if __name__ == "__main__":
    main()