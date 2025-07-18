import React, { useState, useEffect, useMemo } from "react";
// Force cache refresh - v2.0.1
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm, Controller } from "react-hook-form";
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
  Rocket,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  Zap as ZapIcon
} from "lucide-react";
import { EmotionalProgress } from "@/components/ui/emotional-progress";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { PricingSelection } from "@/components/PricingSelection";

const onboardingSchema = insertUserProfileSchema.extend({
  // Required fields with enhanced validation
  displayName: z.string()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Display name can only contain letters, spaces, hyphens, and apostrophes"),
  
  bio: z.string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters"),
  
  location: z.string()
    .min(1, "Location is required")
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
  
  // Profile image URL - required for onboarding
  profileImageUrl: z.string().min(1, "Profile image is required"),
  
  // Optional fields with validation
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phoneNumber: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format").optional().or(z.literal("")),
  
  // Rate validation
  dailyRate: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number").optional().or(z.literal("")),
  weeklyRate: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number").optional().or(z.literal("")),
  projectRate: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number").optional().or(z.literal("")),
  
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
  
  // Acting-specific fields from database
  acting_specialty: z.array(z.string()).optional(),
  acting_experience_years: z.string().optional(),
  acting_method: z.array(z.string()).optional(),
  improvisation_comfort: z.string().optional(),
  stage_combat: z.string().optional(),
  intimate_scenes: z.string().optional(),
  preferred_roles: z.array(z.string()).optional(),
  motion_capture: z.string().optional(),
  animals_comfort: z.string().optional(),
  crying_on_cue: z.string().optional(),
  period_pieces: z.string().optional(),
  physical_comedy: z.string().optional(),
  accent_experience: z.string().optional(),
  green_screen: z.string().optional(),
  stunt_comfort: z.string().optional(),
  shakespeare_experience: z.string().optional(),
  musical_theater: z.string().optional(),
  children_experience: z.string().optional(),
  horror_experience: z.string().optional(),
  // Representation fields
  current_manager: z.string().optional(),
  current_agent: z.string().optional(),
  current_publicist: z.string().optional(),
  representation_status: z.string().optional(),
  
  // Musician-specific fields
  primary_instrument: z.string().optional(),
  additional_instruments: z.array(z.string()).optional(),
  music_experience_years: z.string().optional(),
  music_genres: z.array(z.string()).optional(),
  performance_types: z.array(z.string()).optional(),
  music_theory_knowledge: z.string().optional(),
  sight_reading: z.string().optional(),
  improvisation_music: z.string().optional(),
  composition_skills: z.string().optional(),
  recording_experience: z.string().optional(),
  live_performance_experience: z.string().optional(),
  band_experience: z.string().optional(),
  solo_performance: z.string().optional(),
  music_production: z.string().optional(),
  audio_software: z.array(z.string()).optional(),
  music_education: z.string().optional(),
  performance_venues: z.array(z.string()).optional(),
  music_collaborations: z.string().optional(),
  music_awards: z.string().optional(),
  touring_experience: z.string().optional(),
  // Additional musician fields from database
  secondary_instruments: z.array(z.string()).optional(),
  music_improvisation: z.string().optional(),
  music_notation: z.string().optional(),
  music_therapy: z.string().optional(),
  musical_styles: z.array(z.string()).optional(),
  session_work: z.string().optional(),
  live_performance: z.string().optional(),
  digital_production: z.string().optional(),
  collaborative_writing: z.string().optional(),
  teaching_experience: z.string().optional(),
  studio_experience: z.string().optional(),
  touring_comfort: z.string().optional(),
  performance_setting: z.string().optional(),
  performance_type: z.string().optional(),
  
  // Voice Artist-specific fields
  voice_type: z.string().optional(),
  voice_experience_years: z.string().optional(),
  voice_genres: z.array(z.string()).optional(),
  recording_setup: z.string().optional(),
  voice_training: z.string().optional(),
  character_voices: z.string().optional(),
  narration_experience: z.string().optional(),
  commercial_experience: z.string().optional(),
  audiobook_experience: z.string().optional(),
  animation_experience: z.string().optional(),
  video_game_experience: z.string().optional(),
  podcast_experience: z.string().optional(),
  voice_coaching: z.string().optional(),
  breath_control: z.string().optional(),
  voice_stamina: z.string().optional(),
  microphone_technique: z.string().optional(),
  voice_editing: z.string().optional(),
  multiple_characters: z.string().optional(),
  voice_impressions: z.string().optional(),
  voice_pitch_range: z.string().optional(),
  // Additional voice artist fields from database
  adult_content_voice: z.string().optional(),
  age_groups: z.array(z.string()).optional(),
  audiobook_narration: z.string().optional(),
  commercial_voice: z.string().optional(),
  emotional_voice_scenes: z.string().optional(),
  formal_training: z.string().optional(),
  home_recording: z.string().optional(),
  live_voice_work: z.string().optional(),
  long_sessions: z.string().optional(),
  multilingual_voice: z.string().optional(),
  technical_content: z.string().optional(),
  turnaround_time: z.string().optional(),
  video_game_voice: z.string().optional(),
  vocal_range_detail: z.string().optional(),
  voice_accents: z.array(z.string()).optional(),
  voice_age_ranges: z.array(z.string()).optional(),
  voice_improvisation: z.string().optional(),
  voice_projects: z.array(z.string()).optional(),
  voice_range: z.string().optional(),
  voice_singing: z.string().optional(),
  voice_specialty: z.string().optional(),
  
  // Model-specific fields
  modeling_type: z.string().optional(),
  modeling_experience_years: z.string().optional(),
  shoot_types: z.array(z.string()).optional(),
  wardrobe_sizes: z.string().optional(),
  portfolio_pieces: z.string().optional(),
  runway_experience: z.string().optional(),
  print_experience: z.string().optional(),
  commercial_modeling: z.string().optional(),
  fashion_modeling: z.string().optional(),
  fitness_modeling: z.string().optional(),
  lifestyle_modeling: z.string().optional(),
  product_modeling: z.string().optional(),
  swimwear_comfort: z.string().optional(),
  lingerie_comfort: z.string().optional(),
  nude_artistic: z.string().optional(),
  travel_availability: z.string().optional(),
  modeling_awards: z.string().optional(),
  agency_representation: z.string().optional(),
  modeling_education: z.string().optional(),
  photo_editing: z.string().optional(),
  // Additional model fields from database
  clothing_size: z.string().optional(),
  model_height: z.string().optional(),
  model_measurements: z.string().optional(),
  modeling_specialty: z.string().optional(),
  modeling_types: z.array(z.string()).optional(),
  multiple_photographers: z.string().optional(),
  nude_modeling: z.string().optional(),
  outdoor_shoots: z.string().optional(),
  pose_experience: z.string().optional(),
  shoot_availability: z.string().optional(),
  styling_changes: z.string().optional(),
  travel_comfort: z.string().optional(),
  video_modeling: z.string().optional(),
  long_shoots: z.string().optional(),
}).omit({ userId: true }); // Remove userId from client-side validation since it's added server-side

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Required fields by step
const requiredFieldsByStep = {
  1: ['role'], // Role selection
  2: ['talentType'], // Talent Type (for talent role)
  3: ['displayName', 'bio', 'location'], // Basic Info
  4: [], // Profile Image (optional)
  5: [], // Experience & Skills (role-specific questions - optional)
  6: [], // Media & Portfolio (optional)
  7: [], // Preferences & Availability (optional)
};

