# ./backend/tests/test_api.py
import sys
import os
import unittest

# Add the project's root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app import app  # Assumes your updated app.py is in the project root

client = TestClient(app)

class TestAPINarrative(unittest.TestCase):
    def test_initial_narrative(self):
        # Test the 'initial' stage endpoint.
        response = client.post("/api/narrative", json={"stage": "initial"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("stage"), "initial")
        self.assertIn("situation", data)
        self.assertIn("choices", data)

    def test_round_narrative(self):
        # Test the 'round' stage endpoint.
        payload = {
            "stage": "round",
            "narrative_context": "Test context",
            "action": "Test action",
            "outcome_value": 1,
            "action_confirming_sentence": "Action confirmed"
        }
        response = client.post("/api/narrative", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("stage"), "round")
        self.assertIn("confirming_sentence", data)
        self.assertIn("situation", data)
        self.assertIn("choices", data)

    def test_final_narrative(self):
        # Test the 'final' stage endpoint.
        payload = {
            "stage": "final",
            "narrative_context": "Test final context",
            "win_or_loss": "win"
        }
        response = client.post("/api/narrative", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("stage"), "final")
        self.assertIn("confirming_sentence", data)
        self.assertIn("situation", data)

if __name__ == '__main__':
    unittest.main()