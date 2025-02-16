# services/gemini_service.py
"""
Purpose:
    Provides a simple wrapper around the Gemini API call, abstracting away
    the underlying client implementation. This module is responsible for sending
    prompts to Gemini and returning the response text.

Inputs:
    - prompt (str): The prompt to be sent to the Gemini API.

Outputs:
    - A string containing the response from the Gemini API (trimmed of extra whitespace).

Guardrails:
    - Expects the environment variable GEMINI_API_KEY to be set.
    - Any errors from the underlying client are propagated to the caller.
"""
import os
# import dotenv
from google import genai

# try fetching the API key from the environment
# if not found, use the fallback value
# try:
#     API_KEY = os.environ["GEMINI_API_KEY"]
# except :
#     dotenv.load_dotenv()
#     API_KEY = os.getenv("GEMINI_API_KEY")

API_KEY = os.environ["GEMINI_API_KEY"]

# Create a new client instance using the API key.
client = genai.Client(api_key=API_KEY)

def call_gemini(prompt: str) -> str:
    """
    Sends a prompt to the Gemini API as a new conversation and returns the generated content.

    Parameters:
        prompt (str): The prompt text to send.

    Returns:
        str: The trimmed response text from Gemini.
    """
    # Create a new chat conversation for each API call.
    chat = client.chats.create(model="gemini-2.0-flash")

    # Send the prompt as a message in this fresh conversation.
    response = chat.send_message(prompt)

    # Return the trimmed response text.
    return response.text.strip()