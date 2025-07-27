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

import ProfileImageUpload from "@/components/ProfileImageUpload";
import { PricingSelection } from "@/components/PricingSelection";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";

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
  
  // Profile image URL - make optional since users can skip
  profileImageUrl: z.string().optional(),
  
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
  
  // Acting-specific fields from database (using actual DB field names)
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
  // Representation fields
  currentAgent: z.string().optional(),
  currentPublicist: z.string().optional(),
  representationStatus: z.string().optional(),
  
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
        // Accept common phone number formats: (xxx) xxx-xxxx, xxx-xxx-xxxx, xxx.xxx.xxxx, xxxxxxxxxx, +x xxx xxx xxxx
        const phoneRegex = /^(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
        if (!phoneRegex.test(value)) {
          suggestions.push({
            type: 'error',
            message: 'Please use format: 407-555-1212 or (407) 555-1212',
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
  const totalSteps = 8;

  // Simplified authentication check with proper state handling
  useEffect(() => {
    // Only redirect after initial loading is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("🚨 AUTH FAILED - User not authenticated, redirecting to login");
        toast({
          title: "Please log in",
          description: "You need to be logged in to access onboarding.",
          variant: "destructive",
        });
        // Clear any existing form data to prevent confusion
        localStorage.removeItem('onboarding-form-data');
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
        return;
      } else {
        console.log("✅ AUTH OK - User authenticated:", user?.username);
      }
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Redirect if user already has a profile
  useEffect(() => {
    if (user && 'profile' in user && user.profile) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Load saved form data from localStorage if available
  const loadSavedFormData = () => {
    try {
      const saved = localStorage.getItem('onboarding-form-data');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log("📱 LOADING SAVED FORM DATA:", parsedData);
        return parsedData;
      }
    } catch (error) {
      console.log("❌ Failed to load saved form data:", error);
    }
    return null;
  };

  const savedData = loadSavedFormData();
  
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: savedData?.role || "talent",
      talentType: savedData?.talentType || "actor",
      displayName: savedData?.displayName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : ""),
      bio: savedData?.bio || "",
      location: savedData?.location || "",
      profileImageUrl: savedData?.profileImageUrl || "",
      website: savedData?.website || "",
      phoneNumber: savedData?.phoneNumber || "",
      availabilityStatus: savedData?.availabilityStatus || "available",
      languages: savedData?.languages || [],
      accents: savedData?.accents || [],
      instruments: savedData?.instruments || [],
      genres: savedData?.genres || [],
      affiliations: savedData?.affiliations || [],
      stunts: savedData?.stunts || [],
      activities: savedData?.activities || [],
      awards: savedData?.awards || [],
      experiences: savedData?.experiences || [],
      skills: savedData?.skills || [],
      wardrobe: savedData?.wardrobe || [],
      dancingStyles: savedData?.dancingStyles || [],
      sportingActivities: savedData?.sportingActivities || [],
      drivingLicenses: savedData?.drivingLicenses || [],
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
      // Acting-specific fields
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

  // Fetch existing user profile for pre-population
  const { data: existingProfile } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data for profile editing
  });
  
  console.log("🔍 ONBOARDING: Existing profile data retrieved:", {
    hasProfile: !!existingProfile,
    actingFieldsPresent: existingProfile ? {
      improvisationComfort: !!existingProfile.improvisationComfort,
      intimateScenesComfort: !!existingProfile.intimateScenesComfort,
      motionCapture: !!existingProfile.motionCapture,
      currentAgent: !!existingProfile.currentAgent,
      representationStatus: !!existingProfile.representationStatus
    } : "NO_PROFILE"
  });

  // Auto-populate role and existing profile data for authenticated users
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
  }, [user?.role]);

  // Pre-populate form with existing profile data when available
  useEffect(() => {
    console.log("🔄 Profile pre-population check:");
    console.log("  existingProfile:", existingProfile);
    console.log("  user:", user);
    console.log("  existingProfile keys:", existingProfile ? Object.keys(existingProfile) : 'none');
    
    if (existingProfile && user) {
      console.log("✅ Pre-populating form with existing profile:", existingProfile);
      
      // CRITICAL: Use form.reset instead of individual setValue calls to prevent form state conflicts
      const currentFormValues = form.getValues() as OnboardingFormData;
      const profileDefaults: OnboardingFormData = {
        // Keep current form values as base - preserve user input
        ...currentFormValues,
        // Basic user info - only override if data exists in profile
        displayName: existingProfile.displayName || currentFormValues.displayName,
        bio: existingProfile.bio || currentFormValues.bio,
        location: existingProfile.location || currentFormValues.location,
        website: existingProfile.website || currentFormValues.website,
        phoneNumber: existingProfile.phoneNumber || currentFormValues.phoneNumber,
        profileImageUrl: user.profileImageUrl || existingProfile.profileImageUrl || currentFormValues.profileImageUrl,
        
        // Actor-specific fields
        height: existingProfile.height || currentFormValues.height,
        weight: existingProfile.weight || currentFormValues.weight,
        eyeColor: existingProfile.eyeColor || currentFormValues.eyeColor,
        hairColor: existingProfile.hairColor || currentFormValues.hairColor,
        
        // Arrays and multi-select fields
        languages: existingProfile.languages || currentFormValues.languages,
        accents: existingProfile.accents || currentFormValues.accents,
        instruments: existingProfile.instruments || currentFormValues.instruments,
        genres: existingProfile.genres || currentFormValues.genres,
        unionStatus: existingProfile.unionStatus || currentFormValues.unionStatus,
        skills: existingProfile.skills || currentFormValues.skills,
        
        // Rates
        dailyRate: existingProfile.dailyRate || currentFormValues.dailyRate,
        weeklyRate: existingProfile.weeklyRate || currentFormValues.weeklyRate,
        projectRate: existingProfile.projectRate || currentFormValues.projectRate,
        
        // CRITICAL: Acting-specific questionnaire fields - preserve user input over empty defaults
        primarySpecialty: existingProfile.primarySpecialty || currentFormValues.primarySpecialty,
        yearsExperience: existingProfile.yearsExperience || currentFormValues.yearsExperience,
        actingMethod: existingProfile.actingMethod || currentFormValues.actingMethod,
        improvisationComfort: existingProfile.improvisationComfort || currentFormValues.improvisationComfort,
        stageCombat: existingProfile.stageCombat || currentFormValues.stageCombat,
        shakespeareExperience: existingProfile.shakespeareExperience || currentFormValues.shakespeareExperience,
        musicalTheater: existingProfile.musicalTheater || currentFormValues.musicalTheater,
        intimateScenesComfort: existingProfile.intimateScenesComfort || currentFormValues.intimateScenesComfort,
        roleTypes: existingProfile.roleTypes || currentFormValues.roleTypes,
        motionCapture: existingProfile.motionCapture || currentFormValues.motionCapture,
        animalWork: existingProfile.animalWork || currentFormValues.animalWork,
        cryingOnCue: existingProfile.cryingOnCue || currentFormValues.cryingOnCue,
        periodPieces: existingProfile.periodPieces || currentFormValues.periodPieces,
        physicalComedy: existingProfile.physicalComedy || currentFormValues.physicalComedy,
        accentExperience: existingProfile.accentExperience || currentFormValues.accentExperience,
        greenScreen: existingProfile.greenScreen || currentFormValues.greenScreen,
        stuntComfort: existingProfile.stuntComfort || currentFormValues.stuntComfort,
        horrorThriller: existingProfile.horrorThriller || currentFormValues.horrorThriller,
        currentAgent: existingProfile.currentAgent || currentFormValues.currentAgent,
        currentPublicist: existingProfile.currentPublicist || currentFormValues.currentPublicist,
        representationStatus: existingProfile.representationStatus || currentFormValues.representationStatus,
        
        // Additional fields
        availabilityStatus: existingProfile.availabilityStatus || currentFormValues.availabilityStatus,
      };
      
      console.log("🔄 Resetting form with merged data - preserving user input over empty defaults");
      console.log("Critical fields check:", {
        improvisationComfort: profileDefaults.improvisationComfort,
        intimateScenesComfort: profileDefaults.intimateScenesComfort,
        motionCapture: profileDefaults.motionCapture,
        cryingOnCue: profileDefaults.cryingOnCue,
        stuntComfort: profileDefaults.stuntComfort
      });
      
      form.reset(profileDefaults);
      
      console.log("✅ Form populated with existing data (including acting questionnaire fields)");
      console.log("📋 Current form values:", form.getValues());
    } else {
      console.log("❌ No profile data to populate - existingProfile:", !!existingProfile, "user:", !!user);
    }
  }, [existingProfile, user, form]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      try {
        console.log("🔥 MUTATION: Starting profile creation with data:", data);
        console.log("🔥 MUTATION: User authentication status:", { isAuthenticated, user: !!user, userId: user?.id });
        
        // Explicitly check authentication before API call
        if (!isAuthenticated || !user?.id) {
          console.error("🔥 MUTATION: User not authenticated - redirecting to login");
          throw new Error("Authentication required - please log in again");
        }
        
        const response = await apiRequest("POST", "/api/profile", data);
        console.log("🔥 MUTATION: API response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("🔥 MUTATION: API error response:", errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log("🔥 MUTATION: Profile creation successful:", !!result);
        return result;
      } catch (error) {
        console.error("🔥 MUTATION: Error in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log("=== PROFILE CREATION SUCCESS ===");
      console.log("Result:", result);
      
      // Show final celebration
      setShowCelebration(true);
      
      setTimeout(() => {
        // Comprehensive cache invalidation
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
        
        // Force user data refresh to ensure persistence
        queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        
        toast({
          title: "🎉 Welcome to Talents & Stars!",
          description: "Your profile has been created successfully. You'll now be redirected to your dashboard!",
        });
        setShowCelebration(false);
        
        // Enhanced redirect with proper session management
        setTimeout(() => {
          console.log("=== REDIRECTING TO DASHBOARD ===");
          // Use window.location for hard navigation to ensure clean state
          window.location.href = "/dashboard";
        }, 500);
      }, 1000);
    },
    onError: (error) => {
      console.log("=== PROFILE CREATION ERROR ===");
      console.error("Error:", error);
      console.log("Error type:", typeof error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace"
      });
      
      if (isUnauthorizedError(error)) {
        console.log("Unauthorized error detected - redirecting to login");
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      // Handle validation errors
      if (error instanceof Error && error.message.includes('validation')) {
        toast({
          title: "Validation Error",
          description: "Please check your form data and try again. Make sure all required fields are filled correctly.",
          variant: "destructive",
        });
        return;
      }
      
      // Handle network errors
      if (error instanceof Error && error.message.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.log("Final error message:", errorMessage);
      
      toast({
        title: "Profile Creation Failed",
        description: `Error: ${errorMessage}. Please try again or contact support if the problem persists.`,
        variant: "destructive",
      });
    },
  });

  // Optimize form watching to prevent excessive re-renders
  const watchedValues = form.watch(["role", "talentType", "displayName", "location", "bio", "website", "phoneNumber"]);
  const [watchedRole, watchedTalentType, watchedDisplayName, watchedLocation, watchedBio, watchedWebsite, watchedPhoneNumber] = watchedValues;
  
  // REMOVED AUTO-SAVE FUNCTIONALITY - Was causing infinite loops and conflicts
  // Auto-save disabled to prevent form submission conflicts and Stripe rate limiting

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
    // Use watch instead of getValues for reactive updates
    const currentValues = form.watch(field) as string[] || [];
    
    // Debug logging for multi-select fields
    console.log(`🔍 MultiSelect Debug - Field: ${field}`);
    console.log(`🔍 Current values:`, currentValues);
    console.log(`🔍 Current values type:`, typeof currentValues);
    console.log(`🔍 Is array:`, Array.isArray(currentValues));
    console.log(`🔍 Values length:`, currentValues.length);
    
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
    const currentValues = form.watch(field) as string[] || [];
    
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
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });

  // Helper function to group acting questions by step
  const getActingQuestionGroups = () => {
    if (!profileQuestions) return { step6: [], step7: [], step8: [] };
    
    const actingQuestions = (profileQuestions as any[]).filter((q: any) => {
      const questionType = q.talentType;
      const fieldName = q.fieldName || q.field_name;
      return questionType === 'actor' && 
             questionType !== 'profile' &&
             fieldName &&
             !['displayName', 'bio', 'location', 'website', 'phoneNumber', 'profileImageUrl'].includes(fieldName);
    });

    // Step 5: Acting Experience (experience & training related)
    const experienceFields = ['primarySpecialty', 'yearsExperience', 'actingMethod', 'stageCombat', 'shakespeareExperience', 'musicalTheater'];
    
    // Step 6: Physical & Skills (physical attributes & abilities)  
    const physicalFields = ['improvisationComfort', 'intimateScenesComfort', 'cryingOnCue', 'physicalComedy', 'stuntComfort', 'motionCapture', 'animalWork'];
    
    // Step 7: Role Preferences (preferred roles & representation)
    const roleFields = ['roleTypes', 'periodPieces', 'accentExperience', 'greenScreen', 'horrorThriller', 'currentAgent', 'currentPublicist', 'representationStatus'];

    return {
      step6: actingQuestions.filter(q => {
        const fieldName = q.fieldName || q.field_name;
        return experienceFields.includes(fieldName);
      }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
      step7: actingQuestions.filter(q => {
        const fieldName = q.fieldName || q.field_name;
        return physicalFields.includes(fieldName);
      }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
      step8: actingQuestions.filter(q => {
        const fieldName = q.fieldName || q.field_name;
        return roleFields.includes(fieldName);
      }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    };
  };

  // Memoize the relevant questions to prevent re-computation
  const relevantQuestions = useMemo(() => {
    if (!watchedRole) return [];

    // For acting talent, use grouped questions based on current step
    if (watchedRole === 'talent' && watchedTalentType === 'actor') {
      const questionGroups = getActingQuestionGroups();
      
      if (currentStep === 6) {
        return questionGroups.step6;
      } else if (currentStep === 7) {
        return questionGroups.step7;
      } else if (currentStep === 8) {
        return questionGroups.step8;
      }
      return [];
    }

    // For other talent types or roles, use original logic
    let questionTypes = [];
    if (watchedRole === 'talent' && watchedTalentType) {
      questionTypes = ['profile', watchedTalentType];
    } else {
      questionTypes = ['profile'];
    }

    return (profileQuestions as any[])
      .filter((q: any) => {
        const questionType = q.talentType;
        const isRelevant = questionTypes.includes(questionType) && q.active;
        
        // Exclude profile image question since it has its own dedicated step
        const isProfileImageQuestion = (q as any).fieldName === 'profileImageUrl' || (q as any).field_name === 'profileImageUrl';
        
        // Exclude basic profile questions that are handled in earlier steps
        const fieldName = (q as any).fieldName || (q as any).field_name;
        const isBasicProfileQuestion = [
          'displayName', 'bio', 'location', 'website', 'phoneNumber'
        ].includes(fieldName);
        
        return isRelevant && !isProfileImageQuestion && !isBasicProfileQuestion;
      })
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }, [watchedRole, watchedTalentType, profileQuestions, currentStep]);

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
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantQuestions.map((question) => (
            <div key={`q-${question.id}`} className="space-y-2">
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
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
    
    // Debug logging - CRITICAL: Show what's actually happening
    console.log('🔍 FIELD RENDER:', fieldName, 'Current value:', currentValue, 'Type:', typeof currentValue, 'Question:', question.question);
    
    const handleChange = (value: any) => {
      console.log('🔥 USER INPUT CAPTURED - Setting field:', fieldName, 'to value:', value, 'type:', typeof value);
      form.setValue(fieldName, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      // Force trigger to update form state
      form.trigger(fieldName);
      
      // Verify the value was actually set
      const verifyValue = form.getValues(fieldName);
      console.log('🔍 VERIFICATION - Field:', fieldName, 'now contains:', verifyValue);
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
      if (watchedRole === "talent" && watchedTalentType === 'actor') {
        return 9; // Actors get questionnaire step + 3 question steps (5, 6, 7) plus final rates step (8)
      } else if (watchedRole === "talent") {
        return 8; // Other talent types get questionnaire + standard flow
      } else {
        return 6; // Non-talent roles get questionnaire + basic flow
      }
    } else {
      if (watchedRole === "talent" && watchedTalentType === 'actor') {
        return 10; // +1 for role selection step
      } else if (watchedRole === "talent") {
        return 9; // +1 for role selection step
      } else {
        return 7; // +1 for role selection step
      }
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
      talentActor: [
        { title: "Talent Type", description: "Choose your talent type", icon: Star },
        { title: "Basic Information", description: "Personal details", icon: User },
        { title: "Profile Image", description: "Upload your photo", icon: Camera },
        { title: "Acting Experience", description: "Your experience & training", icon: Star },
        { title: "Physical & Skills", description: "Appearance & abilities", icon: Medal },
        { title: "Role Preferences", description: "Preferred roles & representation", icon: Crown },
        { title: "Contact & Rates", description: "Location & pricing", icon: Trophy },
      ],
      talent: [
        { title: "Talent Type", description: "Choose your talent type", icon: Star },
        { title: "Basic Information", description: "Personal details", icon: User },
        { title: "Profile Image", description: "Upload your photo", icon: Camera },
        { title: "Professional Details", description: "Your experience & skills", icon: Star },
        { title: "Additional Information", description: "Representation & details", icon: Medal },
        { title: "Contact & Rates", description: "Location & pricing", icon: Trophy },
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

    // Use specific actor steps for actors, regular talent steps for others
    const stepKey = (watchedRole === 'talent' && watchedTalentType === 'actor') ? 'talentActor' : watchedRole;
    const steps = roleSteps[stepKey as keyof typeof roleSteps] || roleSteps.default;
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

  const onSubmit = async (data: OnboardingFormData) => {
    console.log("=== FORM SUBMISSION START ===");
    console.log("Form data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("User authenticated:", isAuthenticated);
    console.log("Current user:", user);
    
    // Critical: Check authentication before any processing
    if (!isAuthenticated || !user) {
      console.log("🚨 SUBMIT BLOCKED - User not authenticated");
      toast({
        title: "Session Expired", 
        description: "Please log in again to save your profile.",
        variant: "destructive",
      });
      // Save form data before redirect
      localStorage.setItem('onboarding-form-data', JSON.stringify(data));
      setTimeout(() => window.location.href = "/auth", 1000);
      return;
    }
    
    // Get current form values to ensure data persistence
    const currentFormValues = form.getValues() as OnboardingFormData;
    console.log("🔍 CURRENT FORM VALUES:", currentFormValues);
    
    // Merge with submitted data to ensure all fields are captured
    const mergedData = { ...currentFormValues, ...data };
    console.log("🔍 MERGED DATA:", mergedData);
    
    // CRITICAL DEBUG: Check the exact values of the acting fields that are failing
    console.log("🚨 ACTING FIELDS DEBUG - MERGED DATA:");
    console.log("  improvisationComfort:", mergedData.improvisationComfort, "type:", typeof mergedData.improvisationComfort);
    console.log("  intimateScenesComfort:", mergedData.intimateScenesComfort, "type:", typeof mergedData.intimateScenesComfort);
    console.log("  motionCapture:", mergedData.motionCapture, "type:", typeof mergedData.motionCapture);
    console.log("  cryingOnCue:", mergedData.cryingOnCue, "type:", typeof mergedData.cryingOnCue);
    console.log("  stuntComfort:", data.stuntComfort, "type:", typeof data.stuntComfort);
    console.log("  yearsExperience:", data.yearsExperience, "type:", typeof data.yearsExperience);
    console.log("  primarySpecialty:", data.primarySpecialty, "length:", data.primarySpecialty?.length);
    
    // Additional validation for required fields - use merged data to check
    if (!mergedData.displayName || !mergedData.bio || !mergedData.location) {
      console.log("Required fields missing:", {
        displayName: !mergedData.displayName,
        bio: !mergedData.bio,
        location: !mergedData.location
      });
      
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields: Display Name, Bio, and Location",
        variant: "destructive",
      });
      return;
    }
    
    if (mergedData.bio.length < 10) {
      console.log("Bio too short:", mergedData.bio.length);
      
      toast({
        title: "Bio Too Short",
        description: "Please write a bio with at least 10 characters",
        variant: "destructive",
      });
      return;
    }
    
    // Clean the merged data before submission - remove empty strings and convert to null
    const cleanedData = {
      ...mergedData,
      // Convert empty string arrays to null or filter out empty values
      languages: Array.isArray(mergedData.languages) && mergedData.languages.length > 0 ? mergedData.languages.filter(l => l.trim()) : null,
      accents: Array.isArray(mergedData.accents) && mergedData.accents.length > 0 ? mergedData.accents.filter(a => a.trim()) : null,
      instruments: Array.isArray(mergedData.instruments) && mergedData.instruments.length > 0 ? mergedData.instruments.filter(i => i.trim()) : null,
      genres: Array.isArray(mergedData.genres) && mergedData.genres.length > 0 ? mergedData.genres.filter(g => g.trim()) : null,
      skills: Array.isArray(mergedData.skills) && mergedData.skills.length > 0 ? mergedData.skills.filter(s => s.trim()) : null,
      // Acting-specific array fields
      primarySpecialty: Array.isArray(mergedData.primarySpecialty) && mergedData.primarySpecialty.length > 0 ? mergedData.primarySpecialty.filter(p => p.trim()) : null,
      actingMethod: Array.isArray(mergedData.actingMethod) && mergedData.actingMethod.length > 0 ? mergedData.actingMethod.filter(m => m.trim()) : null,
      roleTypes: Array.isArray(mergedData.roleTypes) && mergedData.roleTypes.length > 0 ? mergedData.roleTypes.filter(r => r.trim()) : null,
      horrorThriller: Array.isArray(mergedData.horrorThriller) && mergedData.horrorThriller.length > 0 ? mergedData.horrorThriller.filter(h => h.trim()) : null,
      // Convert empty strings to null for optional fields
      website: mergedData.website?.trim() || null,
      phoneNumber: mergedData.phoneNumber?.trim() || null,
      profileImageUrl: mergedData.profileImageUrl?.trim() || user?.profileImageUrl || null,
      // Acting experience fields - FIXED: Preserve user input, only convert truly empty values to null
      yearsExperience: mergedData.yearsExperience ? String(mergedData.yearsExperience) : null,
      improvisationComfort: mergedData.improvisationComfort && mergedData.improvisationComfort.trim() ? mergedData.improvisationComfort.trim() : null,
      stageCombat: mergedData.stageCombat ? String(mergedData.stageCombat) : null,
      intimateScenesComfort: mergedData.intimateScenesComfort && mergedData.intimateScenesComfort.trim() ? mergedData.intimateScenesComfort.trim() : null,
      motionCapture: mergedData.motionCapture && mergedData.motionCapture.trim() ? mergedData.motionCapture.trim() : null,  
      animalWork: mergedData.animalWork && mergedData.animalWork.trim() ? mergedData.animalWork.trim() : null,
      cryingOnCue: mergedData.cryingOnCue && mergedData.cryingOnCue.trim() ? mergedData.cryingOnCue.trim() : null,
      periodPieces: mergedData.periodPieces && mergedData.periodPieces.trim() ? mergedData.periodPieces.trim() : null,
      physicalComedy: mergedData.physicalComedy && mergedData.physicalComedy.trim() ? mergedData.physicalComedy.trim() : null,
      accentExperience: mergedData.accentExperience && mergedData.accentExperience.trim() ? mergedData.accentExperience.trim() : null,
      greenScreen: mergedData.greenScreen && mergedData.greenScreen.trim() ? mergedData.greenScreen.trim() : null,
      stuntComfort: mergedData.stuntComfort && mergedData.stuntComfort.trim() ? mergedData.stuntComfort.trim() : null,
      shakespeareExperience: mergedData.shakespeareExperience && mergedData.shakespeareExperience.trim() ? mergedData.shakespeareExperience.trim() : null,
      musicalTheater: mergedData.musicalTheater && mergedData.musicalTheater.trim() ? mergedData.musicalTheater.trim() : null,
      currentAgent: (mergedData as any).currentAgent?.trim() || null,
      currentPublicist: (mergedData as any).currentPublicist?.trim() || null,
      representationStatus: (mergedData as any).representationStatus?.trim() || null,
      // Handle numeric fields as strings (backend expects strings)  
      dailyRate: mergedData.dailyRate ? String(mergedData.dailyRate) : null,
      weeklyRate: mergedData.weeklyRate ? String(mergedData.weeklyRate) : null,
      projectRate: mergedData.projectRate ? String(mergedData.projectRate) : null,
    };
    
    console.log("Cleaned data for submission:", cleanedData);
    console.log("🚨 ACTING FIELDS DEBUG - AFTER CLEANING:");
    console.log("  improvisationComfort:", cleanedData.improvisationComfort, "type:", typeof cleanedData.improvisationComfort);
    console.log("  intimateScenesComfort:", cleanedData.intimateScenesComfort, "type:", typeof cleanedData.intimateScenesComfort);
    console.log("  motionCapture:", cleanedData.motionCapture, "type:", typeof cleanedData.motionCapture);
    console.log("  cryingOnCue:", cleanedData.cryingOnCue, "type:", typeof cleanedData.cryingOnCue);
    console.log("  stuntComfort:", cleanedData.stuntComfort, "type:", typeof cleanedData.stuntComfort);
    console.log("=== SUBMITTING TO API ===");
    
    // Use merged data for final submission to ensure all form fields are captured
    console.log("🔥 Final submission data:", {
      role: mergedData.role,
      talentType: mergedData.talentType,
      displayName: mergedData.displayName,
      bio: mergedData.bio,
      location: mergedData.location,
      languagesCount: (mergedData.languages as string[])?.length || 0,
      skillsCount: (mergedData.skills as string[])?.length || 0,
      improvisationComfort: mergedData.improvisationComfort,
      intimateScenesComfort: mergedData.intimateScenesComfort,
      motionCapture: mergedData.motionCapture,
      cryingOnCue: mergedData.cryingOnCue
    });
    
    createProfileMutation.mutate(mergedData);
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
        
        {/* Minimal Progress Header */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5">
            <div className="flex items-center justify-between h-6">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{currentStep}</span>
                </div>
                <h2 className="text-sm font-medium text-gray-900 dark:text-white">{getStepInfo(currentStep).title}</h2>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">({currentStep}/{getMaxSteps()})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">{Math.round(progressPercentage)}%</span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome to Talents & Stars
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-300">
                Let's set up your profile to connect you with amazing opportunities
              </p>
            </div>

            <form onSubmit={async (e) => {
              console.log("🔥 FORM SUBMIT EVENT TRIGGERED");
              e.preventDefault();
              
              // Final auth check before submission
              try {
                const response = await fetch('/api/user', { credentials: 'include' });
                if (!response.ok) {
                  console.log("🚨 Auth failed in form submit");
                  toast({
                    title: "Session Expired", 
                    description: "Please log in again to save your data.",
                    variant: "destructive",
                  });
                  return;
                }
                console.log("✅ Auth OK in form submit - processing...");
                form.handleSubmit(onSubmit)(e);
              } catch (error) {
                console.log("🚨 Form submit auth error:", error);
              }
            }} className="space-y-6">
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

              {/* Step 4: Questionnaire */}
              {currentStep === 4 && watchedRole === "talent" && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                      <Lightbulb className="h-8 w-8 text-blue-600" />
                      Professional Questionnaire
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Answer some questions to enhance your profile and help casting directors find you
                    </p>
                  </CardHeader>
                  <CardContent>
                    <QuestionnaireForm 
                      userRole={watchedRole}
                      onComplete={() => {
                        // Mark questionnaire as completed and move to next step
                        console.log("Questionnaire completed!");
                      }}
                      showProgress={true}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 5 (or 4 for non-talent): Profile Image */}
              {((currentStep === 5 && watchedRole === "talent") || (currentStep === 4 && watchedRole !== "talent")) && (
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

              {/* Step 6 (or 5 for non-talent): Role-specific questions */}
              {((currentStep === 6 && watchedRole === "talent") || (currentStep === 5 && watchedRole !== "talent")) && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      {watchedRole === 'manager' && 'Management Details'}
                      {watchedRole === 'agent' && 'Agent Details'}
                      {watchedRole === 'producer' && 'Production Details'}
                      {watchedRole === 'talent' && watchedTalentType === 'actor' && 'Acting Experience'}
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
                      {watchedRole === 'talent' && watchedTalentType === 'actor' && 'Tell us about your acting experience, methods, and training'}
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

              {/* Step 7: Acting Physical & Skills OR Additional Information for other talent */}
              {currentStep === 7 && watchedRole === "talent" && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      {watchedTalentType === 'actor' ? 'Physical & Skills' : 'Additional Information'}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      {watchedTalentType === 'actor' 
                        ? 'Tell us about your physical attributes and special skills'
                        : 'Add any additional details about your talent profile'
                      }
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {watchedTalentType === 'actor' ? (
                      // Render step 5 questions for actors (physical & skills)
                      renderRoleSpecificQuestions()
                    ) : (
                      // Render the old additional information for non-actors
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Representation Information
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="currentManager">Current Manager (Optional)</Label>
                          <Input
                            {...form.register("currentManager")}
                            placeholder="Enter your current manager's name"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currentAgent">Current Agent (Optional)</Label>
                          <Input
                            {...form.register("currentAgent")}
                            placeholder="Enter your current agent's name"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currentPublicist">Current Publicist (Optional)</Label>
                          <Input
                            {...form.register("currentPublicist")}
                            placeholder="Enter your current publicist's name"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="representationStatus">Representation Status</Label>
                          <Select onValueChange={(value) => form.setValue("representationStatus", value)}>
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
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 8: Acting Role Preferences (only for actors) */}
              {currentStep === 8 && watchedRole === "talent" && watchedTalentType === 'actor' && (
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Role Preferences</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      Tell us about your role preferences and representation status
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderRoleSpecificQuestions()}
                  </CardContent>
                </Card>
              )}

              {/* Step 9 (or 8 for non-actors, or 6 for non-talent): Rates and Availability */}
              {((currentStep === 9 && watchedRole === "talent" && watchedTalentType === 'actor') || 
                (currentStep === 8 && watchedRole === "talent" && watchedTalentType !== 'actor') || 
                (currentStep === 6 && watchedRole !== "talent")) && (
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


                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: getMaxSteps() }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index + 1 <= currentStep
                          ? "bg-gradient-to-r from-blue-500 to-purple-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex space-x-3">
                  {/* Next Button */}
                  {currentStep < getMaxSteps() && (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Submit Button - Available at final step OR when basic info is complete */}
                  {(currentStep === getMaxSteps() || 
                    (watchedDisplayName && watchedBio && watchedLocation && watchedBio.length >= 10)) && (
                    <Button
                      type="submit"
                      disabled={createProfileMutation.isPending || !watchedDisplayName || !watchedBio || !watchedLocation || (watchedBio && (watchedBio as string).length < 10)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={async (e) => {
                        console.log("🔥 SUBMIT BUTTON CLICKED - Direct click handler");
                        console.log("Form errors:", form.formState.errors);
                        console.log("Form values:", form.getValues());
                        console.log("Auth status:", isAuthenticated, user?.username);
                        
                        // Check session before submission
                        try {
                          const response = await fetch('/api/user', { credentials: 'include' });
                          if (!response.ok) {
                            console.log("🚨 Session expired on submit");
                            toast({
                              title: "Session Expired",
                              description: "Your session expired. Please log in again.",
                              variant: "destructive",
                            });
                            localStorage.setItem('onboarding-form-data', JSON.stringify(form.getValues()));
                            setTimeout(() => window.location.href = "/auth", 1000);
                            return;
                          }
                          console.log("✅ Session valid - proceeding with submit");
                        } catch (error) {
                          console.log("🚨 Auth check failed:", error);
                          return;
                        }
                        
                        // Force form submission if validation passes
                        const formData = form.getValues();
                        const hasErrors = Object.keys(form.formState.errors).length > 0;
                        console.log("Has form errors:", hasErrors);
                        
                        if (!hasErrors && watchedDisplayName && watchedBio && watchedLocation && watchedBio.length >= 10) {
                          console.log("🚀 FORCING FORM SUBMISSION");
                          form.handleSubmit(onSubmit)();
                        } else {
                          console.log("❌ Form validation failed - cannot submit");
                          console.log("Missing fields:", {
                            displayName: !watchedDisplayName,
                            bio: !watchedBio,
                            location: !watchedLocation,
                            bioLength: watchedBio?.length
                          });
                        }
                      }}
                    >
                      <span>
                        {createProfileMutation.isPending ? "Creating Profile..." : 
                          currentStep === getMaxSteps() ? "Complete Setup" : "Save & Complete"}
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
