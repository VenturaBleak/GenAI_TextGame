# utils/debug.py
"""
Purpose:
    Provides debugging utilities for the backend.

    This module supports two independent debug modes:
      1) Gemini Debug:
         - Prints details for each Gemini API call.
         - Displays the full prompt text, the raw response, and the parsed response.
      2) State Debug:
         - Prints extra information about API endpoint execution and game state.

    Both modes can be enabled independently via environment variables.
      - Set DEBUG_GEMINI to "yes" to enable Gemini debug prints.
      - Set DEBUG_STATE to "yes" to enable API state debug prints.
"""

import os

DEBUG_GEMINI = os.environ.get("DEBUG_GEMINI", "yes").lower() == "yes"
DEBUG_STATE = os.environ.get("DEBUG_STATE", "yes").lower() == "yes"

def debug_print_gemini(prompt: str, raw_response: str, parsed_response: str):
    """
    Prints debugging information for Gemini API calls.
    This includes the full prompt, the raw response, and the parsed response.
    """
    if DEBUG_GEMINI:
        print("\n==== GEMINI DEBUG ====")
        print("-" * 40)
        print("FULL PROMPT:")
        print(prompt)
        print("-" * 40)
        print("RAW RESPONSE:")
        print(raw_response)
        print("-" * 40)
        print("PARSED RESPONSE:")
        print(parsed_response)
        print("\n==== End of Gemini Debug ====\n")
        print("-" * 40)

def debug_print_state(message: str, extra_info: dict = None):
    """
    Prints additional API state debugging information.
    """
    if DEBUG_STATE:
        print("\n==== API STATE DEBUG ====")
        print(message)
        if extra_info:
            for key, value in extra_info.items():
                print("-" * 40)
                print(f"{key.upper()}:\n{value}")
        else:
            print("No extra API state information provided.")
        print("\n==== End of API State Debug ====\n")
        print("-" * 40)