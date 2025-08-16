import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkillsDisplay } from "@/components/profile/SkillsDisplay";
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
 
  
  // Fetch profile data using the talent endpoint which handles both userIds and IDs
  const { data: profile, isLoading, error } = useQuery<any>({
    queryKey: [`/api/talent/${userId}`],
    enabled: !!userId,
  });

  // Fetch user account data to get profileImageUrl and other user account fields
  const { data: userData } = useQuery<any>({
    queryKey: [`/api/user/profile/${userId}`],
    enabled: !!userId,
  });

  // Fetch media files for the user using the talent endpoint
  const { data: mediaFiles = [] } = useQuery<any[]>({
    queryKey: [`/api/media/user/${userId}`],
    enabled: !!userId,
  });

  // Fetch sharing settings for the user
  const { data: sharingSettings = {} } = useQuery<any>({
    queryKey: [`/api/user/sharing-settings/${userId}`],
    enabled: !!userId,
  });

   const { mutate: trackView } = useMutation({
    mutationFn: async () => {
      if (!isOwnProfile) {
        await fetch(`/api/profile/view/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    },
    onSuccess: () => {
     console.log("Profile view tracked successfully");
    },
    onError: (error) => {
      console.error("Error tracking profile view:", error);
    },
  });

  useEffect(() => {
  if (userId) {
    trackView();
  }
}, [userId, trackView]);
  

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

  // Use only actual media files from the user - no hardcoded data
  const displayMedia = Array.isArray(mediaFiles) ? mediaFiles : [];

  // Render the appropriate template
  const renderTemplate = () => {
    // Combine profile and user data properly
    const combinedUserData = {
      ...(profile || {}), // Talent profile data (displayName, bio, etc.)
      ...(userData || user || {}), // User account data (profileImageUrl, email, etc.)
      id: userData?.id || profile?.userId || userId,
      userId: userData?.id || profile?.userId || userId
    };
    console.log("Combined User Data:", combinedUserData);
    const templateProps: any = {
      profile: combinedUserData,
      mediaFiles: displayMedia,
      userId: combinedUserData.id, // Pass the actual numeric user ID
      user: combinedUserData,
      sharingSettings
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

          {/* Simple Skills Display - No Endorsements */}
          <SkillsDisplay profile={profile} />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}