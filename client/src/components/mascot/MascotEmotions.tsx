import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles, Trophy, Medal, PartyPopper, Zap, Target, Sun, Moon } from 'lucide-react';

export interface MascotState {
  emotion: 'happy' | 'excited' | 'proud' | 'celebrating' | 'motivated' | 'calm' | 'focused' | 'sleepy';
  progress: number;
  message: string;
  achievement?: string;
}

interface MascotEmotionsProps {
  state: MascotState;
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
  animated?: boolean;
}

export function MascotEmotions({ 
  state, 
  size = 'medium', 
  showMessage = true, 
  animated = true 
}: MascotEmotionsProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  useEffect(() => {
    if (state.achievement) {
      setShowAchievement(true);
      const timer = setTimeout(() => setShowAchievement(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.achievement]);

  const getMascotSVG = () => {
    const sizeClass = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16',
      large: 'w-24 h-24'
    }[size];

    const baseColor = getEmotionColor();
    const eyeStyle = getEyeStyle();
    const mouthStyle = getMouthStyle();

    return (
      <motion.div
        className={`${sizeClass} relative`}
        animate={animated ? getAnimationProps() : {}}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Main body */}
          <motion.circle
            cx="50"
            cy="50"
            r="35"
            fill={baseColor}
            stroke="#4A90E2"
            strokeWidth="3"
            animate={animated ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Inner glow */}
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="rgba(255, 255, 255, 0.2)"
          />
          
          {/* Eyes */}
          <motion.g>
            <circle cx="42" cy="42" r="4" fill="#333" />
            <circle cx="58" cy="42" r="4" fill="#333" />
            {/* Eye sparkles */}
            <circle cx="43" cy="41" r="1.5" fill="white" />
            <circle cx="59" cy="41" r="1.5" fill="white" />
            {eyeStyle}
          </motion.g>
          
          {/* Mouth */}
          {mouthStyle}
          
          {/* Cheeks */}
          {(state.emotion === 'happy' || state.emotion === 'excited') && (
            <motion.g
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <circle cx="30" cy="55" r="6" fill="#FFB6C1" opacity="0.7" />
              <circle cx="70" cy="55" r="6" fill="#FFB6C1" opacity="0.7" />
            </motion.g>
          )}
          
          {/* Special effects */}
          {getSpecialEffects()}
        </svg>
        
        {/* Floating particles */}
        {state.emotion === 'celebrating' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${10 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  rotate: [0, 360],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const getEmotionColor = () => {
    const colors = {
      happy: '#FFE55C',
      excited: '#FF6B6B',
      proud: '#4ECDC4',
      celebrating: '#FFD93D',
      motivated: '#6BCF7F',
      calm: '#A8E6CF',
      focused: '#88D8B0',
      sleepy: '#DDA0DD'
    };
    return colors[state.emotion];
  };

  const getEyeStyle = () => {
    switch (state.emotion) {
      case 'happy':
      case 'excited':
        return (
          <g>
            <path d="M 38 40 Q 42 36 46 40" stroke="#333" strokeWidth="2" fill="none" />
            <path d="M 54 40 Q 58 36 62 40" stroke="#333" strokeWidth="2" fill="none" />
          </g>
        );
      case 'sleepy':
        return (
          <g>
            <path d="M 38 42 Q 42 40 46 42" stroke="#333" strokeWidth="2" fill="none" />
            <path d="M 54 42 Q 58 40 62 42" stroke="#333" strokeWidth="2" fill="none" />
          </g>
        );
      case 'focused':
        return (
          <g>
            <path d="M 38 41 L 46 41" stroke="#333" strokeWidth="2" />
            <path d="M 54 41 L 62 41" stroke="#333" strokeWidth="2" />
          </g>
        );
      default:
        return null;
    }
  };

  const getMouthStyle = () => {
    switch (state.emotion) {
      case 'happy':
      case 'excited':
        return (
          <motion.path
            d="M 42 58 Q 50 64 58 58"
            stroke="#333"
            strokeWidth="2"
            fill="none"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          />
        );
      case 'celebrating':
        return (
          <motion.ellipse
            cx="50"
            cy="62"
            rx="8"
            ry="6"
            fill="#333"
            animate={{ ry: [6, 8, 6] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        );
      case 'proud':
        return (
          <path
            d="M 44 60 Q 50 56 56 60"
            stroke="#333"
            strokeWidth="2"
            fill="none"
          />
        );
      case 'motivated':
        return (
          <motion.path
            d="M 44 58 Q 50 62 56 58"
            stroke="#333"
            strokeWidth="2"
            fill="none"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          />
        );
      case 'calm':
        return (
          <path
            d="M 46 60 L 54 60"
            stroke="#333"
            strokeWidth="2"
          />
        );
      case 'sleepy':
        return (
          <ellipse
            cx="50"
            cy="60"
            rx="4"
            ry="2"
            fill="#333"
          />
        );
      default:
        return (
          <path
            d="M 44 60 Q 50 56 56 60"
            stroke="#333"
            strokeWidth="2"
            fill="none"
          />
        );
    }
  };

  const getSpecialEffects = () => {
    switch (state.emotion) {
      case 'celebrating':
        return (
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-yellow-400" x="20" y="20" />
            <Star className="w-3 h-3 text-yellow-400" x="75" y="25" />
            <Star className="w-2 h-2 text-yellow-400" x="15" y="70" />
          </motion.g>
        );
      case 'motivated':
        return (
          <motion.g
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <circle cx="50" cy="25" r="3" fill="#FFD700" />
            <path d="M 50 22 L 52 18 L 50 20 L 48 18 Z" fill="#FFD700" />
          </motion.g>
        );
      default:
        return null;
    }
  };

  const getAnimationProps = () => {
    switch (state.emotion) {
      case 'excited':
        return {
          y: [-2, 2, -2],
          rotate: [-1, 1, -1],
        };
      case 'celebrating':
        return {
          y: [-5, 5, -5],
          rotate: [-3, 3, -3],
          scale: [1, 1.1, 1],
        };
      case 'motivated':
        return {
          y: [-1, 1, -1],
          scale: [1, 1.02, 1],
        };
      case 'happy':
        return {
          y: [-1, 1, -1],
        };
      default:
        return {};
    }
  };

  const getProgressColor = () => {
    if (state.progress >= 80) return 'text-green-500';
    if (state.progress >= 60) return 'text-blue-500';
    if (state.progress >= 40) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Mascot */}
      <div className="relative">
        {getMascotSVG()}
        
        {/* Progress indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-lg border">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getProgressColor()}`} 
                   style={{ backgroundColor: getEmotionColor() }} />
              <span className="text-xs font-medium">{state.progress}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Message */}
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg border max-w-xs text-center"
        >
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {state.message}
          </p>
        </motion.div>
      )}
      
      {/* Achievement notification */}
      <AnimatePresence>
        {showAchievement && state.achievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-bold">{state.achievement}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper hook for managing mascot state
export function useMascotState() {
  const [mascotState, setMascotState] = useState<MascotState>({
    emotion: 'happy',
    progress: 0,
    message: "Let's get started! 🌟"
  });

  const updateMascot = (updates: Partial<MascotState>) => {
    setMascotState(prev => ({ ...prev, ...updates }));
  };

  const celebrateAchievement = (achievement: string) => {
    setMascotState(prev => ({
      ...prev,
      emotion: 'celebrating',
      achievement,
      message: "Congratulations! You did it! 🎉"
    }));
  };

  const showProgress = (progress: number) => {
    let emotion: MascotState['emotion'] = 'motivated';
    let message = "Keep going! You're doing great!";
    
    if (progress >= 100) {
      emotion = 'celebrating';
      message = "Perfect! You've completed everything! 🎊";
    } else if (progress >= 80) {
      emotion = 'proud';
      message = "Almost there! You're so close!";
    } else if (progress >= 60) {
      emotion = 'excited';
      message = "Great progress! Keep it up!";
    } else if (progress >= 40) {
      emotion = 'motivated';
      message = "You're on the right track!";
    } else if (progress >= 20) {
      emotion = 'happy';
      message = "Nice start! Let's keep building!";
    }
    
    setMascotState(prev => ({
      ...prev,
      emotion,
      progress,
      message
    }));
  };

  return {
    mascotState,
    updateMascot,
    celebrateAchievement,
    showProgress
  };
}