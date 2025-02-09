import { useState } from 'react';
import * as api from '../services/api';
import { shuffleArray } from '../utils/shuffle';

/**
 * useGame - A custom React hook for managing game state and text display.
 *
 * Text Types:
 *   1) Type 1 (Constant): Provided as the initialMessage (e.g., "Follow the white rabbit.")
 *   2) Type 2 (Confirming Sentence): Immediately appended text (e.g., the action's confirming sentence).
 *   3) Type 3 (Backend Narrative): Fetched from the backend and animated before display.
 *
 * The hook maintains two text states:
 *   - immediateNarrative: Contains Type 1 and Type 2 text, shown immediately.
 *   - animatedSegment: Contains Type 3 text to be animated.
 *
 * Also, the hook tracks whether the game has started (i.e. the initial "Follow" button was pressed).
 *
 * @param {string} initialMessage - The constant initial text.
 * @param {string} backendUrl - The base URL for the backend API.
 * @returns {Object} Game state and action functions.
 */
export const useGame = (initialMessage, backendUrl) => {
  // Text that is printed immediately (Type 1 and Type 2).
  const [immediateNarrative, setImmediateNarrative] = useState(initialMessage);
  // Text that will be animated (Type 3).
  const [animatedSegment, setAnimatedSegment] = useState("");
  const [choices, setChoices] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [endGameThreshold, setEndGameThreshold] = useState(5);
  // Tracks whether the game has begun (i.e. the user clicked "Follow")
  const [hasStarted, setHasStarted] = useState(false);

  /**
   * Processes the backend response.
   *
   * Splits the newly received text (if any) into:
   * - An immediate part (confirming sentence, Type 2) and
   * - A part to be animated (backend narrative, Type 3).
   *
   * Also updates other game state values.
   *
   * @param {Object} data - The JSON response from the backend.
   */
  const handleResponse = (data) => {
  if (data.current_round && data.current_round.situation) {
    // We now only want to animate the new situation text (Type 3).
    const newSituation = data.current_round.situation.trim();
    // Set the animated segment to the new situation plus an extra newline.
    setAnimatedSegment(newSituation + "\n");
  } else {
    // Fallback: if there is no current round (should not normally occur), use the difference.
    const fullNarrative = data.narrative_context;
    let newText = fullNarrative.substring(immediateNarrative.length).trim();
    setAnimatedSegment(newText + "\n");
  }

  // Update additional game state.
  setChoices(data.current_round ? shuffleArray(data.current_round.choices) : []);
  setGameOver(data.game_over);
  setScore(data.score);
  setEndGameThreshold(data.end_game_threshold || 5);
  setAnimationInProgress(true);
  setTextAnimationComplete(false);
};

  /**
   * Initiates the game by calling the backend /api/start endpoint.
   *
   * When the user clicks "Follow", the game begins.
   * The constant initial text is already displayed.
   */
  const startGame = async () => {
    // Mark that the game has started (thus, remove the "Follow" button).
    setHasStarted(true);
    try {
      const data = await api.startGame(backendUrl);
      handleResponse(data);
      // If no round data exists, auto-trigger round 1 after a short delay.
      if (!data.current_round) {
        setTimeout(() => {
          chooseOption("positive");
        }, 2000);
      }
    } catch (error) {
      console.error("Error starting game:", error);
      setAnimationInProgress(false);
    }
  };

  /**
   * Sends the player's choice to the backend and processes the response.
   *
   * @param {string} choiceOutcome - The outcome ("positive" or "negative") of the player's choice.
   */
 const chooseOption = async (choiceOutcome) => {
  if (animationInProgress) return; // Prevent duplicate submissions.

  // Look up the selected choice from the current choices array.
  const selectedChoice = choices.find(c => c.outcome === choiceOutcome);
  if (!selectedChoice) return;

  // Construct the immediate update text with the desired order:
  // First, print the decision made (the choice text),
  // then a blank line, then "PLAYER CHOICE: " plus the confirming sentence,
  // and finally another blank line.
  const immediateUpdate =
    "\n" +
    "DECISION MADE: " + selectedChoice.choice_description + "\n\n" +
    selectedChoice.confirming_sentence + "\n";

  // Instead of appending directly to immediateNarrative,
  // set this update as the animated segment so that it is animated.
  setAnimatedSegment(immediateUpdate);

  // Clear the current choices so they disappear immediately.
  setChoices([]);

  // Set animation state flags.
  setAnimationInProgress(true);
  setTextAnimationComplete(false);

  try {
    // Now trigger the API call in parallel.
    const data = await api.chooseOption(backendUrl, choiceOutcome);
    // When the API call completes, process and animate the new narrative.
    handleResponse(data);
  } catch (error) {
    console.error("Error processing choice:", error);
    setAnimationInProgress(false);
  }
};

/**
 * Called when the animated text (Type 3) has finished its animation.
 * The animated segment is then appended to the immediate narrative.
 */
const handleAnimationComplete = () => {
  // Append animated text and then add an extra newline (blank line) at the end.
  setImmediateNarrative(prev => prev + (animatedSegment ? '\n' + animatedSegment : '') + "\n");
  setAnimatedSegment("");
  setTextAnimationComplete(true);
  setAnimationInProgress(false);
};

  /**
   * Resets the game state to its initial values.
   */
  const resetGame = () => {
    setImmediateNarrative(initialMessage);
    setAnimatedSegment("");
    setChoices([]);
    setGameOver(false);
    setAnimationInProgress(false);
    setTextAnimationComplete(false);
    setScore(0);
    setHasStarted(false);
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
};