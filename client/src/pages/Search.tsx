import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SearchFilters, SearchFilters as ISearchFilters } from "@/components/search/SearchFilters";
import { TalentCard } from "@/components/talent/TalentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search as SearchIcon, 
  Filter, 
  MapPin, 
  Users, 
  Sparkles,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react";

export default function Search() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState<ISearchFilters>({
    query: "",
    talentType: "all",
    location: "all",
    availability: "all",
    budgetRange: "all",
    skills: [],
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: talents = [], isLoading: isSearching, error } = useQuery({
    queryKey: ["/api/search/talents", searchFilters],
    queryFn: async ({ queryKey }) => {
      const filters = queryKey[1] as ISearchFilters;
      const params = new URLSearchParams();
      
      if (filters.query) params.append("q", filters.query);
      if (filters.talentType && filters.talentType !== "all") params.append("talentType", filters.talentType);
      if (filters.location && filters.location !== "all") params.append("location", filters.location);
      
      const response = await fetch(`/api/search/talents?${params.toString()}`);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const handleSearch = (filters: ISearchFilters) => {
    setSearchFilters(filters);
  };

  const handleAIMatch = (query: string) => {
    toast({
      title: "AI Matching",
      description: "Finding the best matches for your requirements...",
    });
    // In a real implementation, this would trigger AI-powered matching
    setSearchFilters({ ...searchFilters, query });
  };

  const handleTalentMessage = (userId: string) => {
    setLocation(`/messages?user=${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    setLocation(`/profile/${userId}`);
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Discover Talent
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Find the perfect entertainment professionals for your projects
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Filters Sidebar */}
              <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="sticky top-4">
                  <SearchFilters 
                    onSearch={handleSearch} 
                    onAIMatch={handleAIMatch}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-4 space-y-4">
                {/* Search Header */}
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <SearchIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {talents.length} talents found
                          </span>
                        </div>
                        {searchFilters.query && (
                          <Badge variant="outline">
                            "{searchFilters.query}"
                          </Badge>
                        )}
                        {searchFilters.talentType && searchFilters.talentType !== "all" && (
                          <Badge variant="outline">
                            {searchFilters.talentType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="lg:hidden"
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
                          <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Content */}
                {isSearching ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-3 w-1/3" />
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-red-200/50 dark:border-red-700/50">
                    <CardContent className="p-8 text-center">
                      <div className="text-red-500 mb-4">
                        <SearchIcon className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Search Error
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {error.message || "An error occurred while searching for talents"}
                      </p>
                    </CardContent>
                  </Card>
                ) : talents.length === 0 ? (
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <SearchIcon className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No talents found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Try adjusting your search criteria or use different keywords
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSearchFilters({
                          query: "",
                          talentType: "all",
                          location: "all",
                          availability: "all",
                          budgetRange: "all",
                          skills: [],
                        })}
                      >
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                    {talents.map((talent: any) => (
                      <TalentCard
                        key={talent.id}
                        profile={talent}
                        onMessage={handleTalentMessage}
                        onViewProfile={handleViewProfile}
                      />
                    ))}
                  </div>
                )}

                {/* Load More */}
                {talents.length > 0 && (
                  <div className="text-center pt-6">
                    <Button variant="outline" size="lg">
                      Load More Talents
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
