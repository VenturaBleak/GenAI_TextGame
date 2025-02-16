import React, { useEffect, useRef, useState } from 'react';
import AnimatedText from './components/AnimatedText';
import AnimatedChoice from './components/AnimatedChoice';
import DigitalRain from './components/DigitalRain';
import { useGame } from './hooks/useGame';
import './App.css';

// Import the languages configuration.
import languages from './config/languages.json';

const App = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Initially, no language is selected.
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  // NEW: Track when to show the choices (after a mini delay).
  const [showChoices, setShowChoices] = useState(false);

  // Build the initial narrative message as soon as a language is selected.
  // This message will first say "You chose: [language]" then "Follow the white rabbit" (both localized).
  const initialMessage = selectedLanguage
    ? `${selectedLanguage.you_chose}: ${selectedLanguage.name}\n${selectedLanguage.follow_the_white_rabbit}\n\n`
    : "";

  // Always call the hook (hooks cannot be conditional).
  // If no language is selected, the hook returns safe defaults.
  const game = useGame(initialMessage, backendUrl, selectedLanguage);
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
  } = game || {};

  const logRef = useRef(null);

  // Auto-scroll to the bottom whenever narrative or animated segment changes.
  const scrollToBottom = () => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [narrative, animatedSegment]);

  // NEW: When the animated text has finished and no animation is in progress,
  // set a delay before showing the choices.
  useEffect(() => {
    if (textAnimationComplete && !animationInProgress) {
      const timer = setTimeout(() => {
        setShowChoices(true);
      }, 200); // 500ms delay
      return () => clearTimeout(timer);
    } else {
      setShowChoices(false);
    }
  }, [textAnimationComplete, animationInProgress]);

  // If no language is selected, show the language selection screen.
  if (!selectedLanguage) {
    return (
      <div className="app-container">
        <DigitalRain />
        <header>
          <h1>Choose Language:</h1>
        </header>
        <main>
          {/* Language selection grid with 5 items per row and padding between */}
          <div
            className="language-selection-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              padding: "10px",
            }}
          >
            {languages.translations.map((lang) => (
              <AnimatedChoice
                key={lang.code}
                text={lang.name}
                onClick={() => {
                  console.debug("[App] Language selected:", lang.name);
                  setSelectedLanguage(lang);
                }}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Before the game starts: display the initial narrative message and a "Follow" button.
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
              text={selectedLanguage.follow_the_white_rabbit}
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

  // After the game starts: display the narrative log and available choices.
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
            {narrative && (
              <div className="static-text">{narrative}</div>
            )}
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

        {textAnimationComplete && !animationInProgress && (
          <>
            {gameOver ? (
              <div className="game-end-panel">
                <h2>Game Over</h2>
                <p>Your final score: {score}</p>
                <button
                  onClick={() => {
                    console.debug("[App] 'Play Again' button clicked.");
                    resetGame();
                    // Clear the selected language so the user can choose again.
                    setSelectedLanguage(null);
                  }}
                >
                  Play Again
                </button>
              </div>
            ) : (
              choices && choices.length > 0 && (
                <div
                  className="choices-grid fade-in"
                  style={{
                    opacity: showChoices ? 1 : 0,
                    transition: 'opacity 0.5s ease'
                  }}
                >
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