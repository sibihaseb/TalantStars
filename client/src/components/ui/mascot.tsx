import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Sparkles, Zap, Trophy, Gift, Smile, Sun, Music } from 'lucide-react';

export type MascotEmotion = 
  | 'happy' 
  | 'excited' 
  | 'celebrating' 
  | 'thinking' 
  | 'sleepy' 
  | 'surprised' 
  | 'proud' 
  | 'encouraging' 
  | 'dancing' 
  | 'relaxed';

export type MascotSize = 'sm' | 'md' | 'lg' | 'xl';

interface MascotProps {
  emotion?: MascotEmotion;
  size?: MascotSize;
  message?: string;
  showMessage?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

const emotionColors = {
  happy: 'from-yellow-400 to-orange-400',
  excited: 'from-pink-400 to-purple-400',
  celebrating: 'from-green-400 to-blue-400',
  thinking: 'from-blue-400 to-indigo-400',
  sleepy: 'from-purple-400 to-pink-400',
  surprised: 'from-orange-400 to-red-400',
  proud: 'from-green-400 to-teal-400',
  encouraging: 'from-blue-400 to-cyan-400',
  dancing: 'from-pink-400 to-yellow-400',
  relaxed: 'from-green-400 to-blue-400'
};

const emotionIcons = {
  happy: Smile,
  excited: Zap,
  celebrating: Trophy,
  thinking: Sparkles,
  sleepy: Sun,
  surprised: Star,
  proud: Trophy,
  encouraging: Heart,
  dancing: Music,
  relaxed: Gift
};

const emotionAnimations = {
  happy: {
    animate: { rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  excited: {
    animate: { y: [0, -10, 0], rotate: [0, 10, -10, 0] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  celebrating: {
    animate: { scale: [1, 1.2, 1.1, 1], rotate: [0, 360] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  thinking: {
    animate: { rotate: [0, 5, -5, 0], y: [0, -2, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  sleepy: {
    animate: { rotate: [0, -10, 0], scale: [1, 0.95, 1] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  surprised: {
    animate: { scale: [1, 1.15, 1], rotate: [0, 15, -15, 0] },
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  },
  proud: {
    animate: { y: [0, -5, 0], scale: [1, 1.05, 1] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
  },
  encouraging: {
    animate: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  dancing: {
    animate: { rotate: [0, 15, -15, 0], y: [0, -8, 0] },
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  },
  relaxed: {
    animate: { rotate: [0, 2, -2, 0], scale: [1, 1.02, 1] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};

export function Mascot({ 
  emotion = 'happy', 
  size = 'md', 
  message, 
  showMessage = true,
  animate = true,
  className = ''
}: MascotProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [showBubble, setShowBubble] = useState(false);
  
  const IconComponent = emotionIcons[emotion];
  const colorClass = emotionColors[emotion];
  const animation = emotionAnimations[emotion];

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setShowBubble(true);
      
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Speech bubble */}
      {showMessage && showBubble && currentMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-w-48 z-10"
        >
          <p className="text-xs text-gray-700 dark:text-gray-300 text-center font-medium">
            {currentMessage}
          </p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
        </motion.div>
      )}

      {/* Mascot */}
      <motion.div
        className={`${sizeClasses[size]} bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center shadow-lg relative overflow-hidden`}
        {...(animate ? animation : {})}
      >
        {/* Sparkles for extra magic */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-3 left-1 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-1000"></div>
        </div>

        {/* Main icon */}
        <IconComponent 
          className={`${
            size === 'sm' ? 'w-6 h-6' : 
            size === 'md' ? 'w-8 h-8' : 
            size === 'lg' ? 'w-12 h-12' : 
            'w-16 h-16'
          } text-white drop-shadow-sm`} 
        />

        {/* Cute eyes */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white/40 rounded-full"></div>
      </motion.div>

      {/* Floating particles for celebration */}
      {emotion === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Mascot;