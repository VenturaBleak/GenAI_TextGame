// ./frontend/src/App.js

import React, { useEffect, useRef } from 'react';
import AnimatedText from './components/AnimatedText';
import AnimatedChoice from './components/AnimatedChoice';
import DigitalRain from './components/DigitalRain';
import { useGame } from './hooks/useGame';
import './App.css';

/**
 * App - Main React component for the interactive storytelling game.
 *
 * Game progression:
 *  1) Initially displays the static text ("Follow the white rabbit.") with a centered "Follow" button.
 *  2) When the "Follow" button is clicked, the game starts and the initial narrative is fetched from the API.
 *  3) Animated text is displayed; once the animation completes, available choices (animated) are shown.
 *  4) When a choice is clicked, it is sent to the API, the narrative is updated, and the score is adjusted.
 *  5) The background always displays animated digital rain.
 */
const App = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const initialMessage = "Follow the white rabbit. \n\n";

  const {
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
  } = useGame(initialMessage, backendUrl);

  const logRef = useRef(null);

  // Scroll the narrative log to the bottom whenever new narrative content is added.
  const scrollToBottom = () => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
      console.debug("[App] Scrolled to bottom of narrative log.");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [immediateNarrative, animatedSegment]);

  console.debug("[App] Rendering App component. Game started:", hasStarted);

  // BEFORE GAME STARTS: Show the static text and a centered "Follow" button.
  if (!hasStarted) {
    return (
      <div className="app-container">
        <DigitalRain />
        <header>
          <div className="score-counter">Score: 0 (Goal: {endGameThreshold})</div>
        </header>
        <main>
          <div className="narrative-log" ref={logRef}>
            <div className="log-content">
              <div className="static-text">
                {immediateNarrative + "\n"}
              </div>
            </div>
          </div>
          <div className="choices-grid" style={{ justifyContent: 'center' }}>
            <AnimatedChoice text="Follow" onClick={() => {
              console.debug("[App] 'Follow' button clicked.");
              startGame();
            }} />
          </div>
        </main>
      </div>
    );
  }

  // AFTER GAME STARTS: Render the narrative log and available choices.
  return (
    <div className="app-container">
      <DigitalRain />
      <header>
        <div className="score-counter">
          Score: {score} (Goal: {endGameThreshold})
        </div>
      </header>
      <main>
        <div className="narrative-log" ref={logRef}>
          <div className="log-content">
            {/* Render static narrative text */}
            {immediateNarrative && (
              <div className="static-text">{immediateNarrative}</div>
            )}
            {/* Render animated narrative segment */}
            {animatedSegment && (
              !textAnimationComplete ? (
                <AnimatedText
                  text={animatedSegment}
                  onComplete={() => {
                    console.debug("[App] AnimatedText completed.");
                    handleAnimationComplete();
                  }}
                  onProgress={scrollToBottom}
                />
              ) : (
                <div className="animated-text">
                  <span>{animatedSegment}</span>
                  <span className="blinking-cursor">.</span>
                </div>
              )
            )}
          </div>
          {!animatedSegment && (
            <div className="persistent-cursor-container">
              <span className="blinking-cursor">.</span>
            </div>
          )}
        </div>

        {/* Render choices (if text animation is complete and no animation is in progress) */}
        {textAnimationComplete && !animationInProgress && (
          <>
            {gameOver ? (
              <div className="game-end-panel">
                <h2>Game Over</h2>
                <p>Your final score: {score}</p>
                <button onClick={() => {
                  console.debug("[App] 'Play Again' button clicked.");
                  resetGame();
                }}>Play Again</button>
              </div>
            ) : (
              choices && choices.length > 0 && (
                <div className="choices-grid">
                  {choices.map((choice, index) => (
                    <AnimatedChoice
                      key={`${choice.outcome}-${index}`}
                      text={choice.choice_description}
                      onClick={() => {
                        console.debug("[App] Choice clicked:", choice.outcome);
                        chooseOption(choice.outcome);
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;