import json
from sentence_transformers import SentenceTransformer

def get_embeddings(data, model_name='all-MiniLM-L6-v2', split_by='\n'):
    """
    Generates embeddings for text chunks from a raw text file and saves them to a JSON file.

    Args:
        input_file_path (str): Path to the input text file.
        output_file_path (str): Path to the output JSON file where embeddings will be saved.
        model_name (str): Name of the pre-trained SentenceTransformer model to use.
        split_by (str): Delimiter to split the raw text into chunks (e.g., '\n' for lines).

    Returns:
        None
    """
    # Load the raw text from the input file
    raw_text = data

    # Initialize the pre-trained model for embedding generation
    embedding_model = SentenceTransformer(model_name)

    # Split the raw text into chunks
    text_chunks = raw_text.split(split_by)

    # Generate embeddings for each chunk
    embeddings = [embedding_model.encode(chunk).tolist() for chunk in text_chunks]

    # Prepare embeddings data with IDs
    embeddings_data = [{"id": idx, "embedding": embedding} for idx, embedding in enumerate(embeddings)]


    print(f"Embeddings generated!")

    return embeddings_data

# Example usage:
# generate_and_save_embeddings('raw_string_data.txt', 'embeddings.json')