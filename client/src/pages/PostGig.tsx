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
    deadline: "",
    requirements: "",
    isRemote: false,
    skills: [] as string[],
  });

  const [newSkill, setNewSkill] = useState("");

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
                Please log in to post a gig
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

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest("POST", "/api/jobs", jobData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Gig posted successfully!",
        description: "Your gig has been published and is now visible to talent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error posting gig",
        description: error.message || "Failed to post gig. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.talentType) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate({
      ...formData,
      postedBy: user?.id,
    });
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
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Post a New Gig
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Find the perfect talent for your project
              </p>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Gig Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Select 
                        value={formData.talentType} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, talentType: value }))}
                      >
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

                  <div>
                    <Label htmlFor="description" className="text-gray-900 dark:text-white">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the project, role requirements, and what you're looking for..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="location" className="text-gray-900 dark:text-white">
                        Location
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        placeholder="e.g., Los Angeles, CA"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget" className="text-gray-900 dark:text-white">
                        Budget
                      </Label>
                      <Input
                        id="budget"
                        type="text"
                        placeholder="e.g., $1,000 - $5,000"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deadline" className="text-gray-900 dark:text-white">
                      Application Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-gray-900 dark:text-white">
                      Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="List specific requirements, experience level, etc..."
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-white">Skills Required</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

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
                      Post Gig
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/dashboard")}
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