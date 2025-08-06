import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mascot, MascotEmotion } from './mascot';
import { CheckCircle, Star, Trophy, Sparkles, Heart, Zap, Target, Gift } from 'lucide-react';

interface EmotionalProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  completedSteps?: string[];
  className?: string;
  onStepComplete?: (step: number) => void;
  showRewards?: boolean;
}

interface ProgressStage {
  threshold: number;
  emotion: MascotEmotion;
  message: string;
  color: string;
  reward?: string;
  achievement?: string;
}

const progressStages: ProgressStage[] = [
  {
    threshold: 0,
    emotion: 'encouraging',
    message: "Let's get started! You've got this! 🌟",
    color: 'from-blue-400 to-cyan-400',
    achievement: 'First Steps'
  },
  {
    threshold: 20,
    emotion: 'happy',
    message: "Great start! You're doing amazing! 😊",
    color: 'from-green-400 to-teal-400',
    reward: 'Early Bird Badge',
    achievement: 'Getting Started'
  },
  {
    threshold: 40,
    emotion: 'excited',
    message: "Wow! You're on fire! Keep going! 🔥",
    color: 'from-yellow-400 to-orange-400',
    reward: 'Progress Star',
    achievement: 'Making Progress'
  },
  {
    threshold: 60,
    emotion: 'proud',
    message: "More than halfway! You're unstoppable! 💪",
    color: 'from-purple-400 to-pink-400',
    reward: 'Determination Medal',
    achievement: 'Halfway Hero'
  },
  {
    threshold: 80,
    emotion: 'dancing',
    message: "Almost there! The finish line is in sight! 🎯",
    color: 'from-pink-400 to-red-400',
    reward: 'Nearly There Trophy',
    achievement: 'Final Sprint'
  },
  {
    threshold: 100,
    emotion: 'celebrating',
    message: "🎉 Congratulations! You did it! Amazing work! 🎊",
    color: 'from-green-400 to-blue-400',
    reward: 'Completion Crown',
    achievement: 'Profile Master'
  }
];

const milestoneMessages = [
  "You're building something amazing! ✨",
  "Every step brings you closer to success! 🚀",
  "Your dedication is inspiring! 💖",
  "You're creating your perfect profile! 🎨",
  "Success is just around the corner! 🌈",
  "You're doing fantastic work! ⭐",
  "This is going to be incredible! 🎭",
  "You're making great progress! 🏆"
];

export function EmotionalProgress({
  currentStep,
  totalSteps,
  stepTitle,
  completedSteps = [],
  className = '',
  onStepComplete,
  showRewards = true
}: EmotionalProgressProps) {
  const [currentStage, setCurrentStage] = useState<ProgressStage>(progressStages[0]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState('');
  const [earnedRewards, setEarnedRewards] = useState<string[]>([]);
  const [showReward, setShowReward] = useState(false);

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    // Find the current stage based on progress
    const stage = progressStages
      .slice()
      .reverse()
      .find(s => progressPercent >= s.threshold) || progressStages[0];
    
    if (stage !== currentStage) {
      setCurrentStage(stage);
      
      // Show milestone celebration
      if (progressPercent > 0 && progressPercent % 20 === 0) {
        setMilestoneMessage(milestoneMessages[Math.floor(Math.random() * milestoneMessages.length)]);
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 3000);
      }
      
      // Show reward if earned
      if (stage.reward && !earnedRewards.includes(stage.reward)) {
        setEarnedRewards(prev => [...prev, stage.reward!]);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 4000);
      }
    }
  }, [progressPercent, currentStage, earnedRewards]);

  useEffect(() => {
    if (onStepComplete && currentStep > 0) {
      onStepComplete(currentStep);
    }
  }, [currentStep, onStepComplete]);

  const getCurrentIcon = () => {
    if (progressPercent === 100) return Trophy;
    if (progressPercent >= 80) return Target;
    if (progressPercent >= 60) return Zap;
    if (progressPercent >= 40) return Star;
    if (progressPercent >= 20) return Heart;
    return Sparkles;
  };

  const IconComponent = getCurrentIcon();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Progress Card */}
      <Card className="relative overflow-hidden border-2 border-gradient-to-r from-blue-200 to-purple-200 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Mascot 
                emotion={currentStage.emotion}
                size="lg"
                message={currentStage.message}
                showMessage={true}
                animate={true}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {stepTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
            
            {/* <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={`bg-gradient-to-r ${currentStage.color} text-white border-0`}
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {progressPercent}%
              </Badge>
              {currentStage.achievement && (
                <Badge variant="outline" className="text-xs">
                  {currentStage.achievement}
                </Badge>
              )}
            </div> */}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Progress</span>
              <span>{currentStep}/{totalSteps} completed</span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercent} 
                className="h-3 bg-gray-200 dark:bg-gray-700" 
              />
              <div 
                className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${currentStage.color} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Completed Steps Indicator */}
          {completedSteps.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {completedSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center text-xs text-green-600 dark:text-green-400"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {step}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Celebration particles */}
        {progressPercent === 100 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Milestone Celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-300"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">{milestoneMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Notification */}
      <AnimatePresence>
        {showReward && showRewards && currentStage.reward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg shadow-lg border-2 border-purple-300"
          >
            <div className="flex items-center space-x-3">
              <Gift className="w-6 h-6" />
              <div>
                <p className="font-semibold">Reward Earned!</p>
                <p className="text-sm opacity-90">{currentStage.reward}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Rewards Collection */}
      {showRewards && earnedRewards.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-2 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-800 dark:text-purple-300">
                Rewards ({earnedRewards.length})
              </span>
            </div>
            <div className="flex space-x-1">
              {earnedRewards.slice(0, 3).map((_, index) => (
                <Star key={index} className="w-3 h-3 text-yellow-500" />
              ))}
              {earnedRewards.length > 3 && <span className="text-xs text-purple-600">+{earnedRewards.length - 3}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmotionalProgress;