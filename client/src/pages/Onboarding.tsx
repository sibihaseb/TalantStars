import React, { useState, useEffect } from "react";
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
  UNION_STATUS_OPTIONS,
  LANGUAGE_OPTIONS,
  ACCENT_OPTIONS,
  INSTRUMENT_OPTIONS,
  GENRE_OPTIONS,
  AFFILIATION_OPTIONS,
  STUNT_OPTIONS,
  ACTIVITY_OPTIONS,
  DANCING_STYLES,
  DRIVING_LICENSES,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_OPTIONS,
  VOCAL_RANGE_OPTIONS,
  WARDROBE_OPTIONS,
} from "@/lib/constants";
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
  Video,
  Trophy,
  Zap,
  PartyPopper,
  Medal,
  Crown,
  Rocket
} from "lucide-react";

const onboardingSchema = insertUserProfileSchema.extend({
  // Required fields
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  
  // Optional arrays
  languages: z.array(z.string()).optional(),
  accents: z.array(z.string()).optional(),
  instruments: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  affiliations: z.array(z.string()).optional(),
  stunts: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  experiences: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  wardrobe: z.array(z.string()).optional(),
  dancingStyles: z.array(z.string()).optional(),
  sportingActivities: z.array(z.string()).optional(),
  drivingLicenses: z.array(z.string()).optional(),
}).omit({ userId: true }); // Remove userId from client-side validation since it's added server-side

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Required fields by step
const requiredFieldsByStep = {
  1: ['role'], // Role selection
  2: ['talentType'], // Talent Type (for talent role)
  3: ['displayName', 'bio', 'location'], // Basic Info
  4: [], // Experience & Skills (optional)
  5: [], // Media & Portfolio (optional)
  6: [], // Preferences & Availability (optional)
};

// Helper function to check if field is required
const isFieldRequired = (fieldName: string, step: number): boolean => {
  return requiredFieldsByStep[step]?.includes(fieldName) || false;
};

// Helper component for required field label
const RequiredFieldLabel = ({ children, required = false }: { children: React.ReactNode; required?: boolean }) => (
  <div className="flex items-center gap-1">
    {children}
    {required && <span className="text-red-500 text-sm">*</span>}
  </div>
);

