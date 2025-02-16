import os
import json
from services.gemini_service import call_gemini
from utils.parser import parse_narrative_response

# Load prompt templates and regex patterns from the JSON configuration file.
CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config', 'prompts.json')

with open(CONFIG_PATH, 'r') as f:
    PROMPT_CONFIG = json.load(f)

def generate_narrative(
    stage: str,
    narrative_context: str = "",
    action: str = "",
    outcome_value: int = 0,
    action_confirming_sentence: str = "",
    win_or_loss: str = "",
    language: str = "German"   # New parameter
) -> dict:
    """
    Unified narrative generator function.

    This function calls the Gemini API to generate narrative content based on the stage
    of the narrative, then parses the output ensuring it conforms to a predefined format.

    Arguments (mutually exclusive rules):
        - stage (str): Must be one of "initial", "round", or "final".
            * "initial": Uses the first round prompt. **No additional parameters are required**.
            * "round": Uses the round prompt. Requires:
                - narrative_context (str): The current narrative context (can be blank).
                - action (str): The player's chosen action (can be blank).
                - outcome_value (int): The numeric outcome associated with the action.
                - action_confirming_sentence (str): The confirming sentence for the action.
              **Parameter win_or_loss is ignored.**
            * "final": Uses the final wrapping prompt. Requires:
                - narrative_context (str): The complete narrative context.
                - win_or_loss (str): Either "win" or "loss" (case-insensitive).
              **Parameters action, outcome_value, and action_confirming_sentence are ignored.**

    Expected Output Format:

        For "initial" stage:
            {
                "situation": <str>,  // Vivid description after "Follow the white rabbit."
                "choices": [
                    {
                        "id": 1,
                        "choice_description": <str>, // Description for action option 1.
                        "confirming_sentence": <str>, // Confirming sentence for action 1.
                        "outcome": "positive"
                    },
                    {
                        "id": 2,
                        "choice_description": <str>, // Description for action option 2.
                        "confirming_sentence": <str>, // Confirming sentence for action 2.
                        "outcome": "negative"
                    }
                ]
            }

        For "round" stage:
            {
                "confirming_sentence": <str>, // The initial confirming sentence.
                "situation": <str>,           // Vivid description of the new situation.
                "choices": [
                    {
                        "id": 1,
                        "choice_description": <str>,
                        "confirming_sentence": <str>,
                        "outcome": "positive"
                    },
                    {
                        "id": 2,
                        "choice_description": <str>,
                        "confirming_sentence": <str>,
                        "outcome": "negative"
                    }
                ]
            }

        For "final" stage:
            {
                "confirming_sentence": <str>, // The final confirming sentence.
                "situation": <str>            // Vivid description of the final situation.
            }

    Self-explanatory and mutually exclusive rules:
        - For "initial", do not supply narrative_context, action, outcome_value, action_confirming_sentence, or win_or_loss.
        - For "round", win_or_loss is ignored.
        - For "final", only narrative_context and win_or_loss are used; other parameters are ignored.

    Returns:
        dict: Parsed narrative data conforming to the above format.
    """
    # Map stage to the corresponding config key.
    if stage == "initial":
        config_key = "first_round_context"
    elif stage == "round":
        config_key = "round_context"
    elif stage == "final":
        config_key = "final_wrapping"
    else:
        raise ValueError("Invalid stage. Must be one of 'initial', 'round', or 'final'.")

    prompt_template = PROMPT_CONFIG[config_key]["prompt"]
    regex_pattern = PROMPT_CONFIG[config_key]["regex"]

    # Format the prompt based on the stage.
    if stage == "initial":
        prompt = prompt_template.format(language=language)
    elif stage == "round":
        prompt = prompt_template.format(
        narrative_context=narrative_context,
        action=action,
        outcome_value=outcome_value,
        action_confirming_sentence=action_confirming_sentence,
        language=language  # Passing the new parameter
        )
    elif stage == "final":
        prompt = prompt_template.format(
            narrative_context=narrative_context,
            win_or_loss=win_or_loss,
            language=language  # Passing the new parameter
        )

    # Call the Gemini API.
    raw_response = call_gemini(prompt)
    
    # Parse the raw response using the unified parser (with the provided regex pattern).
    parsed_data = parse_narrative_response(raw_response, stage, regex_pattern)

    # Assertions to ensure the parsed output is in the predefined format.
    if stage in ("initial", "round"):
        assert "situation" in parsed_data, "Parsed narrative missing 'situation'"
        assert "choices" in parsed_data, "Parsed narrative missing 'choices'"
        assert isinstance(parsed_data["choices"], list) and len(parsed_data["choices"]) == 2, "Expected exactly two choices"
        for choice in parsed_data["choices"]:
            assert "id" in choice, "Choice missing 'id'"
            assert "choice_description" in choice, "Choice missing 'choice_description'"
            assert "confirming_sentence" in choice, "Choice missing 'confirming_sentence'"
            assert "outcome" in choice, "Choice missing 'outcome'"
    elif stage == "final":
        assert "confirming_sentence" in parsed_data, "Parsed final narrative missing 'confirming_sentence'"
        assert "situation" in parsed_data, "Parsed final narrative missing 'situation'"

    return parsed_data