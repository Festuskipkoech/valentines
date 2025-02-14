import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Heart, Send, Music, Moon, Rainbow, Flower } from 'lucide-react';
import Footer from './Footer';
// Replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyCIOQIzVtzWdrVxZXs-AznY6M6SHll0ezM';

const Valentine = () => {
  // Stages: "form" (sender fills data), "share" (link copied and instructions), "message" (recipient sees message)
  const [stage, setStage] = useState('form');
  const [formData, setFormData] = useState({
    senderName: '',
    recipientName: '',
    traits: ''
  });
  const [isDark, setIsDark] = useState(false);
  const [isRainbow, setIsRainbow] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [yesMessage, setYesMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecipient, setIsRecipient] = useState(false);
  const [floatingItems, setFloatingItems] = useState([]);
  const [animatedHearts, setAnimatedHearts] = useState([]);
  const [animatedFlowers, setAnimatedFlowers] = useState([]);

  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Create floating items with improved animations
  useEffect(() => {
    const items = [];
    const emojis = ['❤️', '💖', '💕', '💗', '💓', '🌸', '🌹', '🌷', '🌺', '🌻', '💐'];
    
    for (let i = 0; i < 30; i++) {
      const xStart = Math.random() * 100;
      const yStart = Math.random() * 100;
      
      items.push({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: Math.random() * 16 + 16,
        x: xStart,
        y: yStart,
        // Create more complex path animations
        pathType: Math.floor(Math.random() * 4), // 0: wave, 1: circle, 2: zigzag, 3: figure-8
        amplitude: Math.random() * 40 + 10,
        frequency: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
        baseRotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 5
      });
    }
    setFloatingItems(items);

    // Animation loop for complex movement patterns
    const animate = (time) => {
      setFloatingItems(prevItems => prevItems.map(item => {
        const t = (time + item.delay * 1000) * item.speed * 0.001;
        
        // Different path calculations based on pathType
        let xOffset = 0, yOffset = 0;
        
        if (item.pathType === 0) { // Wave
          xOffset = Math.sin(t + item.phase) * item.amplitude;
          yOffset = -t * 5 % 110; // Slow upward drift, wrap around
        } else if (item.pathType === 1) { // Circle
          xOffset = Math.cos(t) * item.amplitude;
          yOffset = Math.sin(t) * item.amplitude;
        } else if (item.pathType === 2) { // Zigzag
          xOffset = ((t * 0.5) % 2 - 1) * item.amplitude;
          yOffset = -t * 3 % 110; // Upward drift with wrap
        } else if (item.pathType === 3) { // Figure-8
          xOffset = Math.sin(t) * item.amplitude;
          yOffset = Math.sin(t * 2) * item.amplitude * 0.5;
        }
        
        // Calculate new positions while ensuring they stay in bounds
        const newX = (item.x + xOffset + 100) % 100;
        const newY = (item.y + yOffset + 110) % 110 - 10; // Allow slight overflow at top/bottom
        
        return {
          ...item,
          x: newX,
          y: newY,
          rotation: item.baseRotation + t * item.rotationSpeed,
          // Pulsating opacity effect
          opacity: 0.5 + Math.sin(t * 0.5) * 0.3
        };
      }));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // On mount, check URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('valentine');
    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData));
        setFormData(decodedData);
        setStage('message');
        setIsRecipient(true);
      } catch (e) {
        console.error('Failed to parse message data');
      }
    }
  }, []);

  // When viewing as recipient (via link) and in "message" stage, generate the AI message
  useEffect(() => {
    if (isRecipient && stage === 'message' && formData.recipientName) {
      generateMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecipient, stage, formData.recipientName]);

  // Generate the love message using Gemini API with a prompt that asks for a shorter message.
  const generateMessage = async () => {
    if (!GEMINI_API_KEY) {
      setError('API key not configured');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a short (under 50 words), heartfelt love message from ${formData.senderName} to ${formData.recipientName}. 
Highlight these traits: ${formData.traits}. Make it romantic, sincere, and include a few emojis.`;
      const result = await model.generateContent(prompt);
      const generatedText = result.response.text();
      setGeneratedMessage(generatedText);
    } catch (err) {
      console.error(err);
      setError('Failed to generate message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle background music
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setMusicPlaying(!musicPlaying);
  };

  // Generate and copy shareable link, then move to "share" stage
  const generateShareableLink = () => {
    const encodedData = btoa(JSON.stringify(formData));
    const url = `${window.location.origin}${window.location.pathname}?valentine=${encodedData}`;
    navigator.clipboard.writeText(url);
    return url;
  };

  // When the user submits the form, copy the shareable link and show instructions
  const handleCreateValentine = () => {
    // Add confetti effect when submitting form
    createConfetti();
    generateShareableLink();
    setStage('share');
  };

  // Create a more dynamic confetti effect
  const createConfetti = () => {
    const container = document.body;
    const colors = ['#ff0000', '#ff69b4', '#ffb6c1', '#ffc0cb', '#ff1493'];
    const shapes = ['❤️', '💖', '🌹', '✨', ''];  // Empty string for classic confetti
    
    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      const isEmoji = Math.random() < 0.3; // 30% chance of emoji confetti
      
      if (isEmoji) {
        confetti.className = 'emoji-confetti';
        confetti.textContent = shapes[Math.floor(Math.random() * (shapes.length - 1))]; // Don't use empty string
      } else {
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      }
      
      // Random initial positions
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = -10 + 'px';
      
      // Random sizes for variety
      const size = Math.random() * 10 + 5;
      confetti.style.width = isEmoji ? 'auto' : size + 'px';
      confetti.style.height = isEmoji ? 'auto' : size * 2 + 'px';
      confetti.style.fontSize = isEmoji ? (size * 2) + 'px' : '1px';
      
      // Random rotation and spin direction
      const spin = Math.random() <0.5 ? 'confettiSpin' : 'confettiSpinReverse';
      confetti.style.animation = `${spin} ${Math.random() * 3 + 2}s linear, confettiFall ${Math.random() * 3 + 2}s ease-in forwards`;
      
      container.appendChild(confetti);
      
      // Remove after animation completes
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  };

  // Open envelope animation (for the recipient side)
  const openEnvelope = () => {
    setEnvelopeOpened(true);
    // Create sparkle effect when opening envelope
    createSparkles();
    setTimeout(() => {
      // Additional animations or state changes can be added here
    }, 1000);
  };

  // Create more interactive sparkle effect
  const createSparkles = () => {
    const container = document.body;
    const sparkleCount = 50;
    const sparkles = ['✨', '⭐', '🌟', '💫', '✦'];
    
    for (let i = 0; i <sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      sparkle.className = 'sparkle';
      
      // Start from envelope center with random offset
      const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };
      
      // Random angle and distance from center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance;
      
      sparkle.style.left = x + 'px';
      sparkle.style.top = y + 'px';
      sparkle.style.fontSize = (Math.random() * 16 + 12) + 'px';
      
      // Custom animation timing for each sparkle
      const duration = Math.random() * 1.5 + 1;
      const delay = Math.random() * 0.5;
      sparkle.style.animation = `sparkleOut ${duration}s ease-out ${delay}s forwards`;
      
      container.appendChild(sparkle);
      
      // Remove after animation completes
      setTimeout(() => {
        sparkle.remove();
      }, (duration + delay) * 1000 + 100);
    }
  };

  // Fun move button effect for "Decline" (enhanced with musical notes)
  const moveButton = (e) => {
    const btn = e.currentTarget;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Keep button within viewport bounds with padding
    const padding = 50;
    const maxX = viewportWidth - btn.offsetWidth - padding;
    const maxY = viewportHeight - btn.offsetHeight - padding;
    const x = Math.max(padding, Math.min(maxX, Math.random() * maxX));
    const y = Math.max(padding, Math.min(maxY, Math.random() * maxY));
    
    // Smooth transition to new position
    btn.style.transition = 'all 0.3s ease-out';
    btn.style.position = 'fixed';
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    
    // Add multiple musical notes with different paths
    const noteEmojis = ['🎵', '🎶', '♪', '♫', '♬'];
    for (let i = 0; i < 5; i++) {
      const note = document.createElement('div');
      note.textContent = noteEmojis[Math.floor(Math.random() * noteEmojis.length)];
      note.className = 'absolute text-2xl animate-float-note';
      note.style.left = `${x + btn.offsetWidth/2}px`;
      note.style.top = `${y + btn.offsetHeight/2}px`;
      note.style.setProperty('--tx', (Math.random() * 100 - 50) + 'px');
      note.style.setProperty('--ty', (Math.random() * -100 - 50) + 'px');
      note.style.setProperty('--delay', (Math.random() * 0.5) + 's');
      note.style.setProperty('--duration', (Math.random() * 1 + 1.5) + 's');
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 2000);
    }
  };

  // Accept love message effect with enhanced animations
  const sayYes = () => {
    setYesMessage(true);
    
    // Create hearts with physics-based animation
    const createAnimatedHeart = () => {
      const heartSize = Math.random() * 24 + 16;
      const speedX = (Math.random() - 0.5) * 10;
      const speedY = -Math.random() * 15 - 10;
      const rotationSpeed = (Math.random() - 0.5) * 10;
      
      return {
        id: Date.now() + Math.random(),
        emoji: ['❤️', '💖', '💕', '💗', '💓', '💘', '💝'][Math.floor(Math.random() * 7)],
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        rotation: Math.random() * 360,
        speedX,
        speedY,
        rotationSpeed,
        size: heartSize,
        opacity: 1
      };
    };
    
    // Create flowers with different animation
    const createAnimatedFlower = () => {
      const flowerSize = Math.random() * 20 + 14;
      return {
        id: Date.now() + Math.random(),
        emoji: ['🌹', '🌸', '🌷', '🌺', '🌻', '💐'][Math.floor(Math.random() * 6)],
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
        amplitude: Math.random() * 100 + 50,
        frequency: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
        baseY: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
        speed: Math.random() * 0.5 + 0.2,
        size: flowerSize,
        opacity: 1,
        duration: Math.random() * 3 + 4
      };
    };
    
    // Add initial batch of hearts and flowers
    const initialHearts = Array(30).fill().map(createAnimatedHeart);
    const initialFlowers = Array(20).fill().map(createAnimatedFlower);
    
    setAnimatedHearts(initialHearts);
    setAnimatedFlowers(initialFlowers);
    
    // Animation loop for hearts and flowers
    let startTime = performance.now();
    const gravity = 0.2;
    const friction = 0.98;
    
    const animateItems = (timestamp) => {
      const elapsed = timestamp - startTime;
      
      // Update hearts with physics
      setAnimatedHearts(prev => {
        return prev
          .map(heart => {
            // Apply gravity and friction
            const speedY = heart.speedY + gravity;
            const speedX = heart.speedX * friction;
            const x = heart.x + speedX;
            const y = heart.y + speedY;
            const rotation = heart.rotation + heart.rotationSpeed;
            
            // Fade out based on time
            const opacity = 1 - (elapsed / 5000);
            
            return {
              ...heart,
              x,
              y,
              rotation,
              speedX,
              speedY,
              opacity
            };
          })
          .filter(heart => heart.opacity > 0 && heart.y < window.innerHeight + 100);
      });
      
      // Update flowers with wave motion
      setAnimatedFlowers(prev => {
        return prev
          .map(flower => {
            const t = elapsed * flower.speed * 0.001;
            const x = flower.x + Math.sin(t * flower.frequency + flower.phase) * flower.amplitude;
            const y = flower.baseY - t * 30; // Drift upward
            
            // Fade out based on time
            const progress = elapsed / (flower.duration * 1000);
            const opacity = Math.max(0, 1 - progress);
            
            return {
              ...flower,
              x,
              y,
              opacity
            };
          })
          .filter(flower => flower.opacity > 0);
      });
      
      // Continue animation if items remain
      if (elapsed < 5000) {
        requestAnimationFrame(animateItems);
      }
    };
    
    requestAnimationFrame(animateItems);
    
    // Add fireworks effect
    createFireworks();
  };
  
  // Create enhanced fireworks animation
  const createFireworks = () => {
    const fireworkCount = 8;
    const container = document.body;
    const colors = ['#ff0066', '#ff3399', '#ff66cc', '#ff99ee', '#ffccff'];
    
    for (let i = 0; i < fireworkCount; i++) {
      setTimeout(() => {
        // Random position, favoring the top half of screen
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.6);
        
        // Create the firework shell
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = `${x}px`;
        firework.style.top = `${y}px`;
        firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        container.appendChild(firework);
        
        // Create explosion particles after the shell "detonates"
        setTimeout(() => {
          // Create 30-40 particles per firework
          const particleCount = Math.floor(Math.random() * 10 + 30);
          for (let j = 0; j < particleCount; j++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Random particle direction and speed
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            const duration = Math.random() * 0.5 + 0.8;
            
            // Set particle color (same as parent firework)
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Configure the particle's animation
            particle.style.setProperty('--angle', angle + 'rad');
            particle.style.setProperty('--distance', distance + 'px');
            particle.style.setProperty('--duration', duration + 's');
            
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
              particle.remove();
            }, duration * 1000 + 100);
          }
          
          firework.remove();
        }, 300);
      }, i * 800);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-all duration-500 overflow-hidden
      ${isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
        : 'bg-gradient-to-r from-pink-500 to-pink-700 text-white'
      }
      ${isRainbow ? 'animate-rainbow-bg' : ''}
      p-4 md:p-8 relative`}
    >
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes rainbow {
          0% { background-color: red; }
          25% { background-color: #ff69b4; }
          50% { background-color: #ff1493; }
          75% { background-color: #c71585; }
          100% { background-color: red; }
        }
        @keyframes rainbow-bg {
          0% { background: linear-gradient(135deg, #ff0000, #ff1493); }
          25% { background: linear-gradient(135deg, #ff1493, #c71585); }
          50% { background: linear-gradient(135deg, #c71585, #ff69b4); }
          75% { background: linear-gradient(135deg, #ff69b4, #ff00ff); }
          100% { background: linear-gradient(135deg, #ff00ff, #ff0000); }
        }
        @keyframes float-random {
          0% { 
            transform: translate(0, 0) rotate(0deg); 
            opacity: 0.4; 
          }
          50% { 
            transform: translate(var(--tx), var(--ty)) rotate(var(--tr)deg); 
            opacity: 0.8; 
          }
          100% { 
            transform: translate(0, -100px) rotate(0deg); 
            opacity: 0; 
          }
        }
        @keyframes confettiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes confettiSpinReverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotateX(0); }
          100% { transform: translateY(100vh) rotateX(180deg); }
        }
        @keyframes openEnvelope {
          to { transform: scale(0) rotate(720deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-note {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes sparkleOut {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          10% { transform: scale(1.2) rotate(45deg); opacity: 1; }
          100% { transform: scale(0) rotate(90deg); opacity: 0; }
        }
        @keyframes firework {
          0% { transform: scale(0); opacity: 1; box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
          100% { transform: scale(1); opacity: 0; box-shadow: 0 0 0 100px rgba(255,20,147,0); }
        }
        @keyframes particle-explode {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { 
            transform: translateX(calc(cos(var(--angle)) * var(--distance))) 
                       translateY(calc(sin(var(--angle)) * var(--distance)))
                       scale(0); 
            opacity: 0; 
          }
        }
        
        .animate-pulse-heart { animation: pulse 1.5s ease infinite; }
        .animate-rainbow { animation: rainbow 3s linear infinite; }
        .animate-rainbow-bg { animation: rainbow-bg 10s linear infinite; }
        .animate-open-envelope { animation: openEnvelope 1s forwards; }
        .animate-fadeIn { animation: fadeIn 1s forwards; }
        
        .confetti {
          position: fixed;
          width: 10px;
          height: 20px;
          top: -20px;
          pointer-events: none;
          transform-origin: center;
          z-index: 100;
        }
        
        .emoji-confetti {
          position: fixed;
          top: -20px;
          pointer-events: none;
          transform-origin: center;
          z-index: 100;
        }
        
        .firework {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          z-index: 100;
          animation: firework 0.5s ease-out forwards;
        }
        
        .firework-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          z-index: 100;
          animation: particle-explode var(--duration) ease-out forwards;
        }
        
        .sparkle {
          position: absolute;
          pointer-events: none;
          z-index: 100;
          transform-origin: center;
        }
        
        .floating-item {
          position: absolute;
          pointer-events: none;
          font-size: var(--size);
          z-index: 1;
          transform-origin: center;
          will-change: transform, opacity;
        }
      `}</style>
      
      {/* Floating hearts and flowers with dynamic animations */}
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className="floating-item"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
            transform: `rotate(${item.rotation}deg)`,
            transition: 'transform 0.1s linear, opacity 0.2s ease',
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Animated hearts from sayYes effect */}
      {animatedHearts.map(heart => (
        <div
          key={heart.id}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            transform: `rotate(${heart.rotation}deg)`,
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
            transition: 'opacity 0.1s linear',
          }}
        >
          {heart.emoji}
        </div>
      ))}

      {/* Animated flowers from sayYes effect */}
      {animatedFlowers.map(flower => (
        <div
          key={flower.id}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${flower.x}px`,
            top: `${flower.y}px`,
            fontSize: `${flower.size}px`,
            opacity: flower.opacity,
            transition: 'opacity 0.1s linear',
          }}
        >
          {flower.emoji}
        </div>
      ))}

      <audio 
        ref={audioRef} 
        loop
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
      />

      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button onClick={toggleMusic} className={`p-2 rounded-full shadow-md hover:scale-110 transition md:px-4 md:py-2 flex items-center gap-1 ${isDark ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-white text-pink-600'}`}>
          <Music size={20} className={musicPlaying ? 'animate-pulse' : ''} />
          <span className="hidden md:inline">{musicPlaying ? 'Pause' : 'Play'}</span>
        </button>
        <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full shadow-md hover:scale-110 transition md:px-4 md:py-2 flex items-center gap-1 ${isDark ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-white text-pink-600'}`}>
          <Moon size={20} className={isDark ? 'text-yellow-200' : ''} />
          <span className="hidden md:inline">Theme</span>
        </button>
        <button onClick={() => setIsRainbow(!isRainbow)} className={`p-2 rounded-full shadow-md hover:scale-110 transition md:px-4 md:py-2 flex items-center gap-1 ${isDark ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-white text-pink-600'}`}>
          <Rainbow size={20} /><span className="hidden md:inline">Rainbow</span>
        </button>
      </div>

      {stage === 'form' && (
        <div className={`w-full max-w-md rounded-lg p-6 md:p-8 animate-fadeIn shadow-2xl ${isDark ? 'bg-gray-800/90' : 'bg-white/90'}`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${isDark ? 'text-purple-400' : 'text-pink-600'}`}>Create Your Valentine</h2>
          <div className="space-y-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Your Name" 
                value={formData.senderName} 
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })} 
                className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition ${
                  isDark 
                    ? 'bg-gray-700 border-purple-500 focus:border-purple-400 text-white placeholder-gray-400' 
                    : 'border-pink-300 focus:border-pink-500 text-pink-600'
                }`}
              />
              <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${
                isDark ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-pink-400 to-purple-500'
              }`} />
            </div>
            
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Their Name" 
                value={formData.recipientName} 
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })} 
                className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition ${
                  isDark 
                    ? 'bg-gray-700 border-purple-500 focus:border-purple-400 text-white placeholder-gray-400' 
                    : 'border-pink-300 focus:border-pink-500 text-pink-600'
                }`}
              />
              <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${
                isDark ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-pink-400 to-purple-500'
              }`} />
            </div>
            
            <div className="relative group">
              <textarea 
                placeholder="What makes them special?" 
                value={formData.traits} 
                onChange={(e) => setFormData({ ...formData, traits: e.target.value })} 
                className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition ${
                  isDark 
                    ? 'bg-gray-700 border-purple-500 focus:border-purple-400 text-white placeholder-gray-400' 
                    : 'border-pink-300 focus:border-pink-500 text-pink-600'
                }`}
                rows={3} 
              />
              <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${
                isDark ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-pink-400 to-purple-500'
              }`} />
            </div>
            
            <button 
              onClick={handleCreateValentine} 
              className={`w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 relative group overflow-hidden ${
                isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                <Send className="animate-pulse" /> Create Valentine
              </div>
            </button>
          </div>
        </div>
      )}

      {stage === 'share' && (
        <div className={`w-full max-w-md rounded-lg p-6 md:p-8 animate-fadeIn text-center shadow-2xl ${isDark ? 'bg-gray-800/90' : 'bg-white/90'}`}>
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-purple-400' : 'text-pink-600'}`}>Share Your Valentine</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Your personalized link has been copied to your clipboard. Please share it with your Valentine!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => setStage('form')} 
              className={`py-3 px-6 rounded-lg transition-all duration-300 relative group overflow-hidden ${
                isDark ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Create Another</span>
            </button>
          </div>
        </div>
      )}

      {stage === 'message' && (
        <div className="w-full max-w-md">
          {!envelopeOpened ? (
            <div 
              onClick={openEnvelope} 
              className="cursor-pointer animate-pulse-heart transition-transform hover:scale-105"
            >
              <div className={`w-64 h-48 mx-auto rounded-lg shadow-lg relative overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center text-6xl">💌</div>
                <div className={`absolute inset-0 opacity-0 hover:opacity-20 transition-opacity ${
                  isDark ? 'bg-purple-500' : 'bg-pink-200'
                }`} />
              </div>
              <p className={`text-center mt-4 ${isDark ? 'text-purple-300' : 'text-white'}`}>Click to open</p>
            </div>
          ) : (
            <div className={`rounded-lg p-6 md:p-8 animate-fadeIn shadow-2xl ${
              isDark ? 'bg-gray-800/90' : 'bg-white/90'
            }`}>
              {!yesMessage ? (
                <>
                  <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
                    isDark ? 'text-purple-400' : 'text-pink-600'
                  }`}>A Special Message For You</h2>
                  <div className={`p-4 rounded-lg mb-6 shadow-inner ${
                    isDark ? 'bg-gray-700 text-gray-200' : 'bg-pink-50 text-pink-800'
                  }`}>
                    <p>Dear {formData.recipientName},</p>
                    {isLoading ? (
                      <div className="mt-4 flex items-center gap-2">
                        <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${
                          isDark ? 'border-purple-400' : 'border-pink-600'
                        }`} />
                        <span>Generating your special message...</span>
                      </div>
                    ) : error ? (
                      <div className="mt-4 text-red-500">
                        {error}
                        <button onClick={generateMessage} className={`ml-2 underline ${
                          isDark ? 'text-purple-400' : 'text-pink-600'
                        }`}>Try again</button>
                      </div>
                    ) : (
                      <>
                        <p className="mt-4 whitespace-pre-wrap">{isRecipient ? generatedMessage : formData.traits}</p>
                        <p className="mt-4">With love,<br />{formData.senderName}</p>
                      </>
                    )}
                  </div>
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={sayYes} 
                      className={`relative group overflow-hidden px-6 py-3 rounded-full transition-all duration-300 ${
                        isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative flex items-center gap-1">
                        Accept <Heart size={16} className="animate-pulse" />
                      </span>
                    </button>
                    <button 
                      onClick={moveButton} 
                      className={`relative group overflow-hidden px-6 py-3 rounded-full transition-all duration-300 ${
                        isDark ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-400 hover:bg-gray-500 text-white'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative">Decline</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center animate-fadeIn">
                  <h2 className={`text-2xl md:text-3xl font-bold mb-4 animate-pulse-heart ${
                    isDark ? 'text-purple-400' : 'text-pink-600'
                  }`}>💖 Love Accepted! 💖</h2>
                  <p className={isDark ? 'text-gray-300' : 'text-pink-800'}>Thank you for accepting this token of love!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    <Footer isDark={isDark} />

    </div>
  );
};

export default Valentine;