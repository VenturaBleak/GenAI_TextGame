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
 * - Initially shows a static narrative with a centered "Follow" button.
 * - When the game starts, only the new (animated) segment is animated,
 *   while the previously animated text remains static.
 * - For intermediate rounds, the animated segment includes the choice made,
 *   its confirming sentence, and the continuing narrative.
 * - Choices appear only after the text animation is complete.
 */
const App = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const initialMessage = "Follow the black duck.\n\n";

  const {
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
  } = useGame(initialMessage, backendUrl);

  const logRef = useRef(null);

  // Scroll the narrative log to the bottom whenever narrative or animatedSegment changes.
  const scrollToBottom = () => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
      console.debug("[App] Scrolled to bottom of narrative log.");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [narrative, animatedSegment]);

  console.debug("[App] Rendering App component. Game started:", hasStarted);

  // BEFORE GAME STARTS: Show the initial animated text and a centered "Follow" button.
  if (!hasStarted) {
    return (
      <div className="app-container">
        <DigitalRain />
        <header>
          <div className="score-counter">Score: 0 (Goal: {endGameThreshold})</div>
        </header>
        <main>
          <div className="narrative-log" ref={logRef}>
            {!initialAnimationDone ? (
             <AnimatedText
               text={narrative + (animatedSegment ? "\n" + animatedSegment : "")}
               onComplete={() => {
                 console.debug("[App] AnimatedText (initial) completed.");
                 handleAnimationComplete();
               }}
               onProgress={scrollToBottom}
             />
           ) : (
             <div className="static-text">{narrative}</div>
           )}
          </div>
          <div className="choices-grid" style={{ justifyContent: 'center' }}>
            <AnimatedChoice
              text="Follow"
              onClick={() => {
                console.debug("[App] 'Follow' button clicked.");
                startGame();
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  // AFTER GAME STARTS: Render the static narrative and animate only the new segment.
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
            {narrative && (
              <div className="static-text">{narrative}</div>
            )}
            {/* Animate only the new segment */}
            {animatedSegment && (
              <AnimatedText
                text={animatedSegment}
                onComplete={() => {
                  console.debug("[App] AnimatedText (segment) completed.");
                  handleAnimationComplete();
                }}
                onProgress={scrollToBottom}
              />
            )}
          </div>
          {!animatedSegment && (
            <div className="persistent-cursor-container">
              <span className="blinking-cursor">.</span>
            </div>
          )}
        </div>

        {/* Render choices only when text animation is complete and no animation is in progress */}
        {textAnimationComplete && !animationInProgress && (
          <>
            {gameOver ? (
              <div className="game-end-panel">
                <h2>Game Over</h2>
                <p>Your final score: {score}</p>
                <button onClick={() => {
                  console.debug("[App] 'Play Again' button clicked.");
                  resetGame();
                }}>
                  Play Again
                </button>
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