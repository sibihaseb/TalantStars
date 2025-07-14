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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  MapPin, 
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  Filter,
  Theater,
  Music,
  Camera,
  Mic,
  ExternalLink
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  description: string;
  talentType: string;
  location: string;
  budget: number;
  projectDate: string;
  requirements: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BrowseJobs() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    talentType: "all",
    location: "",
    status: "open",
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");

  // Job application mutation
  const applyToJobMutation = useMutation({
    mutationFn: async (jobData: { jobId: number; message: string }) => {
      const response = await apiRequest("POST", `/api/jobs/${jobData.jobId}/apply`, { message: jobData.message });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted!",
      });
      setSelectedJob(null);
      setApplicationMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setApplicationMessage("");
  };

  const handleSubmitApplication = () => {
    if (selectedJob) {
      applyToJobMutation.mutate({
        jobId: selectedJob.id,
        message: applicationMessage,
      });
    }
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
                Please log in to browse jobs
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

  // Fetch jobs with filters
  const { data: jobs = [], isLoading: isLoadingJobs, error } = useQuery({
    queryKey: ["/api/jobs", searchFilters],
    queryFn: async ({ queryKey }) => {
      const filters = queryKey[1] as typeof searchFilters;
      const params = new URLSearchParams();
      
      if (filters.talentType && filters.talentType !== "all") params.append("talentType", filters.talentType);
      if (filters.location) params.append("location", filters.location);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const getTalentIcon = (talentType: string) => {
    switch (talentType) {
      case "actor":
        return <Theater className="h-4 w-4" />;
      case "musician":
        return <Music className="h-4 w-4" />;
      case "voice_artist":
        return <Mic className="h-4 w-4" />;
      case "model":
        return <Camera className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job: Job) => {
    if (!searchFilters.query) return true;
    const query = searchFilters.query.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Browse Jobs
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover exciting opportunities in the entertainment industry
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Search & Filter Jobs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search Jobs
                  </Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search titles, descriptions..."
                      value={searchFilters.query}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="talentType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Talent Type
                  </Label>
                  <Select 
                    value={searchFilters.talentType} 
                    onValueChange={(value) => setSearchFilters(prev => ({ ...prev, talentType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="actor">Actor</SelectItem>
                      <SelectItem value="musician">Musician</SelectItem>
                      <SelectItem value="voice_artist">Voice Artist</SelectItem>
                      <SelectItem value="model">Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, State"
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <Select 
                    value={searchFilters.status} 
                    onValueChange={(value) => setSearchFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Results */}
          <div className="space-y-6">
            {isLoadingJobs ? (
              // Loading skeleton
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              // Error state
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-red-200/50 dark:border-red-700/50">
                <CardContent className="p-8 text-center">
                  <div className="text-red-500 mb-4">
                    <Briefcase className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Error Loading Jobs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {error.message || "An error occurred while loading job listings"}
                  </p>
                </CardContent>
              </Card>
            ) : filteredJobs.length === 0 ? (
              // No results
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Briefcase className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search criteria or check back later for new opportunities
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchFilters({
                      query: "",
                      talentType: "all",
                      location: "",
                      status: "open",
                    })}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Job listings
              <div className="space-y-4">
                {filteredJobs.map((job: Job) => (
                  <Card key={job.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              {getTalentIcon(job.talentType)}
                              <Badge variant="outline" className="capitalize">
                                {job.talentType.replace('_', ' ')}
                              </Badge>
                            </div>
                            <Badge 
                              variant={job.status === 'open' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {job.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {job.title}
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                            {job.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            {job.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            {job.budget && (
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatCurrency(job.budget)}</span>
                              </div>
                            )}
                            {job.projectDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(job.projectDate)}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Posted {formatDate(job.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={job.status !== 'open'}
                            onClick={() => handleApplyToJob(job)}
                          >
                            Apply Now
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="flex items-center space-x-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>View Details</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">
                                  {job.title}
                                </DialogTitle>
                                <DialogDescription>
                                  Job Details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex items-center space-x-2 mb-4">
                                {getTalentIcon(job.talentType)}
                                <Badge variant="outline" className="capitalize">
                                  {job.talentType.replace('_', ' ')}
                                </Badge>
                                <Badge 
                                  variant={job.status === 'open' ? 'default' : 'secondary'}
                                  className="capitalize"
                                >
                                  {job.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-gray-600 dark:text-gray-400">{job.description}</p>
                                </div>
                                
                                {job.requirements && (
                                  <div>
                                    <h4 className="font-medium mb-2">Requirements</h4>
                                    <p className="text-gray-600 dark:text-gray-400">{job.requirements}</p>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                  {job.location && (
                                    <div>
                                      <h4 className="font-medium mb-1">Location</h4>
                                      <p className="text-gray-600 dark:text-gray-400">{job.location}</p>
                                    </div>
                                  )}
                                  {job.budget && (
                                    <div>
                                      <h4 className="font-medium mb-1">Budget</h4>
                                      <p className="text-gray-600 dark:text-gray-400">{formatCurrency(job.budget)}</p>
                                    </div>
                                  )}
                                  {job.projectDate && (
                                    <div>
                                      <h4 className="font-medium mb-1">Project Date</h4>
                                      <p className="text-gray-600 dark:text-gray-400">{formatDate(job.projectDate)}</p>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-medium mb-1">Posted</h4>
                                    <p className="text-gray-600 dark:text-gray-400">{formatDate(job.createdAt)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button 
                                    onClick={() => handleApplyToJob(job)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={job.status !== 'open'}
                                  >
                                    Apply Now
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Application Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Position</DialogTitle>
            <DialogDescription>
              {selectedJob && `Submit your application for "${selectedJob.title}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="application-message">Cover Message</Label>
              <Textarea
                id="application-message"
                placeholder="Tell the employer why you're perfect for this role..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedJob(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitApplication}
                disabled={applyToJobMutation.isPending || !applicationMessage.trim()}
              >
                {applyToJobMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}