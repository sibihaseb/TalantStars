import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, Shield, BarChart3, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    
    setPreferences(essentialOnly);
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      icon: <Shield className="h-4 w-4" />,
      title: 'Strictly Necessary',
      description: 'Essential cookies required for the platform to function properly. These cannot be disabled.',
      disabled: true,
      color: 'bg-red-500'
    },
    {
      key: 'functional' as keyof CookiePreferences,
      icon: <Settings className="h-4 w-4" />,
      title: 'Functional',
      description: 'Remember your preferences and settings to enhance your experience.',
      disabled: false,
      color: 'bg-blue-500'
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      icon: <BarChart3 className="h-4 w-4" />,
      title: 'Analytics',
      description: 'Help us understand how you use our platform to improve our services.',
      disabled: false,
      color: 'bg-green-500'
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      icon: <Target className="h-4 w-4" />,
      title: 'Marketing',
      description: 'Personalize content and advertisements based on your interests.',
      disabled: false,
      color: 'bg-purple-500'
    }
  ];

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-6 md:right-6"
          >
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Cookie className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Cookie Consent
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      We use cookies to enhance your experience, analyze site usage, and personalize content. 
                      By continuing to use our platform, you consent to our use of cookies in accordance with our Privacy Policy.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <Button
                        onClick={handleAcceptAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Accept All
                      </Button>
                      
                      <Button
                        onClick={handleRejectAll}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Reject All
                      </Button>
                      
                      <Dialog open={showSettings} onOpenChange={setShowSettings}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Customize
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Cookie className="h-5 w-5" />
                              Cookie Preferences
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Manage your cookie preferences below. You can change these settings at any time.
                            </div>
                            
                            {cookieTypes.map((type) => (
                              <div key={type.key} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${type.color} text-white`}>
                                      {type.icon}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900 dark:text-white">
                                        {type.title}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {type.description}
                                      </p>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={preferences[type.key]}
                                    onCheckedChange={(checked) => updatePreference(type.key, checked)}
                                    disabled={type.disabled}
                                  />
                                </div>
                                
                                {type.disabled && (
                                  <Badge variant="secondary" className="text-xs">
                                    Always Active
                                  </Badge>
                                )}
                              </div>
                            ))}
                            
                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                onClick={handleAcceptSelected}
                                className="flex-1"
                              >
                                Save Preferences
                              </Button>
                              <Button
                                onClick={() => setShowSettings(false)}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        onClick={() => setShowBanner(false)}
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsentBanner;