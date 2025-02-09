// src/components/AnimatedChoice.js

import React from 'react';
import './AnimatedChoice.css';

const AnimatedChoice = ({ text, onClick }) => {
  return (
    <div className="animated-choice" onClick={onClick} title={text}>
      {text}
    </div>
  );
};

export default AnimatedChoice;