export default function Onboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [newSkill, setNewSkill] = useState("");
  const [isStepChanging, setIsStepChanging] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const totalSteps = 6;

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
      affiliations: [],
      stunts: [],
      activities: [],
      awards: [],
      experiences: [],
      skills: [],
      wardrobe: [],
      dancingStyles: [],
      sportingActivities: [],
      drivingLicenses: [],
      height: "",
      weight: "",
      eyeColor: [],
      hairColor: [],
      unionStatus: [],
      shoeSize: "",
      vocalRange: [],
      bodyStats: "",
      walkType: "",
      tattoos: "",
      piercings: "",
      scars: "",
      dailyRate: "",
      weeklyRate: "",
      projectRate: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      console.log("Submitting profile data:", data);
      try {
        const response = await apiRequest("POST", "/api/profile", data);
        console.log("API response status:", response.status);
        const result = await response.json();
        console.log("API response data:", result);
        return result;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Show final celebration
      setShowCelebration(true);
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({
          title: "🎉 Welcome to Talents & Stars!",
          description: "Your profile has been created successfully. Get ready to shine!",
        });
        setLocation("/");
      }, 1000);
    },
    onError: (error) => {
      console.error("Profile creation error:", error);
      
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
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage,
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

  const addSkill = (field: keyof OnboardingFormData) => {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues(field) as string[] || [];
    if (!currentSkills.includes(newSkill.trim())) {
      form.setValue(field, [...currentSkills, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const removeSkill = (field: keyof OnboardingFormData, skill: string) => {
    const currentSkills = form.getValues(field) as string[] || [];
    form.setValue(field, currentSkills.filter(s => s !== skill));
    form.trigger(field); // Trigger validation/re-render
  };

  const addFromDropdown = (field: keyof OnboardingFormData, value: string) => {
    const currentSkills = form.getValues(field) as string[] || [];
    if (!currentSkills.includes(value)) {
      const newValues = [...currentSkills, value];
      form.setValue(field, newValues);
      form.trigger(field); // Trigger validation/re-render
    }
  };

  const renderMultiSelectField = (
    field: keyof OnboardingFormData,
    label: string,
    options: Array<{ value: string; label: string }>,
    placeholder: string = "Select options..."
  ) => {
    const currentValues = form.watch(field) as string[] || [];
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
        <Select onValueChange={(value) => addFromDropdown(field, value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentValues.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {currentValues.map((value) => (
              <Badge key={value} variant="secondary" className="flex items-center gap-1">
                {options.find(opt => opt.value === value)?.label || value}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeSkill(field, value)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getMaxSteps = () => {
    return watchedRole === "talent" ? 6 : 4;
  };

  const getStepInfo = (step: number) => {
    const commonSteps = [
      { title: "Role Selection", description: "Choose your role", icon: User },
      { title: "Basic Information", description: "Personal details", icon: User },
      { title: "Location & Contact", description: "Where you work", icon: Star },
      { title: "Rates & Availability", description: "Your pricing", icon: Trophy },
    ];

    const talentSteps = [
      { title: "Role Selection", description: "Choose your role", icon: User },
      { title: "Basic Information", description: "Personal details", icon: User },
      { title: "Physical Details", description: "Appearance & stats", icon: Star },
      { title: "Skills & Experience", description: "What you can do", icon: Medal },
      { title: "Location & Contact", description: "Where you work", icon: Crown },
      { title: "Rates & Availability", description: "Your pricing", icon: Trophy },
    ];

    const steps = watchedRole === "talent" ? talentSteps : commonSteps;
    return steps[step - 1] || { title: "Step", description: "", icon: User };
  };

  const getProgressPercentage = () => {
    return Math.round((currentStep / getMaxSteps()) * 100);
  };

  // Function to validate required fields for current step
  const validateCurrentStep = async (): Promise<{ isValid: boolean; errors: string[] }> => {
    const requiredFields = requiredFieldsByStep[currentStep] || [];
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      const value = form.getValues(field as keyof OnboardingFormData);
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
      
      // Special validation for bio minimum length
      if (field === 'bio' && typeof value === 'string' && value.trim().length < 10) {
        errors.push('Bio must be at least 10 characters');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const nextStep = async () => {
    const maxSteps = getMaxSteps();
    if (currentStep < maxSteps) {
      // Validate current step before proceeding
      const validation = await validateCurrentStep();
      
      if (!validation.isValid) {
        toast({
          title: "Required Fields Missing",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }
      
      setIsStepChanging(true);
      setShowCelebration(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsStepChanging(false);
        setShowCelebration(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setIsStepChanging(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsStepChanging(false);
      }, 200);
    }
  };

  const onSubmit = (data: OnboardingFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    
    // Check if form is valid
    if (!form.formState.isValid) {
      console.log("Form validation failed, not submitting");
      return;
    }
    
    console.log("Calling mutation...");
    createProfileMutation.mutate(data);
  };

  const progressPercentage = (currentStep / getMaxSteps()) * 100;

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
        
        {/* Enhanced Progress Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  showCelebration 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  {showCelebration ? (
                    <PartyPopper className="h-6 w-6 text-white animate-bounce" />
                  ) : (
                    React.createElement(getStepInfo(currentStep).icon, { className: "h-6 w-6 text-white" })
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getStepInfo(currentStep).title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getStepInfo(currentStep).description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {getProgressPercentage()}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep} of {getMaxSteps()}
                </div>
              </div>
            </div>
            
            <div className="relative mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between">
              {Array.from({ length: getMaxSteps() }).map((_, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    index + 1 <= currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    index + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : index + 1 === currentStep
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                    {index + 1 < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-16 text-center">
                    {getStepInfo(index + 1).title.split(' ')[0]}
                  </span>
                </div>
              ))}
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
              {/* Content wrapper with smooth transitions */}
              <div className={`transition-all duration-300 ${
                isStepChanging ? 'opacity-50 transform translate-x-4' : 'opacity-100 transform translate-x-0'
              }`}>
              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      <RequiredFieldLabel required={isFieldRequired("role", currentStep)}>
                        Choose Your Role
                      </RequiredFieldLabel>
                    </CardTitle>
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
                      <RequiredFieldLabel required={watchedRole === "talent" && isFieldRequired("talentType", currentStep)}>
                        {watchedRole === "talent" ? "What type of talent are you?" : "Basic Information"}
                      </RequiredFieldLabel>
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
                            <RequiredFieldLabel required={isFieldRequired("displayName", currentStep)}>
                              <Label htmlFor="displayName">Display Name</Label>
                            </RequiredFieldLabel>
                            <Input
                              {...form.register("displayName")}
                              placeholder="Your professional name"
                              className={form.formState.errors.displayName ? "border-red-500" : ""}
                            />
                            {form.formState.errors.displayName && (
                              <p className="text-red-500 text-sm">{form.formState.errors.displayName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <RequiredFieldLabel required={isFieldRequired("location", currentStep)}>
                              <Label htmlFor="location">Location</Label>
                            </RequiredFieldLabel>
                            <Input
                              {...form.register("location")}
                              placeholder="City, State"
                              className={form.formState.errors.location ? "border-red-500" : ""}
                            />
                            {form.formState.errors.location && (
                              <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <RequiredFieldLabel required={isFieldRequired("bio", currentStep)}>
                            <Label htmlFor="bio">Professional Bio</Label>
                          </RequiredFieldLabel>
                          <Textarea
                            {...form.register("bio")}
                            placeholder="Tell us about your experience and expertise (minimum 10 characters)"
                            rows={4}
                            className={form.formState.errors.bio ? "border-red-500" : ""}
                          />
                          {form.formState.errors.bio && (
                            <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>
                          )}
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
                        <RequiredFieldLabel required={isFieldRequired("displayName", currentStep)}>
                          <Label htmlFor="displayName">Display Name</Label>
                        </RequiredFieldLabel>
                        <Input
                          {...form.register("displayName")}
                          placeholder="Your professional name"
                          className={form.formState.errors.displayName ? "border-red-500" : ""}
                        />
                        {form.formState.errors.displayName && (
                          <p className="text-red-500 text-sm">{form.formState.errors.displayName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <RequiredFieldLabel required={isFieldRequired("location", currentStep)}>
                          <Label htmlFor="location">Location</Label>
                        </RequiredFieldLabel>
                        <Input
                          {...form.register("location")}
                          placeholder="City, State"
                          className={form.formState.errors.location ? "border-red-500" : ""}
                        />
                        {form.formState.errors.location && (
                          <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <RequiredFieldLabel required={isFieldRequired("bio", currentStep)}>
                        <Label htmlFor="bio">Professional Bio</Label>
                      </RequiredFieldLabel>
                      <Textarea
                        {...form.register("bio")}
                        placeholder="Tell us about your experience and what makes you unique (minimum 10 characters)"
                        rows={4}
                        className={form.formState.errors.bio ? "border-red-500" : ""}
                      />
                      {form.formState.errors.bio && (
                        <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>
                      )}
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
                            <Select onValueChange={(value) => form.setValue("eyeColor", [value])}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select eye color" />
                              </SelectTrigger>
                              <SelectContent>
                                {EYE_COLOR_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hairColor">Hair Color</Label>
                            <Select onValueChange={(value) => form.setValue("hairColor", [value])}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select hair color" />
                              </SelectTrigger>
                              <SelectContent>
                                {HAIR_COLOR_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Musical abilities for actors */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">
                            Musical Abilities (Optional)
                          </h4>
                          {renderMultiSelectField("instruments", "Instruments", INSTRUMENT_OPTIONS, "Select instruments you can play...")}
                          {renderMultiSelectField("genres", "Singing Genres", GENRE_OPTIONS, "Select singing genres...")}
                          {renderMultiSelectField("vocalRange", "Vocal Range", VOCAL_RANGE_OPTIONS, "Select vocal range...")}
                        </div>
                      </div>
                    )}

                    {watchedRole === "talent" && watchedTalentType === "musician" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Musical Information
                        </h3>
                        <div className="space-y-4">
                          {renderMultiSelectField("instruments", "Instruments", INSTRUMENT_OPTIONS, "Select instruments...")}
                          {renderMultiSelectField("genres", "Genres", GENRE_OPTIONS, "Select genres...")}
                        </div>
                      </div>
                    )}

                    {watchedRole === "talent" && watchedTalentType === "voice_artist" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Voice Artist Information
                        </h3>
                        {renderMultiSelectField("vocalRange", "Vocal Range", VOCAL_RANGE_OPTIONS, "Select vocal range...")}
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
                      <div className="space-y-4">
                        {renderMultiSelectField("languages", "Languages", LANGUAGE_OPTIONS, "Select languages...")}
                        {renderMultiSelectField("accents", "Accents", ACCENT_OPTIONS, "Select accents...")}
                        
                        {renderMultiSelectField("unionStatus", "Union Status", UNION_STATUS_OPTIONS, "Select union status...")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Skills & Affiliations */}
              {currentStep === 4 && watchedRole === "talent" && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Skills & Affiliations</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add your professional skills and affiliations
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {renderMultiSelectField("affiliations", "Affiliations", AFFILIATION_OPTIONS, "Select affiliations...")}
                      {renderMultiSelectField("stunts", "Stunts", STUNT_OPTIONS, "Select stunts...")}
                      {renderMultiSelectField("activities", "Activities", ACTIVITY_OPTIONS, "Select activities...")}
                      {renderMultiSelectField("dancingStyles", "Dancing Styles", DANCING_STYLES, "Select dancing styles...")}
                      {renderMultiSelectField("drivingLicenses", "Driving Licenses", DRIVING_LICENSES, "Select driving licenses...")}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Additional Details */}
              {currentStep === 5 && watchedRole === "talent" && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Additional Details</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add wardrobe and physical attributes
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {renderMultiSelectField("wardrobe", "Wardrobe", WARDROBE_OPTIONS, "Select wardrobe...")}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tattoos">Tattoos</Label>
                          <Input
                            {...form.register("tattoos")}
                            placeholder="Description of tattoos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="piercings">Piercings</Label>
                          <Input
                            {...form.register("piercings")}
                            placeholder="Description of piercings"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scars">Scars</Label>
                          <Input
                            {...form.register("scars")}
                            placeholder="Description of scars"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 6 (or 4 for non-talent): Rates and Availability */}
              {((currentStep === 6 && watchedRole === "talent") || (currentStep === 4 && watchedRole !== "talent")) && (
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

                {/* Celebration Animation */}
                {showCelebration && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex space-x-2">
                      <Sparkles className="h-8 w-8 text-yellow-400 animate-bounce" />
                      <Medal className="h-8 w-8 text-orange-400 animate-pulse" />
                      <Trophy className="h-8 w-8 text-yellow-500 animate-bounce" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: getMaxSteps() }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index + 1 <= currentStep
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>

                {currentStep < getMaxSteps() ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={createProfileMutation.isPending}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={async (e) => {
                      e.preventDefault();
                      console.log("Submit button clicked");
                      
                      // Get form values
                      const formValues = form.getValues();
                      console.log("Form values:", formValues);
                      
                      // Simple validation for required fields
                      const displayName = formValues.displayName?.trim();
                      const bio = formValues.bio?.trim();
                      const location = formValues.location?.trim();
                      
                      if (!displayName) {
                        toast({
                          title: "Required Field Missing",
                          description: "Please enter your display name",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (!bio || bio.length < 10) {
                        toast({
                          title: "Required Field Missing",
                          description: "Please enter a bio with at least 10 characters",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (!location) {
                        toast({
                          title: "Required Field Missing",
                          description: "Please enter your location",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      console.log("Submitting profile...");
                      createProfileMutation.mutate(formValues);
                    }}
                  >
                    <span>
                      {createProfileMutation.isPending ? "Creating Profile..." : "Complete Setup"}
                    </span>
                    {createProfileMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Rocket className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
