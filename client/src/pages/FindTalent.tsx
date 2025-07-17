import { useState, useEffect } from "react";
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
  Mic,
  CheckCircle,
  Crown
} from "lucide-react";

export default function FindTalent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    talentType: "",
    location: "",
    availability: "",
    featured: false,
  });

  // Check for featured parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const featuredParam = urlParams.get('featured');
    if (featuredParam === 'true') {
      setSearchFilters(prev => ({ ...prev, featured: true }));
    }
  }, []);

  // Fetch real talent data from API - public access for discovery
  const { data: talents = [], isLoading: isTalentsLoading } = useQuery({
    queryKey: ['/api/search/talents', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.query) params.append('q', searchFilters.query);
      if (searchFilters.talentType) params.append('talentType', searchFilters.talentType);
      if (searchFilters.location) params.append('location', searchFilters.location);
      if (searchFilters.featured) params.append('featured', 'true');
      
      const response = await fetch(`/api/search/talents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch talents');
      return response.json();
    },
  });

  const handleViewTalent = (userId: string) => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }
    setLocation(`/talent/${userId}`);
  };

  // Show public talent discovery - no authentication required

  // Filter talents (featured functionality temporarily disabled)
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {searchFilters.featured ? 'Featured Talents' : 'Find Talent'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchFilters.featured ? 'Discover our curated featured professionals' : 'Discover amazing talent for your next project'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant={searchFilters.featured ? "default" : "outline"}
                  onClick={() => setSearchFilters(prev => ({ ...prev, featured: !prev.featured }))}
                  className={`${searchFilters.featured ? 
                    'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 
                    'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Featured
                </Button>
                <Button 
                  variant={!searchFilters.featured ? "default" : "outline"}
                  onClick={() => setSearchFilters(prev => ({ ...prev, featured: false }))}
                  className={`${!searchFilters.featured ? 
                    'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' : 
                    'border-blue-300 text-blue-600 hover:bg-blue-50'}`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  All Talents
                </Button>
              </div>
            </div>
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

                {/* Featured filter temporarily disabled */}
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
                          {talent.isVerified && (
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {getTalentIcon(talent.talentType)}
                          <span className="ml-1">{talent.talentType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${
                        talent.availabilityStatus === 'available' ? 'bg-green-500' :
                        talent.availabilityStatus === 'busy' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}></div>
                      <Badge className={getAvailabilityColor(talent.availabilityStatus || 'unavailable')}>
                        {talent.availabilityStatus === 'available' ? 'Available' :
                         talent.availabilityStatus === 'busy' ? 'Busy' :
                         'Unavailable'}
                      </Badge>
                    </div>
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