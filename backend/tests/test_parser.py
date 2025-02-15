import sys
import os
# Add the project's root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from utils.parser import parse_narrative_response

class TestUnifiedParser(unittest.TestCase):

    def test_initial_valid(self):
        response = (
            "SITUATION: Follow the white rabbit. A mysterious alley in the rain.\n"
            "ACTION 1: Enter the alley.\n"
            "ACTION 1 CONFIRM: You step forward into the darkness.\n"
            "ACTION 2: Walk away.\n"
            "ACTION 2 CONFIRM: You decide to stay safe."
        )
        # The regex pattern as defined in the JSON config for the "initial" stage.
        pattern = r"SITUATION:\s*Follow the white rabbit\.\s*(.*?)\s*\nACTION 1:\s*(.*?)\s*\nACTION 1 CONFIRM:\s*(.*?)\s*\nACTION 2:\s*(.*?)\s*\nACTION 2 CONFIRM:\s*(.*)$"
        parsed = parse_narrative_response(response, "initial", pattern)

        print(parsed)

        self.assertIn("situation", parsed)
        self.assertIn("choices", parsed)
        self.assertEqual(parsed["situation"], "A mysterious alley in the rain.")
        self.assertEqual(len(parsed["choices"]), 2)
        self.assertEqual(parsed["choices"][0]["id"], 1)
        self.assertEqual(parsed["choices"][1]["id"], 2)

    def test_round_valid(self):
        response = (
            "CONFIRMING SENTENCE: You hesitantly take the left turn.\n"
            "SITUATION: The street twists into a labyrinth under neon glow.\n"
            "ACTION 1: Turn left.\n"
            "ACTION 1 CONFIRM: You boldly step into the unknown.\n"
            "ACTION 2: Turn right.\n"
            "ACTION 2 CONFIRM: You choose a safer path."
        )
        pattern = r"CONFIRMING SENTENCE:\s*(.*?)\s*\nSITUATION:\s*(.*?)\s*\nACTION 1:\s*(.*?)\s*\nACTION 1 CONFIRM:\s*(.*?)\s*\nACTION 2:\s*(.*?)\s*\nACTION 2 CONFIRM:\s*(.*)$"
        parsed = parse_narrative_response(response, "round", pattern)

        self.assertIn("confirming_sentence", parsed)
        self.assertEqual(parsed["confirming_sentence"], "You hesitantly take the left turn.")
        self.assertIn("situation", parsed)
        self.assertIn("choices", parsed)
        self.assertEqual(len(parsed["choices"]), 2)

    def test_final_valid(self):
        response = (
            "CONFIRMING SENTENCE: You accept your fate.\n"
            "SITUATION: The world crumbles as you face the end."
        )
        pattern = r"CONFIRMING SENTENCE:\s*(.*?)\s*\nSITUATION:\s*(.*)$"
        parsed = parse_narrative_response(response, "final", pattern)

        self.assertIn("confirming_sentence", parsed)
        self.assertEqual(parsed["confirming_sentence"], "You accept your fate.")
        self.assertIn("situation", parsed)
        self.assertEqual(parsed["situation"], "The world crumbles as you face the end.")

    def test_invalid_response(self):
        response = "This response does not match the expected format."
        pattern = r"SITUATION:\s*Follow the white rabbit\.\s*(.*?)\s*\nACTION 1:\s*(.*?)\s*\nACTION 1 CONFIRM:\s*(.*?)\s*\nACTION 2:\s*(.*?)\s*\nACTION 2 CONFIRM:\s*(.*)$"
        with self.assertRaises(ValueError):
            parse_narrative_response(response, "initial", pattern)


if __name__ == '__main__':
    unittest.main()