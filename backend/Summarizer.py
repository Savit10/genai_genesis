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

data = {
  "MEDICAID\n(Medicaid#)": "",
  "CHAMPVA\n(Member ID#": "",
  "FECABLKLUNG(10#)": "",
  "TRICARE\n(ID#/000#)": "",
  "YES": "☑",
  "GROUPHEALTH PLAN(10#)": "",
  "NO": "☑",
  "Other": "",
  "OTHER (ID#)": "",
  "Spouse": "",
  "Child": "",
  "MEDICARE\n(Medicare)": "X",
  "TELEPHONE (Include Area Code)": "(12) 4213423432",
  "28. TOTAL CHARGE": "0.00\n$",
  "Self": "",
  "5. PATIENT'S ADDRESS (No., Street)": "Sunview Waterloo",
  "10d. CLAIM CODES (Designated by NUCC)": "12412321",
  "TELEPHONE (Indude Area Code)": "( 1 )342412",
  "2. PATIENT'S NAME (Last Name, First Name, Middle Initial)": "Lol Singh",
  "d. INSURANCE PLAN NAME OR PROGRAM NAME": "213123",
  "c. RESERVED FOR NUCCUSE": "122112",
  "DATE": "22/03/2025",
  "b. RESERVED FOR NUCC USE": "123123",
  "b. OTHER CLAIM ID (Designated by NUCC)": "123453",
  "STATE": "ON",
  "ZIP CODE": "7129",
  "C. INSURANCE PLAN NAME OR PROGRAM NAME": "Insurers United",
  "a. OTHER INSURED'S POLICY OR GROUP NUMBER": "14234321",
  "7. INSURED'S ADDRESS (No., Street)": "Sunview Waterloo",
  "4. INSURED'S NAME (Last Name, First Name, Middle Initial)": "Lols",
  "1a. INSURED'S I.D. NUMBER": "(For Program in Item 1)\n12432423",
  "29. AMOUNT PAID": "$",
  "CITY": "Sunview Waterloo",
  "N\nNO": "☐",
  "SIGNED": "AK",
  "11. INSURED'S POLICY GROUP OR FECA NUMBER": "12312412",
  "DD": "04",
  "17a.": "17b NPI",
  "M": "X",
  "14. DATE OF CURRENT ILLNESS, INJURY, or PREGNANCY (LMP)": "MM DDYY\nQUAL.",
  "MM": "IN CURRENT TO",
  "YY": "OF BIRTH2005",
  "18. HOSPITALIZATION DATES RELATED TO CURRENT SERVICES": "YYMM DDΤΟ",
  "FROM": "MM DĎ18. HOSPITALIZATION",
  "F": ""
}

# Convert JSON to string in a readable format
stringified = "\n".join([f"{key}: {value}" for key, value in data.items() if value.strip() != ""])

print(summarize(stringified))