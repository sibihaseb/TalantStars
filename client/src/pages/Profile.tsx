import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { MediaUpload } from "@/components/talent/MediaUpload";
import { AvailabilityCalendar } from "@/components/talent/AvailabilityCalendar";
import { AIProfileEnhancer } from "@/components/talent/AIProfileEnhancer";
import { SkillEndorsements } from "@/components/talent/SkillEndorsements";
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
import { EmotionalProgress } from "@/components/ui/emotional-progress";

const profileSchema = insertUserProfileSchema.extend({
  languages: z.array(z.string()).optional(),
  accents: z.array(z.string()).optional(),
  instruments: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  // Acting questionnaire fields
  primarySpecialty: z.array(z.string()).optional(),
  yearsExperience: z.string().optional(),
  actingMethod: z.array(z.string()).optional(),
  improvisationComfort: z.string().optional(),
  stageCombat: z.string().optional(),
  intimateScenesComfort: z.string().optional(),
  roleTypes: z.array(z.string()).optional(),
  motionCapture: z.string().optional(),
  animalWork: z.string().optional(),
  cryingOnCue: z.string().optional(),
  periodPieces: z.string().optional(),
  physicalComedy: z.string().optional(),
  accentExperience: z.string().optional(),
  greenScreen: z.string().optional(),
  stuntComfort: z.string().optional(),
  shakespeareExperience: z.string().optional(),
  musicalTheater: z.string().optional(),
  horrorThriller: z.array(z.string()).optional(),
  currentAgent: z.string().optional(),
  currentPublicist: z.string().optional(),
  representationStatus: z.string().optional(),
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
  console.log("Profile here ",profile)
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
      // Add ALL acting questionnaire field defaults
      primarySpecialty: [],
      yearsExperience: "",
      actingMethod: [],
      improvisationComfort: "",
      stageCombat: "",
      intimateScenesComfort: "",
      roleTypes: [],
      motionCapture: "",
      animalWork: "",
      cryingOnCue: "",
      periodPieces: "",
      physicalComedy: "",
      accentExperience: "",
      greenScreen: "",
      stuntComfort: "",
      shakespeareExperience: "",
      musicalTheater: "",
      horrorThriller: [],
      currentAgent: "",
      currentPublicist: "",
      representationStatus: "",
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      console.log('🔄 Pre-populating Profile.tsx form with complete profile data:', profile);
      form.reset({
        ...profile,
        // Ensure ALL acting questionnaire fields are pre-populated
        primarySpecialty: profile.primarySpecialty || [],
        yearsExperience: profile.yearsExperience || "",
        actingMethod: profile.actingMethod || [],
        improvisationComfort: profile.improvisationComfort || "",
        stageCombat: profile.stageCombat || "",
        intimateScenesComfort: profile.intimateScenesComfort || "",
        roleTypes: profile.roleTypes || [],
        motionCapture: profile.motionCapture || "",
        animalWork: profile.animalWork || "",
        cryingOnCue: profile.cryingOnCue || "",
        periodPieces: profile.periodPieces || "",
        physicalComedy: profile.physicalComedy || "",
        accentExperience: profile.accentExperience || "",
        greenScreen: profile.greenScreen || "",
        stuntComfort: profile.stuntComfort || "",
        shakespeareExperience: profile.shakespeareExperience || "",
        musicalTheater: profile.musicalTheater || "",
        horrorThriller: profile.horrorThriller || [],
        currentAgent: profile.currentAgent || "",
        currentPublicist: profile.currentPublicist || "",
        representationStatus: profile.representationStatus || "",
        languages: profile.languages || [],
        accents: profile.accents || [],
        instruments: profile.instruments || [],
        genres: profile.genres || [],
      });
      console.log('✅ Profile.tsx form reset complete with acting questionnaire fields');
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      console.log("🔥 PROFILE UPDATE: Starting mutation with data:", data);
      console.log("🔥 PROFILE UPDATE: Existing profile exists:", !!profile);
      
      // Clean the data before sending
      const cleanedData = {
        ...data,
        // Ensure arrays are not empty strings
        languages: Array.isArray(data.languages) ? data.languages : [],
        accents: Array.isArray(data.accents) ? data.accents : [],
        instruments: Array.isArray(data.instruments) ? data.instruments : [],
        genres: Array.isArray(data.genres) ? data.genres : [],
      };
      
      console.log("🔥 PROFILE UPDATE: Cleaned data:", cleanedData);
      
      const response = await apiRequest(
        profile ? "PUT" : "POST",
        "/api/profile",
        cleanedData
      );
      
      if (!response.ok) {
        const error = await response.text();
        console.error("🔥 PROFILE UPDATE ERROR:", error);
        throw new Error(`Profile update failed: ${response.status} - ${error}`);
      }
      
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
                  {user?.profileImageUrl ? (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">
                        {user?.firstName?.[0] || user?.displayName?.[0] || "T"}
                        {user?.lastName?.[0] || ""}
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {form.getValues("displayName") || user?.firstName || "Your Profile"}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    {form.getValues("talentType")?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Talent"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EmotionalProgress
                    currentStep={Math.floor(completeness / 10)}
                    totalSteps={10}
                    stepTitle="Profile"
                    completedSteps={[
                      ...(form.watch('displayName') ? ["Display Name"] : []),
                      ...(form.watch('bio') ? ["Bio"] : []),
                      ...(form.watch('location') ? ["Location"] : []),
                      ...(form.watch('talentType') ? ["Talent Type"] : []),
                      ...(form.watch('languages')?.length > 0 ? ["Languages"] : []),
                      ...(form.watch('dailyRate') ? ["Daily Rate"] : []),
                      ...(form.watch('weeklyRate') ? ["Weekly Rate"] : []),
                      ...(form.watch('projectRate') ? ["Project Rate"] : []),
                      ...(mediaFiles.length > 0 ? ["Media Portfolio"] : []),
                    ]}
                    showRewards={true}
                    onStepComplete={(step) => {
                      console.log(`Profile completion step ${step} completed!`);
                    }}
                  />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => setActiveTab("profile")}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        onClick={() => setActiveTab("media")}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Media
                      </Button>
                    </div>
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
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
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
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                                <Badge variant="secondary" className="capitalize">
                                  {form.watch("role") || "talent"}
                                </Badge>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Role is set during account setup
                                </span>
                              </div>
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
                              {...form.register("display_name")}
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
                              {...form.register("phone_number")}
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
                                  {...form.register("daily_rate")}
                                  placeholder="500"
                                  type="number"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="weeklyRate">Weekly Rate</Label>
                                <Input
                                  {...form.register("weekly_rate")}
                                  placeholder="2500"
                                  type="number"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="projectRate">Project Rate</Label>
                                <Input
                                  {...form.register("project_rate")}
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
                    <MediaUpload onUploadComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
                    }} />
                  </TabsContent>

                  <TabsContent value="availability" className="space-y-6">
                    <AvailabilityCalendar />
                  </TabsContent>

                  <TabsContent value="endorsements" className="space-y-6">
                    {profile && (
                      <SkillEndorsements profile={profile} isOwnProfile={true} />
                    )}
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
