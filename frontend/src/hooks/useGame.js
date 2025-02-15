// ./frontend/src/hooks/useGame.js

import { useState } from "react";
import { submitNarrativeRequest } from "../api/narrativeAPI";

/**
 * useGame - A custom hook to manage the game state.
 *
 * Parameters:
 *   - initialMessage: The initial static text (e.g. "Follow the white rabbit.\n\n")
 *   - backendUrl: The backend URL (not used directly here since our API helper handles it)
 *
 * State Variables:
 *   - immediateNarrative: Cumulative narrative displayed as static text.
 *   - animatedSegment: The current narrative segment being animated.
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
 *   - chooseOption: Calls the API with stage "round" based on the chosen option,
 *                    updates the score, and appends the new narrative.
 *   - resetGame: Resets the game state to initial values.
 *   - handleAnimationComplete: Marks the current animated text as finished.
 */
export function useGame(initialMessage, backendUrl) {
  const [hasStarted, setHasStarted] = useState(false);
  const [immediateNarrative, setImmediateNarrative] = useState(initialMessage);
  const [animatedSegment, setAnimatedSegment] = useState("");
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [endGameThreshold] = useState(5); // Example threshold for game over
  const [gameOver, setGameOver] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);

  // Start the game by calling the "initial" narrative endpoint.
  const startGame = async () => {
    console.debug("[useGame] Starting game...");
    setHasStarted(true);
    try {
      const payload = { stage: "initial" };
      console.debug("[useGame] startGame payload:", payload);
      const result = await submitNarrativeRequest(payload);
      console.debug("[useGame] startGame result:", result);
      // Expecting result: { stage:"initial", situation, choices }
      setImmediateNarrative(initialMessage);
      setAnimatedSegment(result.situation);
      setChoices(result.choices);
      setAnimationInProgress(true);
    } catch (error) {
      console.error("[useGame] Error starting game:", error);
    }
  };

  // Called when a choice is selected.
  const chooseOption = async (outcome) => {
    console.debug("[useGame] Choosing option:", outcome);
    // Outcome: "positive" or "negative" — adjust score accordingly.
    const newScore = outcome === "positive" ? score + 1 : score - 1;
    console.debug("[useGame] New score:", newScore);
    setScore(newScore);

    // Build a narrative context.
    const narrativeContext = immediateNarrative + "\n" + animatedSegment;
    // Find the chosen option.
    const selectedChoice = choices.find((choice) => choice.outcome === outcome) || {};
    const action = selectedChoice.choice_description || "";
    const actionConfirmingSentence = selectedChoice.confirming_sentence || "";
    console.debug("[useGame] Chosen option details:", { action, actionConfirmingSentence });

    try {
      const payload = {
        stage: "round",
        narrative_context: narrativeContext,
        action,
        outcome_value: outcome === "positive" ? 1 : -1,
        action_confirming_sentence: actionConfirmingSentence,
      };
      console.debug("[useGame] chooseOption payload:", payload);
      const result = await submitNarrativeRequest(payload);
      console.debug("[useGame] chooseOption result:", result);
      // Append the current animated segment to the static narrative.
      setImmediateNarrative((prev) => {
        const newNarrative = prev + "\n" + animatedSegment;
        console.debug("[useGame] Updated immediateNarrative:", newNarrative);
        return newNarrative;
      });
      setAnimatedSegment(result.situation);
      setChoices(result.choices);
      setTextAnimationComplete(false);
      setAnimationInProgress(true);
      // If absolute score meets threshold, mark game over.
      if (Math.abs(newScore) >= endGameThreshold) {
        console.debug("[useGame] Game over threshold reached. Game Over!");
        setGameOver(true);
      }
    } catch (error) {
      console.error("[useGame] Error processing choice:", error);
    }
  };

  // Reset the game to its initial state.
  const resetGame = () => {
    console.debug("[useGame] Resetting game state.");
    setHasStarted(false);
    setImmediateNarrative(initialMessage);
    setAnimatedSegment("");
    setChoices([]);
    setScore(0);
    setGameOver(false);
    setAnimationInProgress(false);
    setTextAnimationComplete(false);
  };

  // Called when text animation finishes.
  const handleAnimationComplete = () => {
    console.debug("[useGame] Animation complete.");
    setTextAnimationComplete(true);
    setAnimationInProgress(false);
  };

  return {
    immediateNarrative,
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