// Helper function to check if field is required
const isFieldRequired = (fieldName: string, step: number): boolean => {
  return requiredFieldsByStep[step]?.includes(fieldName) || false;
};

// Validation helpers and suggestions
const getFieldSuggestions = (fieldName: string, value: string, talentType?: string) => {
  const suggestions = [];
  
  switch (fieldName) {
    case 'displayName':
      if (value.length < 2) {
        suggestions.push({
          type: 'error',
          message: 'Display name should be at least 2 characters',
          icon: AlertCircle
        });
      } else if (value.length > 50) {
        suggestions.push({
          type: 'error',
          message: 'Display name is too long (max 50 characters)',
          icon: AlertCircle
        });
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        suggestions.push({
          type: 'error',
          message: 'Only letters, spaces, hyphens, and apostrophes allowed',
          icon: AlertCircle
        });
      } else if (value.length >= 2 && value.length <= 50) {
        suggestions.push({
          type: 'success',
          message: 'Great! Your display name looks good',
          icon: CheckCircle
        });
      }
      break;
      
    case 'bio':
      if (value.length < 10) {
        suggestions.push({
          type: 'warning',
          message: `Add ${10 - value.length} more characters to describe yourself better`,
          icon: Info
        });
      } else if (value.length > 500) {
        suggestions.push({
          type: 'error',
          message: 'Bio is too long (max 500 characters)',
          icon: AlertCircle
        });
      } else if (value.length >= 10 && value.length <= 100) {
        suggestions.push({
          type: 'info',
          message: 'Consider adding more details about your experience',
          icon: Lightbulb
        });
      } else if (value.length > 100) {
        suggestions.push({
          type: 'success',
          message: 'Excellent! Your bio provides great detail',
          icon: CheckCircle
        });
      }
      
      // Talent-specific bio suggestions
      if (talentType === 'musician' && value.length >= 10) {
        if (!value.toLowerCase().includes('music') && !value.toLowerCase().includes('instrument')) {
          suggestions.push({
            type: 'info',
            message: 'Consider mentioning your musical instruments or genres',
            icon: Lightbulb
          });
        }
      } else if (talentType === 'actor' && value.length >= 10) {
        if (!value.toLowerCase().includes('act') && !value.toLowerCase().includes('perform')) {
          suggestions.push({
            type: 'info',
            message: 'Consider mentioning your acting experience or training',
            icon: Lightbulb
          });
        }
      }
      break;
      
    case 'location':
      if (value.length < 2) {
        suggestions.push({
          type: 'error',
          message: 'Location should be at least 2 characters',
          icon: AlertCircle
        });
      } else if (value.length > 100) {
        suggestions.push({
          type: 'error',
          message: 'Location is too long (max 100 characters)',
          icon: AlertCircle
        });
      } else if (value.length >= 2) {
        suggestions.push({
          type: 'success',
          message: 'Location looks good',
          icon: CheckCircle
        });
      }
      break;
      
    case 'website':
      if (value && value.length > 0) {
        try {
          new URL(value);
          suggestions.push({
            type: 'success',
            message: 'Valid website URL',
            icon: CheckCircle
          });
        } catch {
          suggestions.push({
            type: 'error',
            message: 'Please enter a valid URL (e.g., https://yoursite.com)',
            icon: AlertCircle
          });
        }
      }
      break;
      
    case 'phoneNumber':
      if (value && value.length > 0) {
        if (!/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
          suggestions.push({
            type: 'error',
            message: 'Invalid phone number format',
            icon: AlertCircle
          });
        } else {
          suggestions.push({
            type: 'success',
            message: 'Valid phone number',
            icon: CheckCircle
          });
        }
      }
      break;
      
    case 'dailyRate':
    case 'weeklyRate':
    case 'projectRate':
      if (value && value.length > 0) {
        if (!/^\d*\.?\d*$/.test(value)) {
          suggestions.push({
            type: 'error',
            message: 'Please enter a valid number',
            icon: AlertCircle
          });
        } else {
          const numValue = parseFloat(value);
          if (numValue < 1) {
            suggestions.push({
              type: 'warning',
              message: 'Consider setting a higher rate to value your work',
              icon: Info
            });
          } else if (numValue > 0) {
            suggestions.push({
              type: 'success',
              message: 'Rate looks good',
              icon: CheckCircle
            });
          }
        }
      }
      break;
  }
  
  return suggestions;
};

