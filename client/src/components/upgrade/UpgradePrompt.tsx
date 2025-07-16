import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Zap, 
  Upload, 
  Image, 
  Video, 
  Music, 
  ExternalLink, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Star,
  Gift
} from "lucide-react";
import { Link } from "wouter";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'photos' | 'videos' | 'audio' | 'external_links' | 'storage';
  currentCount: number;
  maxAllowed: number;
  currentPlan?: string;
}

const limitTypeConfig = {
  photos: {
    icon: Image,
    title: "Photo Upload Limit Reached",
    description: "You've reached your photo upload limit",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-700"
  },
  videos: {
    icon: Video,
    title: "Video Upload Limit Reached",
    description: "You've reached your video upload limit",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-700"
  },
  audio: {
    icon: Music,
    title: "Audio Upload Limit Reached",
    description: "You've reached your audio upload limit",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-700"
  },
  external_links: {
    icon: ExternalLink,
    title: "External Link Limit Reached",
    description: "You've reached your external link limit",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-700"
  },
  storage: {
    icon: Upload,
    title: "Storage Limit Reached",
    description: "You've reached your storage limit",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-700"
  }
};

const upgradeFeatures = [
  {
    icon: Crown,
    title: "Unlimited Uploads",
    description: "Upload as many photos, videos, and audio files as you need"
  },
  {
    icon: Zap,
    title: "Priority Processing",
    description: "Your media gets processed faster with priority queuing"
  },
  {
    icon: Star,
    title: "Premium Features",
    description: "Access to advanced editing tools and AI enhancements"
  },
  {
    icon: Sparkles,
    title: "Enhanced Profile",
    description: "Stand out with premium profile features and badges"
  }
];

export function UpgradePrompt({ isOpen, onClose, limitType, currentCount, maxAllowed, currentPlan = "Free" }: UpgradePromptProps) {
  const config = limitTypeConfig[limitType];
  const IconComponent = config.icon;
  const progressPercentage = (currentCount / maxAllowed) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className={`p-2 rounded-full ${config.bgColor} ${config.borderColor} border`}>
              <IconComponent className={`h-6 w-6 ${config.color}`} />
            </div>
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {config.description}. Upgrade to continue uploading without limits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Progress */}
          <Card className={`${config.borderColor} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Current Usage</span>
                <Badge variant="outline" className={`${config.color} font-semibold`}>
                  {currentCount} / {maxAllowed}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>You've used {currentCount} out of {maxAllowed} allowed</span>
                  <span>{(100 - progressPercentage).toFixed(0)}% remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <div className="text-center py-4">
            <Badge variant="outline" className="text-sm px-4 py-2">
              Current Plan: {currentPlan}
            </Badge>
          </div>

          {/* Upgrade Benefits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              Unlock Premium Features
            </h3>
            <div className="grid gap-3">
              {upgradeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                  <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                    <feature.icon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white text-center">
              <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">Ready to Go Premium?</h3>
              <p className="text-purple-100 mb-4">
                Join thousands of creators who've unlocked their potential
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  asChild 
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                >
                  <Link href="/pricing">
                    <Sparkles className="h-4 w-4 mr-2" />
                    View Pricing Plans
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help choosing the right plan? 
              <Button variant="link" className="p-0 ml-1 h-auto text-purple-600 hover:text-purple-700">
                Contact our support team
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}