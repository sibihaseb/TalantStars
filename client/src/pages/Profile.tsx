import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { MediaUpload } from "@/components/talent/MediaUpload";
import { AvailabilityCalendar } from "@/components/talent/AvailabilityCalendar";
import { AIProfileEnhancer } from "@/components/talent/AIProfileEnhancer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { 
  User, 
  Camera, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Sparkles,
  Upload,
  Edit,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Save
} from "lucide-react";

const profileSchema = insertUserProfileSchema.extend({
  languages: z.array(z.string()).optional(),
  accents: z.array(z.string()).optional(),
  instruments: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [newSkill, setNewSkill] = useState("");
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(false);

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

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: mediaFiles = [] } = useQuery({
    queryKey: ["/api/media"],
    enabled: isAuthenticated,
    retry: false,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: "talent",
      talentType: "actor",
      displayName: "",
      bio: "",
      location: "",
      website: "",
      phoneNumber: "",
      availabilityStatus: "available",
      languages: [],
      accents: [],
      instruments: [],
      genres: [],
      height: "",
      weight: "",
      eyeColor: "",
      hairColor: "",
      unionStatus: "",
      shoeSize: "",
      vocalRange: "",
      bodyStats: "",
      walkType: "",
      dailyRate: "",
      weeklyRate: "",
      projectRate: "",
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        ...profile,
        languages: profile.languages || [],
        accents: profile.accents || [],
        instruments: profile.instruments || [],
        genres: profile.genres || [],
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest(
        profile ? "PUT" : "POST",
        "/api/profile",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enhanceProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/profile/enhance");
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("bio", data.bio);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile enhanced",
        description: "Your profile has been enhanced with AI suggestions.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateBioMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/profile/generate-bio");
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("bio", data.bio);
      toast({
        title: "Bio generated",
        description: "A new bio has been generated for you.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const addSkill = (field: "languages" | "accents" | "instruments" | "genres") => {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues(field) || [];
    if (!currentSkills.includes(newSkill.trim())) {
      form.setValue(field, [...currentSkills, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const removeSkill = (field: "languages" | "accents" | "instruments" | "genres", skill: string) => {
    const currentSkills = form.getValues(field) || [];
    form.setValue(field, currentSkills.filter(s => s !== skill));
  };

  const calculateProfileCompleteness = () => {
    const fields = [
      'displayName', 'bio', 'location', 'talentType',
      'languages', 'dailyRate', 'weeklyRate', 'projectRate'
    ];
    
    let completed = 0;
    fields.forEach(field => {
      const value = form.getValues(field as keyof ProfileFormData);
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim())) {
        completed++;
      }
    });
    
    return Math.round((completed / fields.length) * 100);
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

  const completeness = calculateProfileCompleteness();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your profile information and showcase your talents
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Profile Overview */}
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {form.getValues("displayName") || user?.firstName || "Your Profile"}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    {form.getValues("talentType")?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Talent"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Completeness
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {completeness}%
                      </span>
                    </div>
                    <Progress value={completeness} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Basic info completed
                      </span>
                    </div>
                    {mediaFiles.length > 0 ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Media portfolio added
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Add media samples
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => enhanceProfileMutation.mutate()}
                    disabled={enhanceProfileMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {enhanceProfileMutation.isPending ? "Enhancing..." : "AI Enhance"}
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="ai-enhance">AI Enhance</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-6">
                    <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Edit className="h-5 w-5" />
                          <span>Basic Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="role">Role</Label>
                              <Select
                                value={form.watch("role")}
                                onValueChange={(value) => form.setValue("role", value as any)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="talent">Talent</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="producer">Producer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="talentType">Talent Type</Label>
                              <Select
                                value={form.watch("talentType") || ""}
                                onValueChange={(value) => form.setValue("talentType", value as any)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="actor">Actor</SelectItem>
                                  <SelectItem value="musician">Musician</SelectItem>
                                  <SelectItem value="model">Model</SelectItem>
                                  <SelectItem value="voice_artist">Voice Artist</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                              {...form.register("displayName")}
                              placeholder="Your professional name"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="bio">Bio</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => generateBioMutation.mutate()}
                                disabled={generateBioMutation.isPending}
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                {generateBioMutation.isPending ? "Generating..." : "AI Generate"}
                              </Button>
                            </div>
                            <Textarea
                              {...form.register("bio")}
                              placeholder="Tell us about yourself and your experience"
                              rows={4}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                {...form.register("location")}
                                placeholder="City, State"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="website">Website</Label>
                              <Input
                                {...form.register("website")}
                                placeholder="https://yourwebsite.com"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              {...form.register("phoneNumber")}
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>

                          {/* Skills based on talent type */}
                          {form.watch("talentType") === "actor" && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="height">Height</Label>
                                  <Input
                                    {...form.register("height")}
                                    placeholder="5'8&quot;"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="weight">Weight</Label>
                                  <Input
                                    {...form.register("weight")}
                                    placeholder="150 lbs"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="eyeColor">Eye Color</Label>
                                  <Input
                                    {...form.register("eyeColor")}
                                    placeholder="Brown"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="hairColor">Hair Color</Label>
                                  <Input
                                    {...form.register("hairColor")}
                                    placeholder="Black"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {form.watch("talentType") === "musician" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Instruments</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add instrument"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => addSkill("instruments")}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {form.watch("instruments")?.map((instrument, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                      <span>{instrument}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeSkill("instruments", instrument)}
                                        className="ml-1 hover:text-red-500"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Genres</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add genre"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => addSkill("genres")}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {form.watch("genres")?.map((genre, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                      <span>{genre}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeSkill("genres", genre)}
                                        className="ml-1 hover:text-red-500"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Languages and Accents for all talent types */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Languages</Label>
                              <div className="flex space-x-2">
                                <Input
                                  value={newSkill}
                                  onChange={(e) => setNewSkill(e.target.value)}
                                  placeholder="Add language"
                                />
                                <Button
                                  type="button"
                                  onClick={() => addSkill("languages")}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {form.watch("languages")?.map((language, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                    <span>{language}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeSkill("languages", language)}
                                      className="ml-1 hover:text-red-500"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Rates */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Rates
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="dailyRate">Daily Rate</Label>
                                <Input
                                  {...form.register("dailyRate")}
                                  placeholder="500"
                                  type="number"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="weeklyRate">Weekly Rate</Label>
                                <Input
                                  {...form.register("weeklyRate")}
                                  placeholder="2500"
                                  type="number"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="projectRate">Project Rate</Label>
                                <Input
                                  {...form.register("projectRate")}
                                  placeholder="10000"
                                  type="number"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={form.watch("availabilityStatus") === "available"}
                              onCheckedChange={(checked) => 
                                form.setValue("availabilityStatus", checked ? "available" : "busy")
                              }
                            />
                            <Label>Available for work</Label>
                          </div>

                          <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6">
                    <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Camera className="h-5 w-5" />
                          <span>Media Portfolio</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MediaUpload onUploadComplete={() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/media"] });
                        }} />
                        
                        {mediaFiles.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              Your Media Files
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {mediaFiles.map((file: any) => (
                                <Card key={file.id} className="overflow-hidden">
                                  <CardContent className="p-4">
                                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                                      {file.mediaType === "image" ? (
                                        <img 
                                          src={file.url} 
                                          alt={file.originalName}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <div className="text-center">
                                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                          <p className="text-sm text-gray-500">
                                            {file.mediaType.toUpperCase()}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {file.originalName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="availability" className="space-y-6">
                    <AvailabilityCalendar />
                  </TabsContent>

                  <TabsContent value="ai-enhance" className="space-y-6">
                    <AIProfileEnhancer />
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                      <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base font-medium">Email Notifications</Label>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Receive notifications about new opportunities and messages
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base font-medium">Profile Visibility</Label>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Make your profile visible to producers and casting directors
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base font-medium">AI Recommendations</Label>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get AI-powered suggestions for profile improvements
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Account Actions
                          </h3>
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                              Export Profile Data
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
