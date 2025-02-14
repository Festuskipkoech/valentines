import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';

const Footer = ({ isDark }) => {
  return (
    <footer className={`w-full py-4 mt-auto ${
      isDark 
        ? 'bg-gradient-to-r from-purple-900/80 to-gray-900/80 text-gray-300' 
        : 'bg-gradient-to-r from-pink-500/80 to-pink-700/80 text-white'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="text-pink-400 animate-pulse" size={16} />
            <span className="font-medium">Made by Martial School of IT</span>
          </div>
          
          <div className="text-sm opacity-80">
            Made with love for your special love
          </div>
          
          <div className="flex items-center gap-3">
            <a href="https://x.com/DevsFestus" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`transition-colors hover:underline flex items-center gap-1 ${
                isDark ? 'hover:text-purple-400' : 'hover:text-pink-200'
              }`}
            >
              <span>x</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;