from __future__ import print_function

import os.path
import os  # for creating directories
import cohere
from dotenv import load_dotenv

load_dotenv()
co = cohere.ClientV2(api_key=os.getenv("COHERE_API_KEY"))


from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import email
import base64 #add Base64
import time 

# Update scope to include modify permission
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']


def mark_as_read(service, msg_id):
    try:
        # Remove UNREAD label from the message
        service.users().messages().modify(
            userId='me',
            id=msg_id,
            body={'removeLabelIds': ['UNREAD']}
        ).execute()
        print(f"Marked message {msg_id} as read")
    except HttpError as error:
        print(f'An error occurred while marking message as read: {error}')

def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
            
        #Filter and get the IDs of the message I need. 
        #I'm just filtering messages that have the label "UNREAD"

    try:
        service = build('gmail', 'v1', credentials=creds)
        search_id = service.users().messages().list(userId='me', labelIds="UNREAD").execute()
        number_result = search_id['resultSizeEstimate']

        final_list = [] # empty array, all the messages ID will be listed here
        
        # review if the search is empty or not
        # if it has messages on it, It will enter the for

        if number_result>0:
            message_ids = search_id['messages']

            for ids in message_ids:
                msg_id = ids['id']
                final_list.append(msg_id)
                # call the function that will call the body of the message
                get_message(service, msg_id)
                # Mark the message as read
                mark_as_read(service, msg_id)
                
            return final_list
        
        # If there are not messages with those criterias 
        #The message 'There were 0 results for that search string' will be printed. 

        else:
            print('There were 0 results for that search string')
            return ""

    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print(f'An error occurred: {error}')
        
        
        #new function to get the body of the message, and decode the message

def save_attachment(service, msg_id, attachment_id, filename):
    try:
        # Get the attachment
        attachment = service.users().messages().attachments().get(
            userId='me',
            messageId=msg_id,
            id=attachment_id
        ).execute()

        # Decode the attachment data
        file_data = base64.urlsafe_b64decode(attachment['data'].encode('UTF-8'))
        
        # Create 'attachments' directory if it doesn't exist
        if not os.path.exists('attachments'):
            os.makedirs('attachments')
            
        # Save the attachment
        filepath = os.path.join('attachments', filename)
        with open(filepath, 'wb') as f:
            f.write(file_data)
        
        print(f"Saved attachment: {filename}")
        return filepath
    except HttpError as error:
        print(f'An error occurred while saving attachment: {error}')
        return None

def is_insurance_related(text):
    try:
        prompt = "You are a helpful assistant that determines if an email is about an insurance claim. Analyze the following email and respond with ONLY 'yes' or 'no'. Email text: " + text
        print(text)
        # Use Cohere chat to determine if text is insurance-related
        response = co.chat_stream(
            
            messages=[{"role": "user", "content": prompt}],
            #preamble="You are an expert at identifying insurance claim related emails. You must respond with ONLY 'yes' or 'no', with no additional text or explanation.",
            model="command-r-plus-08-2024",
        )
        summary = ""
        for event in response:
            if event.type == "content-delta":
                summary += event.delta.message.content.text
        print(summary)
        return summary.strip().lower() == "yes"
    except Exception as e:
        print(f"Error in Cohere chat: {e}")
        return False

async def process_insurance_document(filepath):
    try:
        import aiohttp
        import aiofiles
        
        async with aiofiles.open(filepath, 'rb') as f:
            file_content = await f.read()
            
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'http://localhost:8000/upload',
                data={'file': (os.path.basename(filepath), file_content, 'application/pdf')}
            ) as response:
                if response.status == 200:
                    print(f"Successfully processed {filepath}")
                    return await response.json()
                else:
                    print(f"Error processing {filepath}: {response.status}")
                    return None
    except Exception as e:
        print(f"Error sending file to API: {e}")
        return None

def get_message(service, msg_id):
    try:
        message_list = service.users().messages().get(userId='me', id=msg_id, format='raw').execute()
        msg_raw = base64.urlsafe_b64decode(message_list['raw'].encode('ASCII'))
        msg_str = email.message_from_bytes(msg_raw)
        
        # Get full message details for attachments
        message_detail = service.users().messages().get(userId='me', id=msg_id).execute()
        
        content_types = msg_str.get_content_maintype()
        saved_attachments = []
        email_body = ""
        
        if content_types == 'multipart':
            parts = msg_str.get_payload()
            for part in parts:
                content_type = part.get_content_type()
                
                # Handle text content first
                if content_type == 'text/html' or content_type == 'text/plain':
                    payload = part.get_payload()
                    if isinstance(payload, str):  # Direct string payload
                        if part.get('Content-Transfer-Encoding') == 'base64':
                            payload = base64.b64decode(payload).decode('utf-8')
                        email_body += payload
                
                # Then handle attachments
                if part.get_filename():
                    for payload in message_detail['payload'].get('parts', []):
                        if payload.get('filename') == part.get_filename():
                            if 'body' in payload and 'attachmentId' in payload['body']:
                                attachment_id = payload['body']['attachmentId']
                                filepath = save_attachment(service, msg_id, attachment_id, part.get_filename())
                                if filepath:
                                    saved_attachments.append(filepath)
        else:
            payload = msg_str.get_payload()
            if msg_str.get('Content-Transfer-Encoding') == 'base64':
                payload = base64.b64decode(payload).decode('utf-8')
            email_body = payload
        
        # Check if email is insurance-related
        if is_insurance_related(email_body):
            print("Insurance-related email detected, processing attachments...")
            import asyncio
            for attachment_path in saved_attachments:
                if attachment_path.lower().endswith('.pdf'):
                    # Process the PDF through your FastAPI endpoint
                    result = asyncio.run(process_insurance_document(attachment_path))
                    print(f"Processing result: {result}")
        
        return {
            'body': email_body,
            'attachments': saved_attachments,
        }

    except HttpError as error:
        print(f'An error occurred: {error}')
        return None


if __name__ == '__main__':
    main()
