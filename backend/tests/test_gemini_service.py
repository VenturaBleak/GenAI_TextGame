# ./backend/tests/test_gemini_service.py

import sys
import os
# Add the project's root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from dotenv import load_dotenv

# Load environment variables from .env (assumes .env is in the project root)
load_dotenv()

from services.gemini_service import call_gemini


class TestGeminiServiceIntegration(unittest.TestCase):
    def test_call_gemini_integration(self):
        # Retrieve the API key (it should now be loaded from the .env file)
        api_key = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY")
        if api_key == "YOUR_API_KEY":
            self.fail("GEMINI_API_KEY is not set. Please set it in your environment or .env file.")

        prompt = "This is a test. Answer with 'This is a test.'."
        result = call_gemini(prompt)

        # Adjust the expected output as needed.
        self.assertEqual(result, "This is a test.", "The Gemini service did not return the expected response.")


if __name__ == '__main__':
    unittest.main()