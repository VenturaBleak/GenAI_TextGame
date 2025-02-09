from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from models.game_state import GameState
from models.choice_request import ChoiceRequest
from services.narrative_service import (
    generate_round_context,
    generate_final_wrapping,
    generate_first_round_context
)
from utils.debug import debug_print_state

# End-of-game threshold (e.g. 3 points, positive or negative)
END_GAME_THRESHOLD = int(os.environ.get("END_GAME_THRESHOLD", "3"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development/testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global game state instance.
game_state = GameState()

# Mapping for score delta based on choice outcome.
outcome_mapping = {
    "positive": 1,
    "negative": -1
}


@app.get("/api/start")
def start_game():
    """
    Initializes the game by resetting the game state and generating the first round.

    The first round is produced by calling generate_first_round_context(), which returns a 
    dictionary containing the initial "situation" and available "choices". The narrative context 
    is then set to the constant message "Follow the white rabbit." followed by the generated situation.

    Returns:
        A JSON object with:
            - status: A status message.
            - narrative_context: The complete narrative so far.
            - current_round: The first round's data.
            - score: The current score (should be 0).
            - game_over: False.
            - end_game_threshold: The score threshold.
    """
    game_state.reset()

    # Generate the first round context from Gemini.
    round_data = generate_first_round_context()
    game_state.current_round = round_data

    # Set the initial narrative context to the constant message plus the situation.
    game_state.narrative_context = f"Follow the white rabbit.\n{round_data['situation']}\n"

    debug_print_state("API Call GET", extra_info={
        "narrative_context": game_state.narrative_context,
        "score": game_state.score,
        "round_data": round_data
    })

    return {
        "status": "Round Started, awaiting choice",
        "narrative_context": game_state.narrative_context,
        "current_round": round_data,
        "score": game_state.score,
        "game_over": False,
        "end_game_threshold": END_GAME_THRESHOLD
    }


@app.post("/api/choose")
def choose(choice_request: ChoiceRequest):
    """
    Processes the player's choice and returns the next round context.

    Steps:
      1. Validates the player's choice (must be "positive" or "negative").
      2. Updates the game score based on the choice.
      3. Calls generate_round_context() to produce the new situation and updated choices.
      4. **Crucially:** Extracts the new action confirming sentence from the fresh round data
         (rather than reusing a stale value) and appends it—followed by a blank line and then the new situation—to the narrative.
      5. Checks for game-over conditions based on the updated score.

    Returns:
        A JSON object with:
            - status: A status message.
            - narrative_context: The updated narrative context.
            - current_round: The new round's data (if the game continues).
            - score: The updated score.
            - game_over: Boolean indicating if the game has ended.
            - end_game_threshold: The score threshold.
    """
    choice_type = choice_request.choice_type.lower()
    if choice_type not in outcome_mapping:
        raise HTTPException(
            status_code=400,
            detail="Invalid choice type. Must be 'positive' or 'negative'."
        )

    current_round = game_state.current_round
    if not current_round or "choices" not in current_round:
        raise HTTPException(
            status_code=500,
            detail="Current round data is incomplete."
        )

    selected_choice = next(
        (c for c in current_round["choices"] if c["outcome"] == choice_type),
        None
    )
    if not selected_choice:
        raise HTTPException(
            status_code=400,
            detail="Choice not found."
        )

    game_state.score += outcome_mapping[choice_type]

    # Generate the next round context.
    round_data = generate_round_context(
        narrative_context=game_state.narrative_context,
        action=selected_choice["choice_description"],
        outcome_value=outcome_mapping[choice_type],
        action_confirming_sentence=selected_choice["confirming_sentence"]
    )

    # **Fix:** Update the current round in the game state with the new round data.
    game_state.current_round = round_data

    game_state.narrative_context += ("\n" +
                                     "DECISION MADE: " + selected_choice["choice_description"] + "\n" +
                                     "PLAYER CHOICE: " + selected_choice["confirming_sentence"] + "\n\n" +
                                     round_data["situation"] + "\n")

    debug_print_state("API Call POST", extra_info={
        "received_choice": selected_choice["choice_description"],
        "confirming_sentence": selected_choice["confirming_sentence"],
        "current_round": round_data,
        "score": game_state.score,
        "narrative_context": game_state.narrative_context
    })

    if abs(game_state.score) >= END_GAME_THRESHOLD:
        win_or_loss = "WIN" if game_state.score >= END_GAME_THRESHOLD else "LOSS"
        final_text = generate_final_wrapping(game_state.narrative_context, win_or_loss)
        game_state.narrative_context += "\n" + final_text

        return {
            "status": "Game Over",
            "narrative_context": game_state.narrative_context,
            "score": game_state.score,
            "game_over": True,
            "end_game_threshold": END_GAME_THRESHOLD,
            "win_or_loss": win_or_loss
        }
    else:
        return {
            "status": "Round completed, awaiting next choice",
            "narrative_context": game_state.narrative_context,
            "current_round": round_data,
            "score": game_state.score,
            "game_over": False,
            "end_game_threshold": END_GAME_THRESHOLD
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)