const ValidationFeedback = ({ fieldName, value, talentType }: { fieldName: string, value: string, talentType?: string }) => {
  const suggestions = getFieldSuggestions(fieldName, value, talentType);
  
  if (suggestions.length === 0) return null;
  
  return (
    <div className="mt-2 space-y-1">
      {suggestions.map((suggestion, index) => (
        <div key={index} className={`flex items-center gap-2 text-sm ${
          suggestion.type === 'error' ? 'text-red-600 dark:text-red-400' :
          suggestion.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
          suggestion.type === 'success' ? 'text-green-600 dark:text-green-400' :
          'text-blue-600 dark:text-blue-400'
        }`}>
          <suggestion.icon className="h-4 w-4" />
          <span>{suggestion.message}</span>
        </div>
      ))}
    </div>
  );
};

// Helper component for required field label
const RequiredFieldLabel = ({ children, required = false }: { children: React.ReactNode; required?: boolean }) => (
  <div className="flex items-center gap-1">
    {children}
    {required && <span className="text-red-500 text-sm">*</span>}
  </div>
);

// Cache-busting comment to force component refresh - v2.0
function Onboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Remove debug logs
  const [newSkill, setNewSkill] = useState("");
  const [isStepChanging, setIsStepChanging] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPricingSelection, setShowPricingSelection] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const totalSteps = 7;

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
  }, [isAuthenticated, isLoading]); // Remove toast from dependencies

  // Redirect if user already has a profile
  useEffect(() => {
    if (user?.profile) {
      setLocation("/");
    }
  }, [user?.profile, setLocation]); // Only depend on profile, not entire user object

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "talent",
      talentType: "actor",
      displayName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
      bio: "",
      location: "",
      profileImageUrl: "",
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

  // Auto-populate role and skip role selection for authenticated users
  useEffect(() => {
    if (user?.role) {
      form.setValue("role", user.role);
      
      // Set appropriate starting step based on user role
      if (user.role === "talent") {
        setCurrentStep(2); // Start at talent type selection
      } else {
        setCurrentStep(3); // Start at basic info for non-talent roles  
      }
    }
  }, [user?.role]); // Only depend on user role, not entire user object or form

  const createProfileMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      try {
        const response = await apiRequest("POST", "/api/profile", data);
        const result = await response.json();
        return result;
      } catch (error) {
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
          description: "Your profile has been created successfully. You'll now be redirected to your dashboard!",
        });
        setShowCelebration(false);
        // Redirect to dashboard for verification and full platform access
        setTimeout(() => {
          setLocation("/dashboard");
        }, 500);
      }, 1000);
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
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Optimize form watching to prevent excessive re-renders
  const watchedValues = form.watch(["role", "talentType", "displayName", "location", "bio", "website", "phoneNumber"]);
  const [watchedRole, watchedTalentType, watchedDisplayName, watchedLocation, watchedBio, watchedWebsite, watchedPhoneNumber] = watchedValues;

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
  };

  const addFromDropdown = (field: keyof OnboardingFormData, value: string) => {
    const currentSkills = form.getValues(field) as string[] || [];
    if (!currentSkills.includes(value)) {
      const newValues = [...currentSkills, value];
      form.setValue(field, newValues);
    }
  };

  const renderMultiSelectField = (
    field: keyof OnboardingFormData,
    label: string,
    options: Array<{ value: string; label: string }>,
    placeholder: string = "Select options..."
  ) => {
    const currentValues = form.getValues(field) as string[] || [];
    
    return (
      <div className="space-y-2">
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

  const renderCustomField = (field: keyof OnboardingFormData, label: string) => {
    const currentValues = form.getValues(field) as string[] || [];
    
    return (
      <div className="space-y-2">
        <div className="flex space-x-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add custom option..."
            className="flex-1"
          />
          <Button type="button" onClick={() => addSkill(field)} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {currentValues.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {currentValues.map((value) => (
              <Badge key={value} variant="secondary" className="flex items-center gap-1">
                {value}
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

  // Fetch role-specific questions from database
  const { data: profileQuestions = [] } = useQuery({
    queryKey: ["/api/profile-questions"],
    enabled: !!watchedRole,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoize the relevant questions to prevent re-computation
  const relevantQuestions = useMemo(() => {
    if (!watchedRole) return [];

    // Filter questions based on role
    let questionTypes = [];
    if (watchedRole === 'talent' && watchedTalentType) {
      // For talent users, show both profile questions and their specific talent type questions
      questionTypes = ['profile', watchedTalentType];
    } else {
      // For non-talent users (manager, producer, agent), show 'profile' questions
      questionTypes = ['profile'];
    }

    return profileQuestions
      .filter(q => {
        const questionType = q.talentType;
        const isRelevant = questionTypes.includes(questionType) && q.active;
        
        // Exclude profile image question since it has its own dedicated step
        const isProfileImageQuestion = q.fieldName === 'profileImageUrl' || q.field_name === 'profileImageUrl';
        
        // Exclude basic profile questions that are handled in earlier steps
        const fieldName = q.fieldName || q.field_name;
        const isBasicProfileQuestion = [
          'displayName', 'bio', 'location', 'website', 'phoneNumber'
        ].includes(fieldName);
        
        return isRelevant && !isProfileImageQuestion && !isBasicProfileQuestion;
      })
      .sort((a, b) => a.order - b.order);
  }, [watchedRole, watchedTalentType, profileQuestions]);

  // Render questions directly without inline component
  const renderRoleSpecificQuestions = () => {
    if (!watchedRole || relevantQuestions.length === 0) {
      return (
        <div className="text-gray-500 text-center py-8">
          <p>No questions available for this role.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relevantQuestions.map((question) => (
            <div key={`q-${question.id}`} className="space-y-3">
              <Label className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                {question.question}
                {question.required && <span className="text-red-500 text-xs">*</span>}
              </Label>
              <div className="relative">
                {renderDynamicFormField(question)}
                {question.required && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {relevantQuestions.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <Info className="h-4 w-4" />
              <span>
                <strong>Tip:</strong> Complete as many fields as possible to improve your profile visibility and match with better opportunities.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDynamicFormField = (question: any) => {
    const fieldName = question.fieldName || question.field_name;
    const currentValue = form.getValues(fieldName) || '';
    

    
    const handleChange = (value: any) => {
      form.setValue(fieldName, value);
    };
    
    switch (question.fieldType || question.field_type) {
      case 'text':
        return (
          <Input
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your response..."
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={typeof currentValue === 'string' || typeof currentValue === 'number' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter a number..."
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your response..."
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select onValueChange={handleChange} value={typeof currentValue === 'string' ? currentValue : ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return renderMultiSelectField(
          fieldName as keyof OnboardingFormData,
          question.question,
          (question.options || []).map((opt: string) => ({ value: opt, label: opt })),
          "Select options..."
        );
      
      case 'multiselect':
        return renderMultiSelectField(
          fieldName as keyof OnboardingFormData,
          question.question,
          (question.options || []).map((opt: string) => ({ value: opt, label: opt })),
          "Select options..."
        );
      
      case 'yesno':
      case 'boolean':
        return (
          <Select onValueChange={handleChange} value={typeof currentValue === 'string' ? currentValue : ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select yes or no..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'file':
        // File uploads are handled in dedicated steps, not in role-specific questions
        return (
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              File upload is handled in a dedicated step.
            </p>
          </div>
        );
      
      default:
        return (
          <Input
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your response..."
          />
        );
    }
  };

  const getMaxSteps = () => {
    const isAuthenticated = !!user?.role;
    // For authenticated users, we skip role selection step
    if (isAuthenticated) {
      return watchedRole === "talent" ? 7 : 5; // Include profile image step
    } else {
      return watchedRole === "talent" ? 8 : 6; // Include profile image step
    }
  };

  // Get talent-specific questions based on talent type
  const getTalentSpecificQuestions = (talentType: string) => {
    const baseQuestions = [
      { field: 'languages', label: 'Languages', type: 'multiSelect', options: LANGUAGE_OPTIONS },
      { field: 'accents', label: 'Accents', type: 'multiSelect', options: ACCENT_OPTIONS },
      { field: 'unionStatus', label: 'Union Status', type: 'multiSelect', options: UNION_STATUS_OPTIONS },
      { field: 'skills', label: 'Special Skills', type: 'custom' },
      { field: 'experiences', label: 'Experience', type: 'custom' },
      { field: 'awards', label: 'Awards & Recognition', type: 'custom' },
    ];

    switch (talentType) {
      case 'actor':
        return [
          ...baseQuestions,
          { field: 'height', label: 'Height', type: 'input', placeholder: '5\'10"' },
          { field: 'weight', label: 'Weight', type: 'input', placeholder: '150 lbs' },
          { field: 'eyeColor', label: 'Eye Color', type: 'multiSelect', options: EYE_COLOR_OPTIONS },
          { field: 'hairColor', label: 'Hair Color', type: 'multiSelect', options: HAIR_COLOR_OPTIONS },
          { field: 'shoeSize', label: 'Shoe Size', type: 'input', placeholder: '10' },
          { field: 'bodyStats', label: 'Body Measurements', type: 'input', placeholder: '36-28-38' },
          { field: 'tattoos', label: 'Tattoos', type: 'input', placeholder: 'None or describe' },
          { field: 'piercings', label: 'Piercings', type: 'input', placeholder: 'None or describe' },
          { field: 'scars', label: 'Scars/Marks', type: 'input', placeholder: 'None or describe' },
          { field: 'stunts', label: 'Stunt Skills', type: 'multiSelect', options: STUNT_OPTIONS },
          { field: 'activities', label: 'Physical Activities', type: 'multiSelect', options: ACTIVITY_OPTIONS },
          { field: 'dancingStyles', label: 'Dancing Styles', type: 'multiSelect', options: DANCING_STYLES },
          { field: 'sportingActivities', label: 'Sports', type: 'custom' },
          { field: 'drivingLicenses', label: 'Driving Licenses', type: 'multiSelect', options: DRIVING_LICENSES },
          { field: 'wardrobe', label: 'Wardrobe Sizes', type: 'multiSelect', options: WARDROBE_OPTIONS },
          { field: 'walkType', label: 'Walk Type', type: 'input', placeholder: 'Runway, casual, etc.' },
        ];
      
      case 'musician':
        return [
          ...baseQuestions,
          { field: 'instruments', label: 'Instruments', type: 'multiSelect', options: INSTRUMENT_OPTIONS },
          { field: 'genres', label: 'Music Genres', type: 'multiSelect', options: GENRE_OPTIONS },
          { field: 'vocalRange', label: 'Vocal Range', type: 'multiSelect', options: VOCAL_RANGE_OPTIONS },
          { field: 'affiliations', label: 'Music Affiliations', type: 'multiSelect', options: AFFILIATION_OPTIONS },
        ];
      
      case 'voice_artist':
        return [
          ...baseQuestions,
          { field: 'vocalRange', label: 'Vocal Range', type: 'multiSelect', options: VOCAL_RANGE_OPTIONS },
          { field: 'genres', label: 'Voice Genres', type: 'multiSelect', options: GENRE_OPTIONS },
        ];
      
      case 'model':
        return [
          ...baseQuestions,
          { field: 'height', label: 'Height', type: 'input', placeholder: '5\'10"' },
          { field: 'weight', label: 'Weight', type: 'input', placeholder: '150 lbs' },
          { field: 'eyeColor', label: 'Eye Color', type: 'multiSelect', options: EYE_COLOR_OPTIONS },
          { field: 'hairColor', label: 'Hair Color', type: 'multiSelect', options: HAIR_COLOR_OPTIONS },
          { field: 'shoeSize', label: 'Shoe Size', type: 'input', placeholder: '10' },
          { field: 'bodyStats', label: 'Body Measurements', type: 'input', placeholder: '36-28-38' },
          { field: 'tattoos', label: 'Tattoos', type: 'input', placeholder: 'None or describe' },
          { field: 'piercings', label: 'Piercings', type: 'input', placeholder: 'None or describe' },
          { field: 'scars', label: 'Scars/Marks', type: 'input', placeholder: 'None or describe' },
          { field: 'walkType', label: 'Walk Styles', type: 'input', placeholder: 'Runway, fashion, commercial' },
          { field: 'wardrobe', label: 'Wardrobe Sizes', type: 'multiSelect', options: WARDROBE_OPTIONS },
          { field: 'dancingStyles', label: 'Dancing Styles', type: 'multiSelect', options: DANCING_STYLES },
          { field: 'activities', label: 'Physical Activities', type: 'multiSelect', options: ACTIVITY_OPTIONS },
          { field: 'sportingActivities', label: 'Sports', type: 'custom' },
          { field: 'drivingLicenses', label: 'Driving Licenses', type: 'multiSelect', options: DRIVING_LICENSES },
        ];
      
      case 'writer':
        return [
          ...baseQuestions,
          { field: 'genres', label: 'Writing Genres', type: 'multiSelect', options: GENRE_OPTIONS },
          { field: 'specializations', label: 'Writing Specializations', type: 'custom' },
          { field: 'publications', label: 'Publications', type: 'custom' },
          { field: 'writingTools', label: 'Writing Tools', type: 'custom' },
        ];
      
      case 'director':
        return [
          ...baseQuestions,
          { field: 'genres', label: 'Directing Genres', type: 'multiSelect', options: GENRE_OPTIONS },
          { field: 'projectTypes', label: 'Project Types', type: 'custom' },
          { field: 'crewExperience', label: 'Crew Experience', type: 'custom' },
          { field: 'equipmentExperience', label: 'Equipment Experience', type: 'custom' },
        ];
      
      case 'cinematographer':
        return [
          ...baseQuestions,
          { field: 'cameraEquipment', label: 'Camera Equipment', type: 'custom' },
          { field: 'lightingEquipment', label: 'Lighting Equipment', type: 'custom' },
          { field: 'shootingFormats', label: 'Shooting Formats', type: 'custom' },
          { field: 'postProduction', label: 'Post-Production Skills', type: 'custom' },
        ];
      
      default:
        return baseQuestions;
    }
  };

  const getStepInfo = (step: number) => {
    // For authenticated users, we skip role selection step
    const isAuthenticated = !!user?.role;
    
    const roleSteps = {
      talent: [
        { title: "Talent Type", description: "Choose your talent type", icon: Star },
        { title: "Basic Information", description: "Personal details", icon: User },
        { title: "Profile Image", description: "Upload your photo", icon: Camera },
        { title: "Physical Details", description: "Appearance & stats", icon: Star },
        { title: "Skills & Experience", description: "What you can do", icon: Medal },
        { title: "Location & Contact", description: "Where you work", icon: Crown },
        { title: "Rates & Availability", description: "Your pricing", icon: Trophy },
      ],
      manager: [
        { title: "Basic Information", description: "Personal details", icon: User },
        { title: "Profile Image", description: "Upload your photo", icon: Camera },
        { title: "Management Details", description: "Your experience & services", icon: Star },
        { title: "Rates & Availability", description: "Your pricing", icon: Trophy },
      ],
      agent: [
        { title: "Basic Information", description: "Personal details", icon: User },
        { title: "Profile Image", description: "Upload your photo", icon: Camera },
        { title: "Agent Details", description: "Your agency & experience", icon: Star },
        { title: "Rates & Availability", description: "Your pricing", icon: Trophy },
      ],
      producer: [
        { title: "Basic Information", description: "Personal details", icon: User },
        { title: "Profile Image", description: "Upload your photo", icon: Camera },
        { title: "Production Details", description: "Your projects & experience", icon: Star },
        { title: "Rates & Availability", description: "Your pricing", icon: Trophy },
      ],
      default: [
        { title: "Basic Information", description: "Personal details", icon: User },
        { title: "Profile Image", description: "Upload your photo", icon: Camera },
        { title: "Professional Details", description: "Your experience", icon: Star },
        { title: "Rates & Availability", description: "Your pricing", icon: Trophy },
      ]
    };

    // If not authenticated, show role selection step first
    if (!isAuthenticated && step === 1) {
      return { title: "Role Selection", description: "Choose your role", icon: User };
    }

    const steps = roleSteps[watchedRole as keyof typeof roleSteps] || roleSteps.default;
    const adjustedStep = isAuthenticated ? step : step - 1; // Adjust for skipped role selection
    return steps[adjustedStep - 1] || { title: "Step", description: "", icon: User };
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
        // Special error messages for specific fields
        if (field === 'profileImageUrl') {
          errors.push('Profile image is required');
        } else {
          errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
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
      
      // Mark current step as completed
      const stepInfo = getStepInfo(currentStep);
      setCompletedSteps(prev => [...prev, stepInfo.title]);
      
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

    
    // Additional validation for required fields
    if (!data.displayName || !data.bio || !data.location) {

      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (data.bio.length < 10) {

      toast({
        title: "Bio Too Short",
        description: "Please write a bio with at least 10 characters",
        variant: "destructive",
      });
      return;
    }
    

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
        
        {/* Emotional Progress Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <EmotionalProgress
              currentStep={currentStep}
              totalSteps={getMaxSteps()}
              stepTitle={getStepInfo(currentStep).title}
              completedSteps={completedSteps}
              showRewards={true}
              onStepComplete={(step) => {
                // Optional: Add additional celebration logic here

              }}
            />
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
              {/* Step 1: Role Selection (only for non-authenticated users) */}
              {currentStep === 1 && !user?.role && (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                          value: "agent",
                          title: "Agent",
                          description: "Connect talent with opportunities",
                          icon: <Theater className="h-12 w-12" />,
                          gradient: "from-purple-500 to-pink-600"
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
                          },
                          {
                            value: "writer",
                            title: "Writer",
                            description: "Screenwriter, Author, Journalist",
                            icon: <Zap className="h-8 w-8" />
                          },
                          {
                            value: "director",
                            title: "Director",
                            description: "Film, TV, Commercial, Documentary",
                            icon: <Video className="h-8 w-8" />
                          },
                          {
                            value: "cinematographer",
                            title: "Cinematographer",
                            description: "Director of Photography, Camera Operator",
                            icon: <Camera className="h-8 w-8" />
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
                        <ValidationFeedback 
                          fieldName="displayName" 
                          value={watchedDisplayName || ""} 
                          talentType={watchedTalentType}
                        />
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
                        <ValidationFeedback 
                          fieldName="location" 
                          value={watchedLocation || ""} 
                          talentType={watchedTalentType}
                        />
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
                      <ValidationFeedback 
                        fieldName="bio" 
                        value={watchedBio || ""} 
                        talentType={watchedTalentType}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {watchedBio?.length || 0}/500 characters
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          {...form.register("website")}
                          placeholder="https://yourwebsite.com"
                          className={form.formState.errors.website ? "border-red-500" : ""}
                        />
                        {form.formState.errors.website && (
                          <p className="text-red-500 text-sm">{form.formState.errors.website.message}</p>
                        )}
                        <ValidationFeedback 
                          fieldName="website" 
                          value={watchedWebsite || ""} 
                          talentType={watchedTalentType}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                        <Input
                          {...form.register("phoneNumber")}
                          placeholder="+1 (555) 123-4567"
                          className={form.formState.errors.phoneNumber ? "border-red-500" : ""}
                        />
                        {form.formState.errors.phoneNumber && (
                          <p className="text-red-500 text-sm">{form.formState.errors.phoneNumber.message}</p>
                        )}
                        <ValidationFeedback 
                          fieldName="phoneNumber" 
                          value={watchedPhoneNumber || ""} 
                          talentType={watchedTalentType}
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

              {/* Step 4: Profile Image */}
              {currentStep === 4 && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                      <Camera className="h-8 w-8 text-blue-600" />
                      Profile Image
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add a professional photo to your profile (optional but recommended)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="max-w-md mx-auto">
                      <ProfileImageUpload
                        currentImage={form.getValues('profileImageUrl') || ''}
                        onImageUpdate={(imageUrl) => form.setValue('profileImageUrl', imageUrl)}
                        mandatory={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Role-specific questions */}
              {currentStep === 5 && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      {watchedRole === 'manager' && 'Management Details'}
                      {watchedRole === 'agent' && 'Agent Details'}
                      {watchedRole === 'producer' && 'Production Details'}
                      {watchedRole === 'talent' && watchedTalentType === 'actor' && 'Acting Details'}
                      {watchedRole === 'talent' && watchedTalentType === 'musician' && 'Music Details'}
                      {watchedRole === 'talent' && watchedTalentType === 'voice_artist' && 'Voice Details'}
                      {watchedRole === 'talent' && watchedTalentType === 'model' && 'Modeling Details'}
                      {watchedRole === 'talent' && !watchedTalentType && 'Talent Details'}
                      {!watchedRole && 'Professional Details'}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      {watchedRole === 'manager' && 'Tell us about your management experience and services'}
                      {watchedRole === 'agent' && 'Tell us about your agency experience and specializations'}
                      {watchedRole === 'producer' && 'Tell us about your production experience and projects'}
                      {watchedRole === 'talent' && watchedTalentType === 'actor' && 'Add your acting experience, physical attributes, and special skills'}
                      {watchedRole === 'talent' && watchedTalentType === 'musician' && 'Add your musical instruments, genres, and performance experience'}
                      {watchedRole === 'talent' && watchedTalentType === 'voice_artist' && 'Add your vocal range, experience, and voice skills'}
                      {watchedRole === 'talent' && watchedTalentType === 'model' && 'Add your physical attributes, modeling experience, and special skills'}
                      {watchedRole === 'talent' && !watchedTalentType && 'Add your professional skills and experience'}
                      {!watchedRole && 'Tell us about your professional background'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderRoleSpecificQuestions()}
                  </CardContent>
                </Card>
              )}

              {/* Step 6: Additional Information */}
              {currentStep === 6 && watchedRole === "talent" && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Additional Information</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add any additional details about your talent profile
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Representation Information
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="current_manager">Current Manager (Optional)</Label>
                        <Input
                          {...form.register("current_manager")}
                          placeholder="Enter your current manager's name"
                          type="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_agent">Current Agent (Optional)</Label>
                        <Input
                          {...form.register("current_agent")}
                          placeholder="Enter your current agent's name"
                          type="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_publicist">Current Publicist (Optional)</Label>
                        <Input
                          {...form.register("current_publicist")}
                          placeholder="Enter your current publicist's name"
                          type="text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="representation_status">Representation Status</Label>
                        <Select onValueChange={(value) => form.setValue("representation_status", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select representation status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seeking">Seeking representation</SelectItem>
                            <SelectItem value="have">Have representation</SelectItem>
                            <SelectItem value="self">Self-represented</SelectItem>
                            <SelectItem value="not_seeking">Not currently seeking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 7 (or 6 for non-talent): Rates and Availability */}
              {((currentStep === 7 && watchedRole === "talent") || (currentStep === 6 && watchedRole !== "talent")) && (
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
                              className={form.formState.errors.dailyRate ? "border-red-500" : ""}
                            />
                            {form.formState.errors.dailyRate && (
                              <p className="text-red-500 text-sm">{form.formState.errors.dailyRate.message}</p>
                            )}
                            <ValidationFeedback 
                              fieldName="dailyRate" 
                              value={form.watch("dailyRate") || ""} 
                              talentType={watchedTalentType}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weeklyRate">Weekly Rate ($)</Label>
                            <Input
                              {...form.register("weeklyRate")}
                              placeholder="2500"
                              type="number"
                              className={form.formState.errors.weeklyRate ? "border-red-500" : ""}
                            />
                            {form.formState.errors.weeklyRate && (
                              <p className="text-red-500 text-sm">{form.formState.errors.weeklyRate.message}</p>
                            )}
                            <ValidationFeedback 
                              fieldName="weeklyRate" 
                              value={form.watch("weeklyRate") || ""} 
                              talentType={watchedTalentType}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="projectRate">Project Rate ($)</Label>
                            <Input
                              {...form.register("projectRate")}
                              placeholder="10000"
                              type="number"
                              className={form.formState.errors.projectRate ? "border-red-500" : ""}
                            />
                            {form.formState.errors.projectRate && (
                              <p className="text-red-500 text-sm">{form.formState.errors.projectRate.message}</p>
                            )}
                            <ValidationFeedback 
                              fieldName="projectRate" 
                              value={form.watch("projectRate") || ""} 
                              talentType={watchedTalentType}
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

                      
                      // Use form's handleSubmit to trigger validation
                      form.handleSubmit(onSubmit)();
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

      {/* Pricing Selection Modal */}
      {showPricingSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6">
              <PricingSelection
                userRole={user?.role || 'talent'}
                onComplete={() => {
                  setShowPricingSelection(false);
                  // Redirect to dashboard after plan selection
                  setLocation("/dashboard");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}

export default Onboarding;
