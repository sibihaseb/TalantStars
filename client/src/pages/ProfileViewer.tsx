import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkillEndorsements } from "@/components/talent/SkillEndorsements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  CheckCircle, 
  MessageCircle,
  DollarSign,
  Clock
} from "lucide-react";

export default function ProfileViewer() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  
  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile', userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (!profile) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                The profile you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview */}
              <div className="lg:col-span-1">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarFallback className="text-2xl">
                        {profile.displayName?.charAt(0) || profile.userId?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center justify-center gap-2">
                      <CardTitle className="text-2xl">
                        {profile.displayName || 'Anonymous User'}
                      </CardTitle>
                      {profile.isVerified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {profile.role || 'talent'}
                      </Badge>
                      {profile.talentType && (
                        <Badge variant="outline">
                          {profile.talentType}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.bio && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {profile.bio}
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-3">
                      {profile.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </div>
                      )}
                      {profile.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="h-4 w-4" />
                          {profile.phoneNumber}
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Globe className="h-4 w-4" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Availability and Rates */}
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="text-gray-600 dark:text-gray-300">Status:</span>
                        <Badge variant={profile.availabilityStatus === 'available' ? 'default' : 'secondary'}>
                          {profile.availabilityStatus || 'unknown'}
                        </Badge>
                      </div>
                      {(profile.dailyRate || profile.weeklyRate || profile.projectRate) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <DollarSign className="h-4 w-4" />
                            <span>Rates:</span>
                          </div>
                          {profile.dailyRate && (
                            <div className="text-sm">Daily: ${profile.dailyRate}</div>
                          )}
                          {profile.weeklyRate && (
                            <div className="text-sm">Weekly: ${profile.weeklyRate}</div>
                          )}
                          {profile.projectRate && (
                            <div className="text-sm">Project: ${profile.projectRate}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    {!isOwnProfile && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Button className="w-full" variant="default">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Star className="h-4 w-4 mr-2" />
                            Add to Favorites
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skills Endorsements */}
              <div className="lg:col-span-2">
                <SkillEndorsements profile={profile} isOwnProfile={isOwnProfile} />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}