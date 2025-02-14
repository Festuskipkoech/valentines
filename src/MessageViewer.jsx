import React, { useState, useEffect } from 'react';
import { Heart, Share2 } from 'lucide-react';

const MessageViewer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  // Simulate loading message data from URL parameters
  const demoMessage = {
    to: "Sarah",
    from: "John",
    message: "Your kindness, creativity, and beautiful smile make every day brighter. You fill my world with joy and wonder."
  };

  useEffect(() => {
    // Animate message in after component mounts
    setTimeout(() => setIsVisible(true), 500);
    setTimeout(() => setShowHearts(true), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 p-4 flex items-center justify-center">
      <div className="relative max-w-lg w-full">
        {/* Floating hearts background animation */}
        {showHearts && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <Heart 
                key={i}
                className={`absolute text-pink-400 opacity-50 animate-float-${i + 1}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${6 + i}s ease-in-out infinite`
                }}
              />
            ))}
          </div>
        )}

        {/* Main message card */}
        <div 
          className={`
            backdrop-blur-xl bg-white/70 rounded-2xl p-8 shadow-xl
            transform transition-all duration-1000
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}
        >
          {/* Decorative header */}
          <div className="flex justify-center mb-6">
            <Heart className="text-red-500 w-12 h-12 animate-pulse" />
          </div>

          {/* Message content */}
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              A Valentine's Message For You
            </h1>
            
            <div className="space-y-4">
              <p className="text-gray-700 text-lg leading-relaxed">
                {demoMessage.message}
              </p>
              
              <p className="text-pink-600 font-medium">
                With love,<br/>
                {demoMessage.from}
              </p>
            </div>

            {/* Share button */}
            <button className="mt-8 flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share This Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageViewer;