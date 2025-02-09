import re

def parse_initial_setting(response: str) -> dict:
    """
    Extracts the situation from the initial Gemini response.

    Expected format (or similar):
      SITUATION: Follow the white rabbit. <vivid description of the new setting>

    Returns:
        dict: A dictionary with keys:
              - "situation": (str) the extracted situation.
              - "choices": an empty list (for consistency with round responses).

    Raises:
        ValueError: If the response does not contain a proper "SITUATION:" line.
    """
    # Adjusted regex to include a literal dot and allow whitespace after it.
    pattern = (
        r"SITUATION:\s*Follow the white rabbit\.\s*(.*?)\n"
        r"ACTION 1:\s*(.*?)\s*\n"
        r"ACTION 1 CONFIRM:\s*(.*?)\s*\n"
        r"ACTION 2:\s*(.*?)\s*\n"
        r"ACTION 2 CONFIRM:\s*(.*)$"
    )
    match = re.search(pattern, response, re.DOTALL | re.MULTILINE | re.IGNORECASE)
    if match:
        situation = match.group(1).strip()
        action1 = match.group(2).strip()
        action1_confirm = match.group(3).strip()
        action2 = match.group(4).strip()
        action2_confirm = match.group(5).strip()
    else:
        expected_format = (
            "Expected format:\n"
            "  SITUATION: <vivid description of the new situation>\n"
            "  ACTION 1: <first action option>\n"
            "  ACTION 1 CONFIRM: <confirming sentence for action 1>\n"
            "  ACTION 2: <second action option>\n"
            "  ACTION 2 CONFIRM: <confirming sentence for action 2>"
        )
        raise ValueError(
            "Round response error: missing required fields.\n"
            f"{expected_format}\n"
            "Received:\n"
            f"{response}"
        )

    choices = [
        {"id": 1, "choice_description": action1, "confirming_sentence": action1_confirm, "outcome": "positive"},
        {"id": 2, "choice_description": action2, "confirming_sentence": action2_confirm, "outcome": "negative"}
    ]
    return {"situation": situation, "choices": choices}

def parse_round_response(response: str) -> dict:
    """
    Parses a Gemini API response for a round that includes a situation and two choices.

    Expected format:
      SITUATION: <vivid description of the new situation>
      ACTION 1: <first action option>
      ACTION 1 CONFIRM: <confirming sentence for action 1>
      ACTION 2: <second action option>
      ACTION 2 CONFIRM: <confirming sentence for action 2>

    Returns:
        dict: A dictionary with keys:
              - "situation": (str) the new situation description.
              - "choices": (list) two choice dictionaries, each with:
                   "id": 1 or 2,
                   "choice_description": the action text,
                   "confirming_sentence": the confirming sentence,
                   "outcome": "positive" for ACTION 1 and "negative" for ACTION 2.

    Raises:
        ValueError: If the response does not contain all required fields.
                 The error message includes the expected format and the received response.
    """
    import re

    pattern = (
        r"SITUATION:\s*(.*?)\s*\n"
        r"ACTION 1:\s*(.*?)\s*\n"
        r"ACTION 1 CONFIRM:\s*(.*?)\s*\n"
        r"ACTION 2:\s*(.*?)\s*\n"
        r"ACTION 2 CONFIRM:\s*(.*)$"
    )
    match = re.search(pattern, response, re.DOTALL | re.MULTILINE | re.IGNORECASE)
    if match:
        situation = match.group(1).strip()
        action1 = match.group(2).strip()
        action1_confirm = match.group(3).strip()
        action2 = match.group(4).strip()
        action2_confirm = match.group(5).strip()
    else:
        expected_format = (
            "Expected format:\n"
            "  SITUATION: <vivid description of the new situation>\n"
            "  ACTION 1: <first action option>\n"
            "  ACTION 1 CONFIRM: <confirming sentence for action 1>\n"
            "  ACTION 2: <second action option>\n"
            "  ACTION 2 CONFIRM: <confirming sentence for action 2>"
        )
        raise ValueError(
            "Round response error: missing required fields.\n"
            f"{expected_format}\n"
            "Received:\n"
            f"{response}"
        )

    choices = [
        {"id": 1, "choice_description": action1, "confirming_sentence": action1_confirm, "outcome": "positive"},
        {"id": 2, "choice_description": action2, "confirming_sentence": action2_confirm, "outcome": "negative"}
    ]
    return {"situation": situation, "choices": choices}

def parse_final_wrapping(response: str) -> str:
    """
    Extracts the final wrapping from the Gemini response.

    Expected format:
      FINAL WRAPPING: <final narrative wrapping>

    Returns:
        str: The extracted final wrapping.

    Raises:
        ValueError: If the response does not contain the expected "FINAL WRAPPING:" line.
    """
    import re

    pattern = (
        r"SITUATION:\s*(.*?)\s*\n"
    )

    match = re.search(pattern, response, re.DOTALL | re.MULTILINE | re.IGNORECASE)


    if match:
        situation = match.group(1).strip()
    else:
        expected_format = (
            "Expected format:\n"
            "  SITUATION: <vivid description of the new situation>\n"
        )
        raise ValueError(
            "Round response error: missing required fields.\n"
            f"{expected_format}\n"
            "Received:\n"
            f"{response}"
        )
    return situation