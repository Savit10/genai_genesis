from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_cohere import ChatCohere
import json
from dotenv import load_dotenv
import os
from pinecone import Pinecone

load_dotenv()

pinecone_api_key = os.getenv("PINECONE_API_KEY")
if pinecone_api_key is None:
    raise ValueError("PINECONE_API_KEY environment variable is not set")
pc = Pinecone(api_key=pinecone_api_key)

index = pc.Index("genaigenesis")

claim_data = {
  "patient_name": "Michael Lee",
  "policy_number": "POL9988776",
  "policy_coverage": "Hospitalization, Surgery, Medication",
  "treatment_date": "2024-11-15",
  "claim_amount": 14_500,
  "diagnosis_code": "M54.5",
  "treatment_description": "Lower back pain management with outpatient physical therapy and minor injections",
  "policy_expiration_date": "2025-03-01"
}

def validate_form(input_form_data):
    # 👉 Initialize Cohere LLM
    cohere_llm = ChatCohere(cohere_api_key=os.getenv("COHERE_API_KEY"))

    claim_json = json.dumps(input_form_data)

    embeddings = pc.inference.embed(
        model="multilingual-e5-large",
        inputs = claim_json,
        parameters={"input_type": "query"}
    )

    # Step 2: Search Pinecone for relevant data
    search_results = index.query(
        namespace="insurance_policy",
        vector=embeddings.get("data")[0]["values"],
        top_k=3, 
        include_metadata=True
    )
    
    retrieved_policies = "\n\n".join(
        [res["metadata"]['content'] for res in search_results["matches"]]
    )

    validation_prompt = PromptTemplate.from_template("""
        You are an expert insurance claim validator.  
        Below is an insurance claim JSON:
        {claim_json}

        Here are relevant policy guideline excerpts:
        {retrieved_policies}

        Please check:
        1. Is the policy number present and well-formed?  
        2. Is the policy active on the treatment date?  
        3. Does the diagnosis code match the treatment description?  
        4. Is the claim amount reasonable according to the policy guidelines?  
        5. Does the policy coverage support this treatment?  
        6. Is there anything suspicious or unusual given these policies?

        For each check, answer Yes/No with a brief explanation.  
        Finally, recommend one of: APPROVE, FLAG, or DENY — and explain why.
    """)
    
    validation_chain = LLMChain(llm=cohere_llm, prompt=validation_prompt)
    
    # Get the validation result and return it
    result = validation_chain.run({"claim_json": claim_json, "retrieved_policies": retrieved_policies})
    return result  # Make sure we're returning the actual validation text
    
    