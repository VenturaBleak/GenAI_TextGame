import { useState, useRef } from "react";
import { submitNarrativeRequest } from "../api/narrativeAPI";
// Import the shuffle function
import { shuffleArray } from "../utils/shuffle";

/**
 * useGame - A custom hook to manage the game state.
 *
 * This version accepts a third parameter, `language`, containing localized strings.
 * It uses the language name (language.name) for the API payload as required.
 */
export function useGame(initialMessage, backendUrl, language) {
  const [hasStarted, setHasStarted] = useState(false);
  const [narrative, setNarrative] = useState(initialMessage);
  const [animatedSegment, setAnimatedSegment] = useState("");
  const [choices, setChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [endGameThreshold] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);

  // NEW: A ref to track whether a choice has already been submitted.
  const isChoiceSubmitted = useRef(false);

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

  // If no valid language is provided, log an error and return safe defaults.
  if (!language || !language.name) {
    console.error("[useGame] A valid language (with language.name) is required.");
    return {
      narrative: initialMessage,
      animatedSegment: "",
      choices: [],
      gameOver: false,
      animationInProgress: false,
      textAnimationComplete: false,
      score: 0,
      endGameThreshold: 3,
      hasStarted: false,
      startGame: () => {},
      chooseOption: () => {},
      resetGame: () => {},
      handleAnimationComplete: () => {},
      initialAnimationDone: false,
    };
  }

  // Start the game by calling the "initial" narrative endpoint.
  const startGame = async () => {
    console.debug("[useGame] Starting game...");
    setHasStarted(true);
    try {
      // Use language.name in the payload as desired.
      const payload = { stage: "initial", language: language.name };
      console.debug("[useGame] startGame payload:", payload);
      const result = await submitNarrativeRequest(payload);
      console.debug("[useGame] startGame result:", result);
      setNarrative(initialMessage);
      setAnimatedSegment(result.situation);
      // Shuffle the choices array before setting it.
      setChoices(shuffleArray(result.choices));
      setTextAnimationComplete(false);
      setAnimationInProgress(true);
      logGameState("startGame", { apiResult: result });
    } catch (error) {
      console.error("[useGame] Error starting game:", error);
    }
  };

  // Called when a choice is selected.
  const chooseOption = async (outcome) => {
    // Prevent multiple submissions (e.g. button smashing).
    if (isChoiceSubmitted.current) {
      console.debug("[useGame] Choice already submitted, ignoring additional click.");
      return;
    }
    isChoiceSubmitted.current = true;

    // Immediately remove choices from the UI to hide the button(s).
    setChoices([]);

    console.debug("[useGame] Choosing option:", outcome);
    const computedScore = outcome === "positive" ? score + 1 : score - 1;
    console.debug("[useGame] Computed new score:", computedScore);
    setScore(computedScore);

    const narrativeContext = narrative + (animatedSegment ? "\n" + animatedSegment : "");
    const selectedChoice = choices.find((choice) => choice.outcome === outcome) || {};
    const action = selectedChoice.choice_description || "";
    const actionConfirmingSentence = selectedChoice.confirming_sentence || "";
    console.debug("[useGame] Chosen option details:", { action, actionConfirmingSentence });

    try {
      const isFinalRound = Math.abs(computedScore) >= endGameThreshold;
      let payload;

      if (isFinalRound) {
        const win_or_loss = computedScore > 0 ? "win" : "loss";
        payload = {
          stage: "final",
          language: language.name,
          narrative_context: narrativeContext,
          win_or_loss,
        };
      } else {
        payload = {
          stage: "round",
          language: language.name,
          narrative_context: narrativeContext,
          action,
          outcome_value: outcome === "positive" ? 1 : -1,
          action_confirming_sentence: actionConfirmingSentence,
        };
      }

      console.debug("[useGame] chooseOption payload:", payload);
      const result = await submitNarrativeRequest(payload);
      console.debug("[useGame] chooseOption result:", result);

      // Build the new animated segment with localized "You chose:" text.
      const newAnimatedSegment =
        "\n\n" + language.you_chose + ": " + action +
        "\n\n" + actionConfirmingSentence +
        "\n\n" + result.situation;

      setAnimatedSegment(newAnimatedSegment);
      // Shuffle the choices if it's not the final round.
      setChoices(isFinalRound ? [] : shuffleArray(result.choices));
      setTextAnimationComplete(false);
      setAnimationInProgress(true);

      if (isFinalRound) {
        console.debug("[useGame] Final round reached. Game Over!");
        setGameOver(true);
      }
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
    setInitialAnimationDone(false);
    // Also reset the choice submission flag so a new game can start fresh.
    isChoiceSubmitted.current = false;
    logGameState("resetGame");
  };

  // Append the animated segment to the narrative after the text animation finishes.
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
    if (!hasStarted) {
      setInitialAnimationDone(true);
    }
    // Reset the choice submission flag so that new choices can be processed.
    isChoiceSubmitted.current = false;
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
    initialAnimationDone,
  };
}