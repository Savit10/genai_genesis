import cohere
import numpy as np
import json, os, regex as re
from sklearn.metrics.pairwise import cosine_similarity

from dotenv import load_dotenv

load_dotenv()
co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))


def analyze_claim_text(text: str) -> dict:
    """Improved JSON parsing with error handling"""
    response = co.generate(
        model="command",
        prompt=f"""Analyze this insurance claim for fraud risk. Respond ONLY with valid JSON:
        {{
            "fraud_risk": "low/medium/high",
            "reasons": ["list", "of", "reasons"],
            "verification_needed": bool
        }}
        
        Claim: {text}
        
        JSON:""",
        temperature=0,
        max_tokens=300
    )
    
    # Extract JSON from response using regex
    raw_text = response.generations[0].text
    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    
    if not json_match:
        return {
            "fraud_risk": "medium",
            "reasons": ["Unable to parse analysis"],
            "verification_needed": True
        }
    
    try:
        return json.loads(json_match.group(0))
    except json.JSONDecodeError:
        return {
            "fraud_risk": "medium",
            "reasons": ["Invalid analysis format"],
            "verification_needed": True
        }

def get_embeddings(text: str) -> np.ndarray:
    """Get document embeddings using Cohere's Embed API"""
    response = co.embed(texts=[text], model="embed-english-v3.0", input_type="classification")
    return np.array(response.embeddings[0])

def calculate_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings"""
    return cosine_similarity([vec1], [vec2])[0][0]

def assess_fraud(claim_json: dict, document_text: str) -> dict:
    """Main fraud assessment function"""
    # Text analysis
    text_analysis = analyze_claim_text(claim_json["description"])
    
    # Embedding similarity check
    claim_embed = get_embeddings(claim_json["description"])
    doc_embed = get_embeddings(document_text)
    similarity_score = calculate_similarity(claim_embed, doc_embed)
    
    return {
        "text_analysis": text_analysis,
        "document_similarity": round(similarity_score, 2),
        "combined_risk": "high" if similarity_score < 0.7 or text_analysis["fraud_risk"] == "high" else "medium" if text_analysis["fraud_risk"] == "medium" else "low"
    }

# Example usage
if __name__ == "__main__":
    # Sample insurance document (would normally be your policy document)
    insurance_doc = """Auto insurance policy covering collisions up to $50,000. 
    Requires police reports for claims over $5,000. Excludes vintage vehicles."""

    # Sample claim data
    claim_data = {
        "claim_id": "AUTO-123",
        "amount": 65000,
        "description": "Total loss of vintage 1965 Mustang in single-car collision. No police report available."
    }

    result = assess_fraud(claim_data, insurance_doc)
    
    print("\nFraud Analysis Results:")
    print(f"Text Analysis: {result['text_analysis']}")
    print(f"Document Similarity Score: {result['document_similarity']}")
    print(f"Combined Risk Assessment: {result['combined_risk']}")