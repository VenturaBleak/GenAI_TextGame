"""
services/narrative_service.py

Purpose:
    Provides services for generating narrative rounds and the final wrapping.
    This module constructs prompts (based on the current narrative context and user choice),
    calls the Gemini API, parses the response (using the parser utility), and returns structured data for the game round.

Inputs:
    - For generate_round_context:
         narrative_context (str): The current narrative context.
         action (str): The action chosen by the player (default "Initial narrative").
         outcome_value (int): The score delta associated with the action.
         action_confirming_sentence (str): An optional confirming sentence.
    - For generate_final_wrapping:
         narrative_context (str): The complete narrative so far.
         final_score (int): The final score.

Outputs:
    - For generate_round_context: A dictionary containing:
         "situation": The new situation description.
         "choices": A list of two choice objects (each with id, choice_description, action_confirming_sentence, and outcome).
    - For generate_final_wrapping: A string representing the final narrative wrapping.

Guardrails:
    - Prompts are constructed to adhere strictly to the expected format.
    - The Gemini API response is parsed using the parser utility.
"""

from services.gemini_service import call_gemini
from utils.parser import parse_round_response, parse_initial_setting
from utils.debug import debug_print_gemini

def generate_first_round_context() -> dict:
    prompt = (
        "You are a master storyteller in a dark, dystopian world. "
        "Your goal is to captivate the player instantly. Begin with the command: 'Follow the white rabbit.' "
        "Address the player directly, pulling them into the setting with an immediate sense of urgency and intrigue. "
        "Describe the world vividly—concrete, atmospheric, and immersive. "
        "Focus on sensory details: what the player sees, hears, feels, or even smells. "
        "The setting should feel alive, oppressive, or mysterious, drawing the player deeper into the experience. "
        "Avoid unnecessary exposition or explanations. Let the world speak for itself through raw, evocative imagery."
        "Then, provide two distinct action options for the player to choose from, each with a confirming sentence. "
        "Make the choices tough, include moral dilemmas, and unexpected yet realistic twists to keep the player engaged."
        "KEEP IT SHORT, CONCISE, FAST-PACED, AND ENGAGING WITH ENOUGH CONTEXT TO BE SELF-EXPLANATORY / RELATABLE.!"
        "\n""\n"
        "Output strictly in the following format, these and nothing else:\n"
        "SITUATION: Follow the white rabbit. <Short, gripping description of the context and situation>\n"
        "ACTION 1: <First action option>\n"
        "ACTION 1 CONFIRM: <Confirming sentence for action 1>\n"
        "ACTION 2: <Second action option>\n"
        "ACTION 2 CONFIRM: <Confirming sentence for action 2>\n"
        "Each CONFIRM sentence should be written in the present tense, e.g., "
        "'You decide to stop moving and feign interest in the old advertisement to your right.' "
    )
    raw_response = call_gemini(prompt)
    # Parse the initial setting into a dictionary.
    parsed_data = parse_initial_setting(raw_response)
    # Parse the round response into a dictionary.
    debug_print_gemini(prompt, raw_response, parsed_data)
    return parsed_data

def generate_round_context(narrative_context: str, action: str = "Initial narrative",
                           outcome_value: int = 0, action_confirming_sentence: str = "") -> dict:
    prompt = (
        "You are a creative storyteller. Below is the current narrative context:\n"
        f"{narrative_context}\n\n"
        "The player has chosen the following action:\n"
        f"Action: {action}\nOutcome: {outcome_value:+d}\n"
        f"LATEST CONFIRMING SENTENCE: {action_confirming_sentence}\n\n"
        "Now, generate a present-tense narrative that directly starts with the LATEST CONFIRMING SENTENCE,following the player's decision. "
        "Make sure to make the player feel the consequences of their choice. Make the world feel alive and reactive to the player's actions. "
        "Make the choices tough, include moral dilemmas, and unexpected yet realistic twists to keep the player engaged. "
        "Keep it rough, gritty, and immersive—appealing to raw instincts and deep emotions. "
        "Let innocence, fear, guilt, love, hate, and desire collide, depending on the outcome of the choice. "
        "The player should be forced to confront the weight of their choice in real time."
        "KEEP IT SHORT, CONCISE, FAST-PACED, AND ENGAGING WITH ENOUGH CONTEXT TO BE SELF-EXPLANATORY / RELATABLE.!"
        "\n\n"
        "Output must strictly follow this format:\n\n"
        "CONFIRMING SENTENCE: <Present-tense confirming sentence>\n"
        "SITUATION: <Vivid description of the new situation>\n"
        "ACTION 1: <First action option>\n"
        "ACTION 1 CONFIRM: <Confirming sentence for action 1>\n"
        "ACTION 2: <Second action option>\n"
        "ACTION 2 CONFIRM: <Confirming sentence for action 2>\n"
        "As an example, the CONFIRMATION line should be written in the present tense, e.g., "
        "'You decide to stop moving and feign interest in the old advertisement to your right.'\n\n"
    )
    raw_response = call_gemini(prompt)
    parsed_data = parse_round_response(raw_response)
    # Print Gemini-specific debug info.
    debug_print_gemini(prompt, raw_response, parsed_data)
    return parsed_data

def generate_final_wrapping(narrative_context: str, final_score: int) -> str:
    prompt = (
        "You are a master storyteller concluding a dramatic tale. "
        "Below is the complete narrative so far:\n\n"
        f"{narrative_context}\n\n"
        "Now deliver a fast-paced, emotionally charged ending that acknowledges the player's role in every twist. "
        "The conclusion should be a crescendo of tension, revealing the full impact of the player's choices. "
        "End with a final, powerful image that leaves the player breathless and eager for more. "
        "Depending on the final score, the ending should be either a triumphant climax or a devastating fall from grace. "
        "Don't hold back in brutality, brutal honesty and raw emotion.\n\n"
    )
    raw_response = call_gemini(prompt)
    # Print Gemini-specific debug info.
    debug_print_gemini(prompt, raw_response, raw_response)
    return raw_response