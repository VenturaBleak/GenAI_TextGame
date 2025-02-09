// src/components/AnimatedText.js

import React, { useState, useEffect, useRef } from 'react';
import './AnimatedText.css';

const AnimatedText = ({ text, onComplete, onProgress }) => {
  const [displayedText, setDisplayedText] = useState('');
  const isCancelled = useRef(false);

  useEffect(() => {
    isCancelled.current = false;
    setDisplayedText('');
    let index = 0;

    const animate = () => {
      if (isCancelled.current) return;
      if (index < text.length) {
        const newText = text.slice(0, index + 1);
        setDisplayedText(newText);
        if (onProgress) onProgress(newText);
        index++;
        setTimeout(animate, 10);
      } else {
        if (onComplete) onComplete();
      }
    };

    animate();

    return () => {
      isCancelled.current = true;
    };
  }, [text, onProgress, onComplete]);

  return (
    <div className="animated-text">
      <span>{displayedText}</span>
      {displayedText !== text && <span className="blinking-cursor">.</span>}
    </div>
  );
};

export default AnimatedText;