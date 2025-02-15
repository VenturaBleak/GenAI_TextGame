// ./frontend/src/__tests__/App.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import * as api from '../api/narrativeAPI';

// Mock the API calls so that our tests do not make real HTTP requests.
jest.mock('../api/narrativeAPI');

describe('Narrative Game Front End', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial static narrative and Follow button', () => {
    render(<App />);
    // Initial narrative should include "Follow the white rabbit."
    expect(screen.getByText(/Follow the white rabbit\./i)).toBeInTheDocument();
    // There should be a "Follow" button rendered
    expect(screen.getByText(/^Follow$/i)).toBeInTheDocument();
  });

  test('starts game on clicking Follow and displays initial narrative and choices', async () => {
    // Simulate API response for initial stage
    api.submitNarrativeRequest.mockResolvedValueOnce({
      situation: "A mysterious alley in the rain.",
      choices: [
        { id: 1, choice_description: "Enter the alley.", confirming_sentence: "You step forward.", outcome: "positive" },
        { id: 2, choice_description: "Walk away.", confirming_sentence: "You hesitate.", outcome: "negative" }
      ]
    });

    render(<App />);
    // Click the "Follow" button to start the game.
    fireEvent.click(screen.getByText(/^Follow$/i));

    // Wait for the animated segment (initial API response) to appear
    await waitFor(() => {
      expect(screen.getByText(/A mysterious alley in the rain\./i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for choices to appear after text animation completion.
    await waitFor(() => {
      expect(screen.getByText(/Enter the alley\./i)).toBeInTheDocument();
      expect(screen.getByText(/Walk away\./i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('choosing a positive option updates narrative and score', async () => {
    // --- First API call: initial stage ---
    api.submitNarrativeRequest.mockResolvedValueOnce({
      situation: "A mysterious alley in the rain.",
      choices: [
        { id: 1, choice_description: "Enter the alley.", confirming_sentence: "You step forward.", outcome: "positive" },
        { id: 2, choice_description: "Walk away.", confirming_sentence: "You hesitate.", outcome: "negative" }
      ]
    });
    // --- Second API call: round stage after choice ---
    api.submitNarrativeRequest.mockResolvedValueOnce({
      confirming_sentence: "You step forward.",
      situation: "The street twists into a labyrinth.",
      choices: [
        { id: 1, choice_description: "Turn left.", confirming_sentence: "You step boldly.", outcome: "positive" },
        { id: 2, choice_description: "Turn right.", confirming_sentence: "You remain cautious.", outcome: "negative" }
      ]
    });

    render(<App />);
    // Start the game
    fireEvent.click(screen.getByText(/^Follow$/i));

    // Wait for the initial narrative to appear.
    await waitFor(() => {
      expect(screen.getByText(/A mysterious alley in the rain\./i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for choices to appear.
    await waitFor(() => {
      expect(screen.getByText(/Enter the alley\./i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the "Enter the alley." choice (a positive outcome).
    fireEvent.click(screen.getByText(/Enter the alley\./i));

    // Wait for the round narrative to update.
    await waitFor(() => {
      expect(screen.getByText(/The street twists into a labyrinth/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify that the score has updated.
    expect(screen.getByText(/Score: 1/i)).toBeInTheDocument();
  });

  test('displays game over panel and resets game when Play Again is clicked', async () => {
    // For this test, we simulate API responses that will eventually cause game over.
    // The hook’s threshold is set to 5 in our implementation.
    // We simulate initial and round responses.

    // --- Initial stage ---
    api.submitNarrativeRequest.mockResolvedValueOnce({
      situation: "A mysterious alley in the rain.",
      choices: [
        { id: 1, choice_description: "Enter the alley.", confirming_sentence: "You step forward.", outcome: "positive" },
        { id: 2, choice_description: "Walk away.", confirming_sentence: "You hesitate.", outcome: "negative" }
      ]
    });
    // --- Round stage: simulate a positive choice that pushes the score over the threshold ---
    api.submitNarrativeRequest.mockResolvedValueOnce({
      confirming_sentence: "You step forward.",
      situation: "The labyrinth becomes your prison.",
      choices: [
        { id: 1, choice_description: "Surrender to fate.", confirming_sentence: "You accept your destiny.", outcome: "positive" },
        { id: 2, choice_description: "Fight back.", confirming_sentence: "You rage against it.", outcome: "negative" }
      ]
    });

    render(<App />);
    // Start the game
    fireEvent.click(screen.getByText(/^Follow$/i));

    // Wait for initial narrative to appear.
    await waitFor(() => {
      expect(screen.getByText(/A mysterious alley in the rain\./i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for choices to appear.
    await waitFor(() => {
      expect(screen.getByText(/Enter the alley\./i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the positive choice.
    fireEvent.click(screen.getByText(/Enter the alley\./i));

    // Now, we simulate that the score becomes equal to the threshold.
    // Our test assumes that the hook will then mark the game as over.
    await waitFor(() => {
      expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click the "Play Again" button.
    fireEvent.click(screen.getByText(/Play Again/i));

    // Verify that the game resets to initial state.
    await waitFor(() => {
      expect(screen.getByText(/Follow the white rabbit\./i)).toBeInTheDocument();
      expect(screen.getByText(/^Follow$/i)).toBeInTheDocument();
    });
  });
});