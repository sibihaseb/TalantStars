import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mascot, MascotEmotion, MascotSize } from '@/components/ui/mascot';
import { EmotionalProgress } from '@/components/ui/emotional-progress';
import { Sparkles, Heart, Trophy, Zap, Star, Sun } from 'lucide-react';

const emotions: MascotEmotion[] = [
  'happy', 'excited', 'celebrating', 'thinking', 'sleepy', 
  'surprised', 'proud', 'encouraging', 'dancing', 'relaxed'
];

const sizes: MascotSize[] = ['sm', 'md', 'lg', 'xl'];

export default function MascotDemo() {
  const [selectedEmotion, setSelectedEmotion] = useState<MascotEmotion>('happy');
  const [selectedSize, setSelectedSize] = useState<MascotSize>('md');
  const [message, setMessage] = useState("Hello! I'm your friendly mascot! 🎉");
  const [showMessage, setShowMessage] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [progressStep, setProgressStep] = useState(5);

  const triggerMessage = () => {
    setShowMessage(false);
    setTimeout(() => setShowMessage(true), 100);
  };

  const emotionDescriptions = {
    happy: "Cheerful and welcoming, perfect for positive interactions",
    excited: "Full of energy and enthusiasm, great for achievements",
    celebrating: "Party time! For major accomplishments and milestones",
    thinking: "Contemplative and focused, ideal for complex tasks",
    sleepy: "Relaxed and calm, good for downtime or rest periods",
    surprised: "Amazed and impressed, perfect for unexpected moments",
    proud: "Accomplished and confident, great for completed goals",
    encouraging: "Supportive and motivating, ideal for difficult tasks",
    dancing: "Joyful and expressive, perfect for fun celebrations",
    relaxed: "Peaceful and content, great for calm moments"
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Mascot & Emotional Progress Demo
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience our cute mascot system that provides emotional feedback and encouragement throughout the user journey
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Mascot Controls */}
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span>Mascot Controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="emotion">Emotion</Label>
                    <Select value={selectedEmotion} onValueChange={(value) => setSelectedEmotion(value as MascotEmotion)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an emotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.map((emotion) => (
                          <SelectItem key={emotion} value={emotion}>
                            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {emotionDescriptions[selectedEmotion]}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select value={selectedSize} onValueChange={(value) => setSelectedSize(value as MascotSize)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Input
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter a message..."
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={triggerMessage}
                      variant="outline"
                      size="sm"
                    >
                      Show Message
                    </Button>
                    <Button
                      onClick={() => setAnimate(!animate)}
                      variant="outline"
                      size="sm"
                    >
                      {animate ? 'Stop Animation' : 'Start Animation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mascot Display */}
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span>Mascot Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-64">
                  <Mascot
                    emotion={selectedEmotion}
                    size={selectedSize}
                    message={message}
                    showMessage={showMessage}
                    animate={animate}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Emotional Progress Demo */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Emotional Progress System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Progress Step (1-10)</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setProgressStep(Math.max(1, progressStep - 1))}
                      disabled={progressStep <= 1}
                      variant="outline"
                      size="sm"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={progressStep}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 1 && val <= 10) {
                          setProgressStep(val);
                        }
                      }}
                      min={1}
                      max={10}
                      className="w-20 text-center"
                    />
                    <Button
                      onClick={() => setProgressStep(Math.min(10, progressStep + 1))}
                      disabled={progressStep >= 10}
                      variant="outline"
                      size="sm"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current step: {progressStep} of 10
                  </p>
                </div>

                <EmotionalProgress
                  currentStep={progressStep}
                  totalSteps={10}
                  stepTitle="Demo Progress"
                  completedSteps={
                    Array.from({ length: progressStep - 1 }, (_, i) => `Step ${i + 1}`)
                  }
                  showRewards={true}
                  onStepComplete={(step) => {
                    console.log(`Demo step ${step} completed!`);
                  }}
                />
              </CardContent>
            </Card>

            {/* Emotion Gallery */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  <span>Emotion Gallery</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {emotions.map((emotion) => (
                    <div key={emotion} className="text-center space-y-2">
                      <div className="flex justify-center">
                        <Mascot
                          emotion={emotion}
                          size="md"
                          animate={true}
                          showMessage={false}
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {emotion}
                      </p>
                      <Button
                        onClick={() => setSelectedEmotion(emotion)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}