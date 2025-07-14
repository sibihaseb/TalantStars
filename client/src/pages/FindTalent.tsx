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
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    talentType: "",
    location: "",
    availability: "",
  });

  // Fetch real talent data from API
  const { data: talents = [], isLoading: isTalentsLoading } = useQuery({
    queryKey: ['/api/search/talents', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.query) params.append('q', searchFilters.query);
      if (searchFilters.talentType) params.append('talentType', searchFilters.talentType);
      if (searchFilters.location) params.append('location', searchFilters.location);
      
      const response = await fetch(`/api/search/talents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch talents');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const handleViewTalent = (userId: string) => {
    setLocation(`/talent/${userId}`);
  };

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

  const filteredTalents = talents.filter((talent: any) => {
    const matchesQuery = !searchFilters.query || 
      talent.displayName?.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      (talent.skills && talent.skills.some((skill: string) => skill.toLowerCase().includes(searchFilters.query.toLowerCase())));
    
    const matchesType = !searchFilters.talentType || talent.talentType?.toLowerCase() === searchFilters.talentType.toLowerCase();
    const matchesLocation = !searchFilters.location || talent.location?.toLowerCase().includes(searchFilters.location.toLowerCase());
    const matchesAvailability = !searchFilters.availability || talent.availability?.toLowerCase() === searchFilters.availability.toLowerCase();
    
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
            {isTalentsLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div>
                          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredTalents.map((talent) => (
              <Card key={talent.id} className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={talent.profileImageUrl} alt={talent.displayName} />
                        <AvatarFallback>{talent.displayName?.split(' ').map((n: string) => n[0]).join('') || 'T'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{talent.displayName}</h3>
                          {talent.verified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {getTalentIcon(talent.talentType)}
                          <span className="ml-1">{talent.talentType}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getAvailabilityColor(talent.availability || 'unavailable')}>
                      {talent.availability || 'Unavailable'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {talent.location || 'Location not specified'}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {talent.bio || 'No bio available'}
                    </p>
                    
                    {talent.skills && talent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {talent.skills.slice(0, 3).map((skill: string) => (
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
                    )}
                    
                    {(talent.dailyRate || talent.weeklyRate || talent.projectRate) && (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {talent.dailyRate && `$${talent.dailyRate}/day`}
                        {talent.weeklyRate && `$${talent.weeklyRate}/week`}
                        {talent.projectRate && `$${talent.projectRate}/project`}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewTalent(talent.userId)}
                      >
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