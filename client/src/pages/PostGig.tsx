import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Star,
  Plus,
  X,
  Save,
  Send
} from "lucide-react";

export default function PostGig() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    talentType: "",
    location: "",
    budget: "",
    projectDate: "",
    requirements: "",
    projectType: "",
    genre: "",
    ageRange: "",
    gender: "",
    ethnicity: "",
    experienceLevel: "",
    shootingDays: "",
    applicationDeadline: "",
    specialSkills: "",
    wardrobe: "",
    isUnion: false,
    providesTransport: false,
    providesMeals: false,
    providesAccommodation: false,
    isRemote: false,
    allowCommunication: true,
    skills: [] as string[],
  });

  const [newSkill, setNewSkill] = useState("");

  // Show login prompt if not authenticated, but still show the form
  const showLoginPrompt = !isLoading && !isAuthenticated;

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      console.log("API REQUEST: Starting job creation with data:", jobData);
      try {
        const response = await apiRequest("POST", "/api/jobs", jobData);
        console.log("API RESPONSE: Status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API ERROR: Response not ok:", errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log("API SUCCESS: Job created:", result);
        return result;
      } catch (error) {
        console.error("API REQUEST FAILED:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("MUTATION SUCCESS:", data);
      toast({
        title: "Gig posted successfully!",
        description: "Your gig has been published and is now visible to talent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      console.error("MUTATION ERROR:", error);
      toast({
        title: "Error posting gig",
        description: error.message || "Failed to post gig. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("FORM SUBMIT: Started");
    console.log("FORM DATA:", formData);
    console.log("USER:", user);
    console.log("IS AUTHENTICATED:", isAuthenticated);
    console.log("IS LOADING:", isLoading);
    
    if (!isAuthenticated) {
      console.log("SUBMIT ERROR: Not authenticated");
      toast({
        title: "Authentication required",
        description: "Please log in to post a gig.",
        variant: "destructive",
      });
      window.location.href = "/auth";
      return;
    }
    
    if (!formData.title || !formData.description || !formData.talentType) {
      console.log("SUBMIT ERROR: Missing required fields");
      console.log("Title:", formData.title);
      console.log("Description:", formData.description);
      console.log("TalentType:", formData.talentType);
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      userId: user?.id,
      status: 'open',
      isPublic: true,
    };
    
    console.log("SUBMIT DATA:", submitData);
    console.log("CALLING MUTATION...");
    createJobMutation.mutate(submitData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8 pt-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Post a New Gig
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Create a comprehensive casting call with all the details talent need
              </p>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Comprehensive Gig Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title" className="text-gray-900 dark:text-white">
                        Job Title *
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g., Lead Actor for Independent Film"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="talentType" className="text-gray-900 dark:text-white">
                        Talent Type *
                      </Label>
                      <Select value={formData.talentType} onValueChange={(value) => setFormData(prev => ({ ...prev, talentType: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select talent type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actor">Actor</SelectItem>
                          <SelectItem value="musician">Musician</SelectItem>
                          <SelectItem value="voice_artist">Voice Artist</SelectItem>
                          <SelectItem value="model">Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="location" className="text-gray-900 dark:text-white">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location *
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="e.g., Los Angeles, CA"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget" className="text-gray-900 dark:text-white">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Budget *
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 5000"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-900 dark:text-white">
                      Project Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, story, and what you're looking for..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-gray-900 dark:text-white">
                      Requirements *
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="General casting requirements and qualifications needed..."
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      className="mt-1"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Entertainment Industry Specific Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectType" className="text-gray-900 dark:text-white">Project Type</Label>
                      <Select value={formData.projectType} onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feature-film">Feature Film</SelectItem>
                          <SelectItem value="short-film">Short Film</SelectItem>
                          <SelectItem value="tv-series">TV Series</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="music-video">Music Video</SelectItem>
                          <SelectItem value="theater">Theater</SelectItem>
                          <SelectItem value="voice-over">Voice Over</SelectItem>
                          <SelectItem value="modeling">Modeling</SelectItem>
                          <SelectItem value="reality-tv">Reality TV</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="web-series">Web Series</SelectItem>
                          <SelectItem value="corporate">Corporate Video</SelectItem>
                          <SelectItem value="student-film">Student Film</SelectItem>
                          <SelectItem value="music-performance">Music Performance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="genre" className="text-gray-900 dark:text-white">Genre</Label>
                      <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drama">Drama</SelectItem>
                          <SelectItem value="comedy">Comedy</SelectItem>
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="thriller">Thriller</SelectItem>
                          <SelectItem value="horror">Horror</SelectItem>
                          <SelectItem value="romance">Romance</SelectItem>
                          <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="musical">Musical</SelectItem>
                          <SelectItem value="animation">Animation</SelectItem>
                          <SelectItem value="reality">Reality TV</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ageRange" className="text-gray-900 dark:text-white">Age Range</Label>
                      <Input
                        name="ageRange"
                        value={formData.ageRange}
                        onChange={(e) => setFormData(prev => ({ ...prev, ageRange: e.target.value }))}
                        placeholder="e.g., 25-35"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-gray-900 dark:text-white">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-Binary</SelectItem>
                          <SelectItem value="any">Any</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ethnicity" className="text-gray-900 dark:text-white">Ethnicity</Label>
                      <Select value={formData.ethnicity} onValueChange={(value) => setFormData(prev => ({ ...prev, ethnicity: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caucasian">Caucasian</SelectItem>
                          <SelectItem value="african-american">African American</SelectItem>
                          <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                          <SelectItem value="asian">Asian</SelectItem>
                          <SelectItem value="native-american">Native American</SelectItem>
                          <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                          <SelectItem value="mixed">Mixed Race</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="any">Any</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="experienceLevel" className="text-gray-900 dark:text-white">Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="expert">Expert/Celebrity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shootingDays" className="text-gray-900 dark:text-white">Shooting Days</Label>
                      <Input
                        type="number"
                        name="shootingDays"
                        value={formData.shootingDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, shootingDays: e.target.value }))}
                        placeholder="Number of days"
                      />
                    </div>
                    <div>
                      <Label htmlFor="applicationDeadline" className="text-gray-900 dark:text-white">Application Deadline</Label>
                      <Input
                        type="date"
                        name="applicationDeadline"
                        value={formData.applicationDeadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="projectDate" className="text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Project Date
                    </Label>
                    <Input
                      id="projectDate"
                      type="date"
                      value={formData.projectDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="specialSkills" className="text-gray-900 dark:text-white">Special Skills/Requirements</Label>
                    <Textarea
                      name="specialSkills"
                      value={formData.specialSkills}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialSkills: e.target.value }))}
                      placeholder="e.g., Martial arts, singing, dancing, accents, specific looks, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="wardrobe" className="text-gray-900 dark:text-white">Wardrobe/Costume Notes</Label>
                    <Textarea
                      name="wardrobe"
                      value={formData.wardrobe}
                      onChange={(e) => setFormData(prev => ({ ...prev, wardrobe: e.target.value }))}
                      placeholder="What should talent bring or expect for wardrobe?"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isUnion"
                        checked={formData.isUnion}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUnion: checked as boolean }))}
                      />
                      <Label htmlFor="isUnion" className="text-gray-900 dark:text-white">Union Project (SAG-AFTRA)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="providesTransport"
                        checked={formData.providesTransport}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, providesTransport: checked as boolean }))}
                      />
                      <Label htmlFor="providesTransport" className="text-gray-900 dark:text-white">Transportation Provided</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="providesMeals"
                        checked={formData.providesMeals}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, providesMeals: checked as boolean }))}
                      />
                      <Label htmlFor="providesMeals" className="text-gray-900 dark:text-white">Meals Provided</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="providesAccommodation"
                        checked={formData.providesAccommodation}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, providesAccommodation: checked as boolean }))}
                      />
                      <Label htmlFor="providesAccommodation" className="text-gray-900 dark:text-white">Accommodation Provided</Label>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <Label className="text-gray-900 dark:text-white">
                      <Star className="w-4 h-4 inline mr-1" />
                      Required Skills
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRemote"
                        checked={formData.isRemote}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRemote: checked as boolean }))}
                      />
                      <Label htmlFor="isRemote" className="text-gray-900 dark:text-white">
                        Remote work available
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowCommunication"
                        checked={formData.allowCommunication}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowCommunication: checked as boolean }))}
                      />
                      <Label htmlFor="allowCommunication" className="text-gray-900 dark:text-white">
                        Allow direct communication
                      </Label>
                    </div>
                  </div>

                  {showLoginPrompt && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Login Required
                          </h3>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            You can fill out the form, but you'll need to log in to submit.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => window.location.href = "/auth"}
                          variant="outline"
                          size="sm"
                        >
                          Log In
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 gradient-bg-primary text-white"
                      disabled={createJobMutation.isPending}
                    >
                      {createJobMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {showLoginPrompt ? "Log In to Post Gig" : "Post Gig"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}