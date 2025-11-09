from dotenv import load_dotenv
import os

# Load variables from .env file
load_dotenv()

bearer_token = os.getenv("BEARER_TOKEN")
api_key = os.getenv("API_KEY")
api_secret = os.getenv("API_SECRET")
access_token = os.getenv("ACCESS_TOKEN")
access_token_secret = os.getenv("ACCESS_TOKEN_SECRET")
openai_key = os.getenv("OPENAI_KEY")