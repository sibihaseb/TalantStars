import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  MessageSquare,
  ExternalLink,
  Filter,
  Theater,
  Music,
  Camera,
  Mic
} from "lucide-react";

export default function FindTalent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    talentType: "",
    location: "",
    availability: "",
  });

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
                Please log in to find talent
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

  // Mock talent data for demonstration
  const mockTalents = [
    {
      id: 1,
      name: "Sarah Chen",
      type: "Actor",
      location: "Los Angeles, CA",
      rating: 4.9,
      reviews: 127,
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b86e390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
      verified: true,
      bio: "Professional Broadway and film actor with 10+ years experience",
      skills: ["Acting", "Dancing", "Singing", "Stage Combat"],
      availability: "Available",
      hourlyRate: "$150-250/hour"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      type: "Musician",
      location: "Nashville, TN",
      rating: 4.8,
      reviews: 89,
      profileImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
      verified: true,
      bio: "Singer-songwriter specializing in country and folk music",
      skills: ["Guitar", "Vocals", "Songwriting", "Piano"],
      availability: "Available",
      hourlyRate: "$100-200/hour"
    },
    {
      id: 3,
      name: "Elena Volkov",
      type: "Model",
      location: "New York, NY",
      rating: 5.0,
      reviews: 156,
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
      verified: true,
      bio: "Professional fashion and editorial model",
      skills: ["Fashion Modeling", "Editorial", "Commercial", "Runway"],
      availability: "Busy",
      hourlyRate: "$200-400/hour"
    },
    {
      id: 4,
      name: "David Kim",
      type: "Voice Artist",
      location: "Chicago, IL",
      rating: 4.9,
      reviews: 203,
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
      verified: true,
      bio: "Professional voice actor for commercials and animations",
      skills: ["Voice Acting", "Narration", "Character Voices", "Commercial VO"],
      availability: "Available",
      hourlyRate: "$80-150/hour"
    }
  ];

  const filteredTalents = mockTalents.filter(talent => {
    const matchesQuery = !searchFilters.query || 
      talent.name.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchFilters.query.toLowerCase()));
    
    const matchesType = !searchFilters.talentType || talent.type.toLowerCase() === searchFilters.talentType;
    const matchesLocation = !searchFilters.location || talent.location.toLowerCase().includes(searchFilters.location.toLowerCase());
    const matchesAvailability = !searchFilters.availability || talent.availability.toLowerCase() === searchFilters.availability.toLowerCase();
    
    return matchesQuery && matchesType && matchesLocation && matchesAvailability;
  });

  const getTalentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'actor': return <Theater className="w-4 h-4" />;
      case 'musician': return <Music className="w-4 h-4" />;
      case 'model': return <Camera className="w-4 h-4" />;
      case 'voice artist': return <Mic className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'busy': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Find Talent
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Discover amazing talent for your next project
            </p>
          </div>

          {/* Search Filters */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-gray-900 dark:text-white">Search</Label>
                  <Input
                    id="search"
                    placeholder="Name, skills, or keywords..."
                    value={searchFilters.query}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="talentType" className="text-gray-900 dark:text-white">Talent Type</Label>
                  <Select 
                    value={searchFilters.talentType} 
                    onValueChange={(value) => setSearchFilters(prev => ({ ...prev, talentType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="actor">Actor</SelectItem>
                      <SelectItem value="musician">Musician</SelectItem>
                      <SelectItem value="voice artist">Voice Artist</SelectItem>
                      <SelectItem value="model">Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-900 dark:text-white">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="availability" className="text-gray-900 dark:text-white">Availability</Label>
                  <Select 
                    value={searchFilters.availability} 
                    onValueChange={(value) => setSearchFilters(prev => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((talent) => (
              <Card key={talent.id} className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={talent.profileImageUrl} alt={talent.name} />
                        <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{talent.name}</h3>
                          {talent.verified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {getTalentIcon(talent.type)}
                          <span className="ml-1">{talent.type}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getAvailabilityColor(talent.availability)}>
                      {talent.availability}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {talent.location}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {talent.rating} ({talent.reviews} reviews)
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {talent.bio}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {talent.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {talent.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{talent.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {talent.hourlyRate}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTalents.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No talent found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search filters to find more results
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}