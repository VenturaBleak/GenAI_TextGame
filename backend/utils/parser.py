import re


def parse_narrative_response(response: str, stage: str, pattern: str) -> dict:
    """
    Unified parser for narrative responses from the Gemini API.

    Parameters:
        response (str): The raw API response.
        stage (str): One of "initial", "round", or "final".
        pattern (str): The regex pattern corresponding to the prompt template as defined in the config JSON.
                       The pattern must contain capturing groups in the following order:

            For "initial":
                Group 1: Situation (description after "SITUATION: Follow the white rabbit.")
                Group 2: ACTION 1 (first action option)
                Group 3: ACTION 1 CONFIRM (confirming sentence for action 1)
                Group 4: ACTION 2 (second action option)
                Group 5: ACTION 2 CONFIRM (confirming sentence for action 2)

            For "round":
                Group 1: CONFIRMING SENTENCE (the initial confirming sentence)
                Group 2: Situation (vivid description of the new situation)
                Group 3: ACTION 1 (first action option)
                Group 4: ACTION 1 CONFIRM (confirming sentence for action 1)
                Group 5: ACTION 2 (second action option)
                Group 6: ACTION 2 CONFIRM (confirming sentence for action 2)

            For "final":
                Group 1: CONFIRMING SENTENCE (the final confirming sentence)
                Group 2: Situation (vivid description of the final situation)

    Returns:
        dict: Parsed narrative data following the predefined format.

    Raises:
        ValueError: If the response does not match the expected format.
    """
    match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
    if not match:
        raise ValueError(f"{stage.capitalize()} narrative response format invalid. Received response:\n{response}")

    if stage == "initial":
        situation = match.group(1).strip()
        action1 = match.group(2).strip()
        action1_confirm = match.group(3).strip()
        action2 = match.group(4).strip()
        action2_confirm = match.group(5).strip()
        parsed = {
            "situation": situation,
            "choices": [
                {"id": 1, "choice_description": action1, "confirming_sentence": action1_confirm, "outcome": "positive"},
                {"id": 2, "choice_description": action2, "confirming_sentence": action2_confirm, "outcome": "negative"}
            ]
        }
    elif stage == "round":
        confirming_sentence = match.group(1).strip()
        situation = match.group(2).strip()
        action1 = match.group(3).strip()
        action1_confirm = match.group(4).strip()
        action2 = match.group(5).strip()
        action2_confirm = match.group(6).strip()
        parsed = {
            "confirming_sentence": confirming_sentence,
            "situation": situation,
            "choices": [
                {"id": 1, "choice_description": action1, "confirming_sentence": action1_confirm, "outcome": "positive"},
                {"id": 2, "choice_description": action2, "confirming_sentence": action2_confirm, "outcome": "negative"}
            ]
        }
    elif stage == "final":
        confirming_sentence = match.group(1).strip()
        situation = match.group(2).strip()
        parsed = {
            "confirming_sentence": confirming_sentence,
            "situation": situation
        }
    else:
        raise ValueError("Invalid stage provided to parser. Use 'initial', 'round', or 'final'.")

    # Additional assertions on parsed output.
    if stage in ("initial", "round"):
        assert isinstance(parsed, dict), "Parsed output should be a dictionary."
        assert "situation" in parsed, "Parsed output missing 'situation'"
        assert "choices" in parsed, "Parsed output missing 'choices'"
        assert isinstance(parsed["choices"], list) and len(parsed["choices"]) == 2, "There must be exactly two choices"
        for choice in parsed["choices"]:
            assert "id" in choice, "Choice missing 'id'"
            assert "choice_description" in choice, "Choice missing 'choice_description'"
            assert "confirming_sentence" in choice, "Choice missing 'confirming_sentence'"
            assert "outcome" in choice, "Choice missing 'outcome'"
    elif stage == "final":
        assert isinstance(parsed, dict), "Parsed output should be a dictionary."
        assert "confirming_sentence" in parsed, "Parsed output missing 'confirming_sentence'"
        assert "situation" in parsed, "Parsed output missing 'situation'"

    return parsed