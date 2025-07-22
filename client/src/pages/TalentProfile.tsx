import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Star, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2,
  Calendar,
  DollarSign,
  Eye,
  Theater,
  Music,
  Camera,
  Mic,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";

export default function TalentProfile() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Query to fetch talent profile
  const { data: talent, isLoading: isTalentLoading, error } = useQuery({
    queryKey: [`/api/talent/${id}`],
    enabled: !!id && isAuthenticated,
  });

  // Query to fetch current availability status from calendar
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: [`/api/availability/user/${talent?.userId || id}`],
    enabled: !!talent?.userId || !!id,
    queryFn: async () => {
      const response = await fetch(`/api/availability/user/${talent?.userId || id}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Function to determine current availability status from calendar entries
  const getCurrentAvailabilityStatus = () => {
    if (!availabilityEntries?.length) return talent?.availability || 'available';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a current busy/unavailable entry for today
    const currentEntry = availabilityEntries.find((entry: any) => {
      const startDate = new Date(entry.startDate).toISOString().split('T')[0];
      const endDate = new Date(entry.endDate).toISOString().split('T')[0];
      return startDate <= todayStr && endDate >= todayStr;
    });
    
    if (currentEntry) {
      return currentEntry.status;
    }
    
    return talent?.availability || 'available';
  };

  const currentAvailability = getCurrentAvailabilityStatus();

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-gray-900 dark:text-white">
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please log in to view talent profiles
              </p>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full"
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );
  }

  if (isTalentLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
          <Header />
          <div className="container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (error || !talent) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-gray-900 dark:text-white">
                  Talent Not Found
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The talent profile you're looking for could not be found.
                </p>
                <Button 
                  onClick={() => setLocation("/find-talent")}
                  className="w-full"
                >
                  Back to Find Talent
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const getTalentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'actor':
        return <Theater className="w-4 h-4" />;
      case 'musician':
        return <Music className="w-4 h-4" />;
      case 'model':
        return <Camera className="w-4 h-4" />;
      case 'voice artist':
        return <Mic className="w-4 h-4" />;
      default:
        return <Theater className="w-4 h-4" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/find-talent")}
            className="mb-6 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Find Talent
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardHeader className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={talent.profileImageUrl} alt={talent.displayName} className="object-cover" />
                    <AvatarFallback className="text-lg">
                      {talent.displayName?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {talent.displayName}
                    </h1>
                    {talent.verified && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                    {getTalentIcon(talent.talentType)}
                    <span>{talent.talentType}</span>
                  </div>
                  <Badge className={getAvailabilityColor(currentAvailability)}>
                    {currentAvailability}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {talent.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Eye className="w-4 h-4 mr-2" />
                    {talent.profileViews || 0} profile views
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Rates</h3>
                    {talent.dailyRate && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">Daily: ${talent.dailyRate}</span>
                      </div>
                    )}
                    {talent.weeklyRate && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">Weekly: ${talent.weeklyRate}</span>
                      </div>
                    )}
                    {talent.projectRate && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="text-gray-600 dark:text-gray-300">Project: ${talent.projectRate}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    {talent.website && (
                      <Button variant="outline" className="w-full" size="lg">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio Section */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {talent.bio || 'No bio available.'}
                  </p>
                </CardContent>
              </Card>

              {/* Skills Section */}
              {talent.skills && talent.skills.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Details */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {talent.height && (
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Height:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{talent.height}</span>
                      </div>
                    )}
                    {talent.weight && (
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Weight:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{talent.weight}</span>
                      </div>
                    )}
                    {talent.eyeColor && (
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Eye Color:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{talent.eyeColor}</span>
                      </div>
                    )}
                    {talent.hairColor && (
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Hair Color:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">{talent.hairColor}</span>
                      </div>
                    )}
                    {talent.languages && talent.languages.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Languages:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                          {talent.languages.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}