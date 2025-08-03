import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { MascotEmotions, useMascotState } from './MascotEmotions';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Star, 
  Trophy, 
  Target, 
  Zap,
  Heart,
  Sparkles
} from 'lucide-react';

interface ProgressItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
  category: 'profile' | 'media' | 'experience' | 'networking' | 'achievement';
}

interface ProgressMascotProps {
  title: string;
  items: ProgressItem[];
  onItemClick?: (item: ProgressItem) => void;
  showActions?: boolean;
  className?: string;
}

export function ProgressMascot({ 
  title, 
  items, 
  onItemClick, 
  showActions = true,
  className = ""
}: ProgressMascotProps) {
  const { mascotState, updateMascot, celebrateAchievement, showProgress } = useMascotState();
  const [location, setLocation] = useLocation();
  const [previousProgress, setPreviousProgress] = useState(0);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const completedItems = items.filter(item => item.completed);
  const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
  const progressPercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  useEffect(() => {
  showProgress(progressPercentage);

  // Only run if progress increased
  if (progressPercentage > previousProgress) {
    const newlyCompleted = items.find(
      (item) => item.completed && !completedItems.slice(0, completedItems.length - 1).includes(item)
    );

    if (newlyCompleted) {
      setJustCompleted(newlyCompleted.id);
      celebrateAchievement(`${newlyCompleted.title} completed!`);

      // Reset after delay
      setTimeout(() => setJustCompleted(null), 3000);
    }

    setPreviousProgress(progressPercentage); // ← Only update when increased
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [progressPercentage]);
  const getCategoryIcon = (category: ProgressItem['category']) => {
    switch (category) {
      case 'profile':
        return <Star className="w-4 h-4" />;
      case 'media':
        return <Sparkles className="w-4 h-4" />;
      case 'experience':
        return <Trophy className="w-4 h-4" />;
      case 'networking':
        return <Heart className="w-4 h-4" />;
      case 'achievement':
        return <Target className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: ProgressItem['category']) => {
    switch (category) {
      case 'profile':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'media':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'experience':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'networking':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProgressMessage = () => {
    if (progressPercentage === 100) {
      return "🎉 Perfect! You've mastered everything!";
    } else if (progressPercentage >= 80) {
      return "⭐ Outstanding! You're almost there!";
    } else if (progressPercentage >= 60) {
      return "🚀 Great job! You're making excellent progress!";
    } else if (progressPercentage >= 40) {
      return "💪 Nice work! Keep building your profile!";
    } else if (progressPercentage >= 20) {
      return "🌟 Good start! Let's add more to your profile!";
    } else {
      return "🎯 Welcome! Let's build an amazing profile together!";
    }
  };

  const getMotivationalTip = () => {
    const incompleteTasks = items.filter(item => !item.completed);
    if (incompleteTasks.length === 0) return null;
    
    const highValueTasks = incompleteTasks.filter(item => item.points >= 20);
    if (highValueTasks.length > 0) {
      return `💡 Tip: Complete "${highValueTasks[0].title}" for a big boost!`;
    }
    
    return `💡 Tip: Start with "${incompleteTasks[0].title}" to make progress!`;
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
            {title}
          </h3>
          
          {/* Mascot */}
          <div className="flex justify-center mb-4">
            <MascotEmotions 
              state={mascotState} 
              size="large" 
              showMessage={true}
              animated={true}
            />
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {earnedPoints} / {totalPoints} points
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          
          {/* Progress message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {getProgressMessage()}
          </p>
          
          {/* Motivational tip */}
          {getMotivationalTip() && (
            <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1">
              {getMotivationalTip()}
            </p>
          )}
        </div>
        
        {/* Progress items */}
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                relative border rounded-lg p-4 transition-all duration-200 cursor-pointer
                ${item.completed 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }
                ${justCompleted === item.id ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
              `}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 pt-1">
                  {item.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${
                      item.completed ? 'text-green-800 dark:text-green-200' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getCategoryColor(item.category)}>
                        {getCategoryIcon(item.category)}
                        <span className="ml-1 text-xs">{item.category}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.points} pts
                      </Badge>
                    </div>
                  </div>
                  
                  <p className={`text-xs ${
                    item.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
              
              {/* Completion celebration */}
              {justCompleted === item.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div className="text-center">
                    <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                      +{item.points} points!
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="mt-6 flex flex-col space-y-2">
            {progressPercentage === 100 ? (
              <Button 
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
                onClick={() => celebrateAchievement("Profile Master!")}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Celebrate Achievement!
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  console.log('Continue Building Profile clicked - forcing navigation to onboarding');
                  // Always navigate to onboarding for profile completion
                  setLocation('/onboarding');
                }}
              >
                <Target className="w-4 h-4 mr-2" />
                Continue Building Profile
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                console.log('Get Motivated clicked - updating mascot and navigating to onboarding');
                updateMascot({ 
                  emotion: 'motivated', 
                  message: "I believe in you! Let's make it happen!" 
                });
                // Navigate to onboarding after a short delay to show the motivation message
                setTimeout(() => {
                  setLocation('/onboarding');
                }, 1000);
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Get Motivated
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sample progress data for different contexts
export const sampleProfileProgress: ProgressItem[] = [
  {
    id: 'basic-info',
    title: 'Complete Basic Information',
    description: 'Add your name, email, and contact details',
    completed: true,
    points: 20,
    category: 'profile'
  },
  {
    id: 'profile-image',
    title: 'Upload Profile Image',
    description: 'Add a professional headshot',
    completed: false,
    points: 25,
    category: 'profile'
  },
  {
    id: 'bio',
    title: 'Write Your Bio',
    description: 'Tell your story in 300 words',
    completed: false,
    points: 30,
    category: 'profile'
  },
  {
    id: 'skills',
    title: 'Add Skills & Talents',
    description: 'List your key abilities and expertise',
    completed: false,
    points: 25,
    category: 'profile'
  },
  {
    id: 'portfolio',
    title: 'Upload Portfolio Media',
    description: 'Add photos, videos, or audio samples',
    completed: false,
    points: 35,
    category: 'media'
  },
  {
    id: 'experience',
    title: 'Add Work Experience',
    description: 'Include past jobs and projects',
    completed: false,
    points: 30,
    category: 'experience'
  },
  {
    id: 'verification',
    title: 'Get Verified',
    description: 'Complete identity verification',
    completed: false,
    points: 40,
    category: 'achievement'
  }
];