import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { 
  Star, 
  User, 
  Music, 
  Theater, 
  Camera, 
  Mic, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Plus,
  X,
  Sparkles,
  Users,
  Video
} from "lucide-react";

const onboardingSchema = insertUserProfileSchema.extend({
  languages: z.array(z.string()).optional(),
  accents: z.array(z.string()).optional(),
  instruments: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [newSkill, setNewSkill] = useState("");
  const totalSteps = 4;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue with onboarding.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Redirect if user already has a profile
  useEffect(() => {
    if (user?.profile) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "talent",
      talentType: "actor",
      displayName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
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

  const createProfileMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Talents & Stars!",
        description: "Your profile has been created successfully.",
      });
      setLocation("/");
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

  const watchedRole = form.watch("role");
  const watchedTalentType = form.watch("talentType");

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "talent":
        return <Star className="h-8 w-8" />;
      case "manager":
        return <Users className="h-8 w-8" />;
      case "producer":
        return <Video className="h-8 w-8" />;
      default:
        return <User className="h-8 w-8" />;
    }
  };

  const getTalentIcon = (type: string) => {
    switch (type) {
      case "actor":
        return <Theater className="h-6 w-6" />;
      case "musician":
        return <Music className="h-6 w-6" />;
      case "model":
        return <Camera className="h-6 w-6" />;
      case "voice_artist":
        return <Mic className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: OnboardingFormData) => {
    createProfileMutation.mutate(data);
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

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
        
        {/* Progress Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </span>
                <Progress value={progressPercentage} className="w-32" />
              </div>
            </div>
          </div>
        </div>

        <main className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Talents & Stars
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Let's set up your profile to connect you with amazing opportunities
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Choose Your Role</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Select the role that best describes you
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          value: "talent",
                          title: "Talent",
                          description: "Actor, Musician, Model, Voice Artist",
                          icon: <Star className="h-12 w-12" />,
                          gradient: "from-blue-500 to-purple-600"
                        },
                        {
                          value: "manager",
                          title: "Manager",
                          description: "Represent and manage talent careers",
                          icon: <Users className="h-12 w-12" />,
                          gradient: "from-emerald-500 to-teal-600"
                        },
                        {
                          value: "producer",
                          title: "Producer",
                          description: "Cast talent for projects and productions",
                          icon: <Video className="h-12 w-12" />,
                          gradient: "from-amber-500 to-orange-600"
                        }
                      ].map((role) => (
                        <div
                          key={role.value}
                          className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            watchedRole === role.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          onClick={() => form.setValue("role", role.value as any)}
                        >
                          <div className={`w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center mb-4 mx-auto text-white`}>
                            {role.icon}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                            {role.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                            {role.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Talent Type Selection (if role is talent) */}
              {currentStep === 2 && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      {watchedRole === "talent" ? "What type of talent are you?" : "Basic Information"}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      {watchedRole === "talent" 
                        ? "This helps us customize your profile and find relevant opportunities"
                        : "Tell us about yourself"
                      }
                    </p>
                  </CardHeader>
                  <CardContent>
                    {watchedRole === "talent" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            value: "actor",
                            title: "Actor",
                            description: "Film, TV, Theater, Commercial",
                            icon: <Theater className="h-8 w-8" />
                          },
                          {
                            value: "musician",
                            title: "Musician",
                            description: "Singer, Songwriter, Instrumentalist",
                            icon: <Music className="h-8 w-8" />
                          },
                          {
                            value: "model",
                            title: "Model",
                            description: "Fashion, Editorial, Commercial",
                            icon: <Camera className="h-8 w-8" />
                          },
                          {
                            value: "voice_artist",
                            title: "Voice Artist",
                            description: "Voice Over, Narration, Animation",
                            icon: <Mic className="h-8 w-8" />
                          }
                        ].map((type) => (
                          <div
                            key={type.value}
                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              watchedTalentType === type.value
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                            onClick={() => form.setValue("talentType", type.value as any)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                {type.icon}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {type.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                              {...form.register("displayName")}
                              placeholder="Your professional name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              {...form.register("location")}
                              placeholder="City, State"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Professional Bio</Label>
                          <Textarea
                            {...form.register("bio")}
                            placeholder="Tell us about your experience and expertise"
                            rows={4}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Personal Information */}
              {currentStep === 3 && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Personal Information</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Complete your profile with personal details
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          {...form.register("displayName")}
                          placeholder="Your professional name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          {...form.register("location")}
                          placeholder="City, State"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        {...form.register("bio")}
                        placeholder="Tell us about your experience and what makes you unique"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          {...form.register("website")}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                        <Input
                          {...form.register("phoneNumber")}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Talent-specific fields */}
                    {watchedRole === "talent" && watchedTalentType === "actor" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Actor-Specific Information
                        </h3>
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

                    {watchedRole === "talent" && watchedTalentType === "musician" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Musical Information
                        </h3>
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
                      </div>
                    )}

                    {watchedRole === "talent" && watchedTalentType === "voice_artist" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Voice Artist Information
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="vocalRange">Vocal Range</Label>
                          <Input
                            {...form.register("vocalRange")}
                            placeholder="e.g., Baritone, Soprano, etc."
                          />
                        </div>
                      </div>
                    )}

                    {watchedRole === "talent" && watchedTalentType === "model" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Model Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="height">Height</Label>
                            <Input
                              {...form.register("height")}
                              placeholder="5'8&quot;"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="walkType">Walk Type</Label>
                            <Input
                              {...form.register("walkType")}
                              placeholder="e.g., Runway, Commercial"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Languages for all talent types */}
                    {watchedRole === "talent" && (
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
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Rates and Availability */}
              {currentStep === 4 && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Rates & Availability</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Set your rates and availability preferences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {watchedRole === "talent" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Your Rates (Optional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                            <Input
                              {...form.register("dailyRate")}
                              placeholder="500"
                              type="number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weeklyRate">Weekly Rate ($)</Label>
                            <Input
                              {...form.register("weeklyRate")}
                              placeholder="2500"
                              type="number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="projectRate">Project Rate ($)</Label>
                            <Input
                              {...form.register("projectRate")}
                              placeholder="10000"
                              type="number"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Availability
                      </h3>
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={form.watch("availabilityStatus") === "available"}
                          onCheckedChange={(checked) => 
                            form.setValue("availabilityStatus", checked ? "available" : "busy")
                          }
                        />
                        <Label className="text-base">
                          I am currently available for new opportunities
                        </Label>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          AI Profile Enhancement
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        After creating your profile, our AI will help optimize it for better visibility and more opportunities.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Auto-generate compelling bio content
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Optimize keywords for better search results
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Suggest relevant skills and experience
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index + 1 <= currentStep
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createProfileMutation.isPending}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <span>
                      {createProfileMutation.isPending ? "Creating Profile..." : "Complete Setup"}
                    </span>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
