import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MascotEmotions, useMascotState, MascotState } from '@/components/mascot/MascotEmotions';
import { ProgressMascot, sampleProfileProgress } from '@/components/mascot/ProgressMascot';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { 
  Heart, 
  Star, 
  Sparkles, 
  Trophy, 
  Zap, 
  Sun, 
  Moon, 
  Target,
  Play,
  Pause
} from 'lucide-react';

export default function MascotDemo() {
  const { mascotState, updateMascot, celebrateAchievement, showProgress } = useMascotState();
  const [isAnimated, setIsAnimated] = useState(true);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [progressItems, setProgressItems] = useState(sampleProfileProgress);

  const emotions: MascotState['emotion'][] = [
    'happy', 'excited', 'proud', 'celebrating', 'motivated', 'calm', 'focused', 'sleepy'
  ];

  const emotionDescriptions = {
    happy: 'Cheerful and positive, ready to help',
    excited: 'Energetic and enthusiastic about progress',
    proud: 'Satisfied with accomplishments',
    celebrating: 'Congratulating on achievements',
    motivated: 'Encouraging and inspiring',
    calm: 'Peaceful and relaxed',
    focused: 'Concentrated and determined',
    sleepy: 'Tired or in rest mode'
  };

  const handleEmotionChange = (emotion: MascotState['emotion']) => {
    const messages = {
      happy: "I'm so happy to help you today! ✨",
      excited: "This is amazing! Let's keep going! 🚀",
      proud: "Look at what you've accomplished! 🌟",
      celebrating: "Congratulations! You did it! 🎉",
      motivated: "You've got this! Let's achieve greatness! 💪",
      calm: "Take a deep breath. We're doing great. 😌",
      focused: "Let's concentrate and get this done. 🎯",
      sleepy: "Maybe it's time for a little break? 😴"
    };

    updateMascot({
      emotion,
      message: messages[emotion]
    });
  };

  const handleProgressChange = (progress: number) => {
    showProgress(progress);
  };

  const handleItemToggle = (itemId: string) => {
    setProgressItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const triggerAchievement = () => {
    celebrateAchievement("Demo Master!");
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Emotional Progress Mascot Demo
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Meet your friendly progress companion! This mascot adapts to your progress and celebrates your achievements.
              </p>
            </div>

            <Tabs defaultValue="emotions" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="emotions">Emotions Demo</TabsTrigger>
                <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
                <TabsTrigger value="integration">Integration Example</TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Mascot Display */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <span>Interactive Mascot</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
                        <MascotEmotions 
                          state={mascotState}
                          size={selectedSize}
                          showMessage={true}
                          animated={isAnimated}
                        />
                      </div>
                      
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center space-x-4">
                          <span className="text-sm font-medium">Size:</span>
                          {(['small', 'medium', 'large'] as const).map(size => (
                            <Button
                              key={size}
                              variant={selectedSize === size ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSize(size)}
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAnimated(!isAnimated)}
                        >
                          {isAnimated ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {isAnimated ? 'Pause' : 'Play'} Animation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-green-500" />
                        <span>Emotion Controls</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Choose Emotion:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {emotions.map(emotion => (
                            <Button
                              key={emotion}
                              variant={mascotState.emotion === emotion ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleEmotionChange(emotion)}
                              className="justify-start"
                            >
                              {emotion}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Progress Simulation:</h4>
                        <div className="space-y-3">
                          {[0, 25, 50, 75, 100].map(progress => (
                            <Button
                              key={progress}
                              variant="outline"
                              size="sm"
                              onClick={() => handleProgressChange(progress)}
                              className="w-full justify-start"
                            >
                              {progress}% Complete
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Special Actions:</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={triggerAchievement}
                            className="w-full justify-start"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Trigger Achievement
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateMascot({
                              emotion: 'motivated',
                              message: "You're doing amazing! Keep it up! 💪"
                            })}
                            className="w-full justify-start"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Motivate User
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Emotion Reference */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emotion Reference</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {emotions.map(emotion => (
                        <div key={emotion} className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">{emotion}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {emotionDescriptions[emotion]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <ProgressMascot
                    title="Profile Completion"
                    items={progressItems}
                    onItemClick={(item) => handleItemToggle(item.id)}
                    showActions={true}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Interactive Progress Demo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click on any progress item to toggle its completion status and watch the mascot react!
                      </p>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Quick Actions:</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProgressItems(prev => 
                              prev.map(item => ({ ...item, completed: true }))
                            )}
                          >
                            Complete All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProgressItems(prev => 
                              prev.map(item => ({ ...item, completed: false }))
                            )}
                          >
                            Reset All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProgressItems(prev => 
                              prev.map(item => ({ 
                                ...item, 
                                completed: Math.random() > 0.5 
                              }))
                            )}
                          >
                            Random Progress
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Features:</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <li>• Dynamic emotional responses to progress</li>
                          <li>• Point-based achievement system</li>
                          <li>• Categorized progress items</li>
                          <li>• Motivational tips and messages</li>
                          <li>• Celebration animations</li>
                          <li>• Progress persistence</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="integration">
                <Card>
                  <CardHeader>
                    <CardTitle>Integration in Real Application</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Usage Examples:</h4>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <strong>Onboarding:</strong> Guide users through profile completion with encouraging feedback
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <strong>Dashboard:</strong> Show overall progress and motivate continued engagement
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <strong>Tasks:</strong> Provide emotional feedback for completed objectives
                          </div>
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <strong>Achievements:</strong> Celebrate milestones and accomplishments
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Implementation Code:</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                          <pre>{`// Basic Usage
import { ProgressMascot } from '@/components/mascot/ProgressMascot';

<ProgressMascot 
  title="Profile Setup"
  items={progressItems}
  onItemClick={handleItemClick}
  showActions={true}
/>

// Custom Mascot State
import { MascotEmotions, useMascotState } from '@/components/mascot/MascotEmotions';

const { mascotState, updateMascot, celebrateAchievement } = useMascotState();

// Celebrate achievements
celebrateAchievement("First Login!");

// Update progress
showProgress(75);`}</pre>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                      <h4 className="font-semibold mb-3">Key Features:</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-2">Emotional Intelligence:</h5>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>• Adapts to user progress</li>
                            <li>• Contextual emotional responses</li>
                            <li>• Personalized messaging</li>
                            <li>• Achievement celebrations</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Technical Features:</h5>
                          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>• Smooth animations with Framer Motion</li>
                            <li>• Responsive design</li>
                            <li>• Theme-aware styling</li>
                            <li>• Extensible emotion system</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}