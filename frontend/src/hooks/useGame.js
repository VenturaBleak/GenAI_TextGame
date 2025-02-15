// ./frontend/src/hooks/useGame.js

import { useState } from "react";
import { submitNarrativeRequest } from "../api/narrativeAPI";

/**
 * useGame - A custom hook to manage the game state.
 *
 * State Variables:
 *   - narrative: The full narrative text that has already been animated.
 *   - animatedSegment: The new narrative text that will be animated.
 *   - choices: Array of choice objects returned from the API.
 *   - score: Current score.
 *   - endGameThreshold: A score threshold for ending the game.
 *   - gameOver: Boolean flag indicating if the game has ended.
 *   - animationInProgress: Boolean indicating if an animation is running.
 *   - textAnimationComplete: Boolean indicating if the current text animation is finished.
 *   - hasStarted: Boolean indicating if the game has started.
 *
 * Functions:
 *   - startGame: Calls the API with stage "initial" and updates state.
 *   - chooseOption: Depending on whether the score threshold has been reached,
 *                   calls the API with stage "round" (intermediate rounds) or "final"
 *                   (final round) based on the chosen option, updates the score,
 *                   and sets a new animatedSegment.
 *   - resetGame: Resets the game state to initial values.
 *   - handleAnimationComplete: Appends the animated segment to the narrative.
 */
export function useGame(initialMessage, backendUrl) {
  const [hasStarted, setHasStarted] = useState(false);
  // The narrative that has been animated already.
  const [narrative, setNarrative] = useState(initialMessage);
  // The new segment that will be animated.
  const [animatedSegment, setAnimatedSegment] = useState("");
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [endGameThreshold] = useState(3); // Example threshold for game over
  const [gameOver, setGameOver] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);

  // Helper function to log the current game state.
  const logGameState = (action, extra = {}) => {
    console.debug(`[useGame] Game state after ${action}:`, {
      narrative,
      animatedSegment,
      score,
      choices,
      gameOver,
      animationInProgress,
      textAnimationComplete,
      ...extra,
    });
  };

  // Start the game by calling the "initial" narrative endpoint.
  const startGame = async () => {
    console.debug("[useGame] Starting game...");
    setHasStarted(true);
    try {
      const payload = { stage: "initial" };
      console.debug("[useGame] startGame payload:", payload);
      const result = await submitNarrativeRequest(payload);
      console.debug("[useGame] startGame result:", result);
      // For the initial round, we keep the static narrative (initialMessage)
      // and animate the new situation.
      setNarrative(initialMessage);
      setAnimatedSegment(result.situation);
      setChoices(result.choices);
      setTextAnimationComplete(false);
      setAnimationInProgress(true);
      console.debug("[useGame] Completed startGame API call.");
      logGameState("startGame", { apiResult: result });
    } catch (error) {
      console.error("[useGame] Error starting game:", error);
    }
  };

  // Called when a choice is selected.
  const chooseOption = async (outcome) => {
  console.debug("[useGame] Choosing option:", outcome);
  // Compute the new score locally.
  const computedScore = outcome === "positive" ? score + 1 : score - 1;
  console.debug("[useGame] Computed new score:", computedScore);
  setScore(computedScore);

  // Build the narrative context from what has already been animated.
  const narrativeContext = narrative + (animatedSegment ? "\n" + animatedSegment : "");
  // Find the chosen option details.
  const selectedChoice = choices.find((choice) => choice.outcome === outcome) || {};
  const action = selectedChoice.choice_description || "";
  const actionConfirmingSentence = selectedChoice.confirming_sentence || "";
  console.debug("[useGame] Chosen option details:", { action, actionConfirmingSentence });

  try {
    // Check if the game-ending threshold has been reached.
    const isFinalRound = Math.abs(computedScore) >= endGameThreshold;
    let payload;

    if (isFinalRound) {
      // Determine win_or_loss based on computedScore.
      const win_or_loss = computedScore > 0 ? "win" : "loss";
      // For the final round, build the payload as expected by the backend.
      payload = {
        stage: "final",
        narrative_context: narrativeContext,
        win_or_loss,
      };
    } else {
      // For intermediate rounds, build the payload for a round.
      payload = {
        stage: "round",
        narrative_context: narrativeContext,
        action,
        outcome_value: outcome === "positive" ? 1 : -1,
        action_confirming_sentence: actionConfirmingSentence,
      };
    }

    console.debug("[useGame] chooseOption payload:", payload);
    const result = await submitNarrativeRequest(payload);
    console.debug("[useGame] chooseOption result:", result);

    // Build the new animated segment.
    // In both cases (final or intermediate) we print:
    //   1) The choice made,
    //   2) The confirming sentence, and
    //   3) The narrative from the API (final situation in the final round).
    const newAnimatedSegment = "\n\nYou chose: " + action +
          "\n\n" + actionConfirmingSentence +
          "\n\n" + result.situation;

    setAnimatedSegment(newAnimatedSegment);
    // For the final round, clear out the choices.
    setChoices(isFinalRound ? [] : result.choices);
    setTextAnimationComplete(false);
    setAnimationInProgress(true);

    if (isFinalRound) {
      console.debug("[useGame] Final round reached. Game Over!");
      setGameOver(true);
    }
    console.debug("[useGame] Completed chooseOption API call.");
    logGameState("chooseOption", { chosenOutcome: outcome, apiResult: result });
  } catch (error) {
    console.error("[useGame] Error processing choice:", error);
  }
  };

  // Reset the game to its initial state.
  const resetGame = () => {
    console.debug("[useGame] Resetting game state.");
    setHasStarted(false);
    setNarrative(initialMessage);
    setAnimatedSegment("");
    setChoices([]);
    setScore(0);
    setGameOver(false);
    setAnimationInProgress(false);
    setTextAnimationComplete(false);
    logGameState("resetGame");
  };

  // Called when the current text animation finishes.
  // We append the animatedSegment to the static narrative and clear the animatedSegment.
  const handleAnimationComplete = () => {
    console.debug("[useGame] Animation complete.");
    setNarrative((prev) => {
      const updated = prev + "\n" + animatedSegment;
      console.debug("[useGame] Updated narrative (post-animation):", updated);
      return updated;
    });
    setAnimatedSegment("");
    setTextAnimationComplete(true);
    setAnimationInProgress(false);
    logGameState("handleAnimationComplete");
  };

  return {
    narrative,
    animatedSegment,
    choices,
    gameOver,
    animationInProgress,
    textAnimationComplete,
    score,
    endGameThreshold,
    hasStarted,
    startGame,
    chooseOption,
    resetGame,
    handleAnimationComplete,
  };
}