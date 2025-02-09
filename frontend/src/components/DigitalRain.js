// frontend/src/DigitalRain.js
import React, { useEffect, useRef } from 'react';
import './DigitalRain.css';

const DigitalRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Set canvas dimensions to fill the viewport.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const rainDrops = new Array(columns).fill(0);
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    function draw() {
      // Fade the canvas to simulate trailing.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < rainDrops.length; i++) {
        const char = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;
        // Create a vertical gradient: white at the top (head) and green at the bottom (tail).
        const gradient = ctx.createLinearGradient(x, y - fontSize, x, y);
        gradient.addColorStop(0, '#fff'); // white
        gradient.addColorStop(1, '#0F0');   // green
        ctx.fillStyle = gradient;
        ctx.fillText(char, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    }
    const intervalId = setInterval(draw, 30);
    return () => clearInterval(intervalId);
  }, []);

  return <canvas ref={canvasRef} className="digital-rain-canvas" />;
};

export default DigitalRain;
