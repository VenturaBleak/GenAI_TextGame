"""
models/game_state.py

Purpose:
    Defines the GameState class which encapsulates the current state of the game,
    including the narrative context, current score, and current round data.

Inputs:
    - None upon initialization.

Outputs:
    - An instance of GameState with attributes:
        - narrative_context (str): The cumulative narrative.
        - score (int): The current score.
        - current_round (dict): The data for the current round (e.g., situation and choices).

Guardrails:
    - The reset() method clears all game state.
    - This class is intended for internal state management only.
"""

class GameState:
    def __init__(self):
        self.reset()

    def reset(self):
        """Resets the game state to initial values."""
        self.narrative_context = ""
        self.score = 0
        self.current_round = {}