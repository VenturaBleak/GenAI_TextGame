/**
 * api.js
 *
 * Provides functions for interacting with the backend API.
 * - startGame: Calls GET /api/start to initialize the game.
 * - chooseOption: Calls POST /api/choose to submit the player's choice.
 *
 * Both functions return the parsed JSON response.
 */

export const startGame = async (backendUrl) => {
  const response = await fetch(`${backendUrl}/api/start`);
  if (!response.ok) {
    throw new Error("Failed to fetch start game narrative.");
  }
  return await response.json();
};

export const chooseOption = async (backendUrl, choiceOutcome) => {
  const response = await fetch(`${backendUrl}/api/choose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice_type: choiceOutcome }),
  });
  if (!response.ok) {
    throw new Error("Failed to process choice.");
  }
  return await response.json();
};