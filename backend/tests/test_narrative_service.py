import sys
import os
# Add the project's root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from unittest.mock import patch
from services.narrative_service import generate_narrative

class TestNarrativeService(unittest.TestCase):

    @patch("services.narrative_service.call_gemini")
    def test_generate_initial(self, mock_call_gemini):
        # Simulated valid response for the "initial" stage.
        mock_call_gemini.return_value = (
            "SITUATION: Follow the white rabbit. A mysterious alley in the rain.\n"
            "ACTION 1: Enter the alley.\n"
            "ACTION 1 CONFIRM: You step forward into the darkness.\n"
            "ACTION 2: Walk away.\n"
            "ACTION 2 CONFIRM: You decide to stay safe."
        )
        result = generate_narrative(stage="initial")
        self.assertIn("situation", result)
        self.assertIn("choices", result)
        self.assertEqual(len(result["choices"]), 2)

    @patch("services.narrative_service.call_gemini")
    def test_generate_round(self, mock_call_gemini):
        mock_call_gemini.return_value = (
            "CONFIRMING SENTENCE: You hesitantly take the left turn.\n"
            "SITUATION: The street twists into a labyrinth under neon glow.\n"
            "ACTION 1: Turn left.\n"
            "ACTION 1 CONFIRM: You boldly step into the unknown.\n"
            "ACTION 2: Turn right.\n"
            "ACTION 2 CONFIRM: You choose a safer path."
        )
        result = generate_narrative(
            stage="round",
            narrative_context="Some context",
            action="Test action",
            outcome_value=5,
            action_confirming_sentence="Action confirmed."
        )
        self.assertIn("confirming_sentence", result)
        self.assertIn("situation", result)
        self.assertIn("choices", result)
        self.assertEqual(len(result["choices"]), 2)

    @patch("services.narrative_service.call_gemini")
    def test_generate_final(self, mock_call_gemini):
        mock_call_gemini.return_value = (
            "CONFIRMING SENTENCE: You accept your fate.\n"
            "SITUATION: The world crumbles as you face the end."
        )
        result = generate_narrative(
            stage="final",
            narrative_context="Complete narrative context",
            win_or_loss="win"
        )
        self.assertIn("confirming_sentence", result)
        self.assertIn("situation", result)

if __name__ == '__main__':
    unittest.main()