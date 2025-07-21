import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkillEndorsements } from "@/components/talent/SkillEndorsements";
import { 
  TemplateSelector, 
  ClassicTemplate, 
  ModernTemplate, 
  ArtisticTemplate, 
  MinimalTemplate, 
  CinematicTemplate,
  type ProfileTemplate 
} from "@/components/profile/ProfileTemplates";

export default function ProfileViewer() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  
  // Get template from URL params or default to modern
  const urlParams = new URLSearchParams(window.location.search);
  const templateFromUrl = urlParams.get('template') as ProfileTemplate || 'modern';
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate>(templateFromUrl);
  
  console.log("ProfileViewer - userId from params:", userId);
  
  // Fetch profile data for the specific user
  const { data: profile, isLoading, error } = useQuery<any>({
    queryKey: [`/api/user/profile/${userId}`],
    enabled: !!userId,
  });

  // Fetch user data for the specific user
  const { data: userData } = useQuery<any>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Fetch media files for the user
  const { data: mediaFiles = [] } = useQuery<any[]>({
    queryKey: [`/api/media/${userId}`],
    enabled: !!userId,
  });
  
  console.log("ProfileViewer - profile data:", profile);
  console.log("ProfileViewer - media files:", mediaFiles);
  console.log("ProfileViewer - isLoading:", isLoading);
  console.log("ProfileViewer - error:", error);

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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

  // Determine ownership - check both user data sources
  const profileUser = userData || profile;
  const isOwnProfile = user?.id === profileUser?.id || user?.id === profileUser?.userId;

  // Create sample media data for demonstration
  const sampleMedia = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1594736797933-d0e501ba2fe1?w=800&h=600&fit=crop",
      mediaType: "image",
      category: "headshot",
      title: "Professional Headshot",
      description: "Professional headshot for casting calls"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      mediaType: "image", 
      category: "portfolio",
      title: "Character Study",
      description: "Character work from latest production"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
      mediaType: "image",
      category: "portfolio", 
      title: "Stage Performance",
      description: "Live performance at Lincoln Center"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
      mediaType: "video",
      category: "demo",
      title: "Acting Demo Reel",
      description: "2024 professional demo reel showcasing range"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1533584595016-84b0be18b738?w=800&h=600&fit=crop",
      mediaType: "image",
      category: "portfolio",
      title: "Theater Production",
      description: "Live theater performance"
    }
  ];

  const displayMedia = Array.isArray(mediaFiles) && mediaFiles.length > 0 ? mediaFiles : sampleMedia;

  // Render the appropriate template
  const renderTemplate = () => {
    // Combine profile and user data properly
    const combinedUserData = {
      ...(userData || user || {}),
      ...(profile || {}),
      id: userData?.id || profile?.userId || userId,
      userId: userData?.id || profile?.userId || userId
    };

    const templateProps: any = {
      profile: combinedUserData,
      mediaFiles: displayMedia,
      userId,
      user: combinedUserData
    };

    switch (selectedTemplate) {
      case 'classic':
        return <ClassicTemplate {...templateProps} />;
      case 'modern':
        return <ModernTemplate {...templateProps} />;
      case 'artistic':
        return <ArtisticTemplate {...templateProps} />;
      case 'minimal':
        return <MinimalTemplate {...templateProps} />;
      case 'cinematic':
        return <CinematicTemplate {...templateProps} />;
      default:
        return <ModernTemplate {...templateProps} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Render Selected Template */}
          {renderTemplate()}

          {/* Skill Endorsements */}
          {profile?.userId && (
            <div className="mt-12">
              <SkillEndorsements 
                profile={profile} 
                isOwnProfile={isOwnProfile} 
              />
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}