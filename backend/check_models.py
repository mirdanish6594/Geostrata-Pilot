import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    print("Error: GOOGLE_API_KEY not found in .env")
else:
    genai.configure(api_key=api_key)
    print("Checking available models for your API key...")
    try:
        count = 0
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
                count += 1
        if count == 0:
            print("No Chat models found! You might need to enable the API in Google Cloud Console.")
    except Exception as e:
        print(f"Error listing models: {e}")