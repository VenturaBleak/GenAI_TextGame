import React, { useEffect, useRef } from 'react';
import AnimatedText from './components/AnimatedText';
import AnimatedChoice from './components/AnimatedChoice';
import DigitalRain from './components/DigitalRain';
import { useGame } from './hooks/useGame';
import './App.css';

/**
 * App - Main React component for the interactive storytelling game.
 *
 * Progression:
 *  1) Initially displays the constant text ("Follow the white rabbit.")
 *     along with a centered "Follow" button.
 *  2) When the "Follow" button is clicked, it triggers the first API call
 *     and the game begins. The backend narrative (Type 3) is animated.
 *  3) Once the animation completes, further choices are shown for game progression.
 *
 * The backend URL is injected via process.env.REACT_APP_BACKEND_URL.
 */
const App = () => {
  // REACT_APP_BACKEND_URL is set at build time (via Docker Compose) and injected into the code.
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const initialMessage = "Follow the white rabbit.";

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

  /**
   * Scrolls the narrative log to the bottom.
   */
  const scrollToBottom = () => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [immediateNarrative, animatedSegment]);

  // BEFORE GAME STARTS: Show the constant text (Type 1) and a centered "Follow" button.
  if (!hasStarted) {
    return (
      <div className="app-container">
        <DigitalRain />
        <header>
          <div className="score-counter">Score: 0 (Goal: {endGameThreshold})</div>
        </header>
        <main>
          {/* Render the narrative log with the initial text and a trailing newline */}
          <div className="narrative-log" ref={logRef}>
            <div className="log-content">
              <div className="static-text">
                {immediateNarrative + "\n"}
              </div>
            </div>
          </div>
          {/* Render the single "Follow" choice centered in the choices grid */}
          <div className="choices-grid" style={{ justifyContent: 'center' }}>
            <AnimatedChoice text="Follow" onClick={startGame} />
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
            {/* Render the immediate narrative (Type 1 & 2) */}
            {immediateNarrative && (
              <div className="static-text">{immediateNarrative}</div>
            )}
            {/* Render the animated segment (Type 3) */}
            {animatedSegment && (
              !textAnimationComplete ? (
                <AnimatedText
                  text={animatedSegment}
                  onComplete={handleAnimationComplete}
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

        {/* Render control area once text animation is complete and no animation is in progress */}
        {textAnimationComplete && !animationInProgress && (
          <>
            {gameOver ? (
              <div className="game-end-panel">
                <h2>Game Over</h2>
                <p>Your final score: {score}</p>
                <button onClick={resetGame}>Play Again</button>
              </div>
            ) : (
              choices && choices.length > 0 && (
                <div className="choices-grid">
                  {choices.map((choice, index) => (
                    <AnimatedChoice
                      key={`${choice.outcome}-${index}`}
                      text={choice.choice_description}
                      onClick={() => chooseOption(choice.outcome)}
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