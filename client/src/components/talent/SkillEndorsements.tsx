import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Plus, X, Zap, Users, Camera, Music, Mic, Theater, Car, Waves, Sword, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Comprehensive skill categories with extensive options
const SKILL_CATEGORIES = {
  stunts: {
    icon: Car,
    title: "Stunts & Action",
    skills: [
      "Stunt Driving", "Horseback Riding", "Motorcycle Riding", "Fight Choreography", 
      "Wire Work", "Fire Stunts", "Car Stunts", "Precision Driving", "Stage Combat",
      "Sword Fighting", "Aerial Work", "High Falls", "Parkour", "Rappelling"
    ]
  },
  physical: {
    icon: Dumbbell,
    title: "Physical & Athletics",
    skills: [
      "Swimming", "Karate", "Gymnastics", "Boxing", "Wrestling", "Martial Arts",
      "Rock Climbing", "Skiing", "Surfing", "Skateboarding", "Cycling", "Running",
      "Weight Lifting", "Yoga", "Pilates", "Dance", "Ballet", "Tap Dance",
      "Hip Hop", "Contemporary Dance", "Ballroom Dancing", "Acrobatics"
    ]
  },
  performing: {
    icon: Theater,
    title: "Performing Arts",
    skills: [
      "Acting", "Voice Acting", "Singing", "Musical Theater", "Opera", "Stand-up Comedy",
      "Improv", "Mime", "Puppetry", "Storytelling", "Public Speaking", "Stage Presence",
      "Character Development", "Method Acting", "Meisner Technique", "Shakespeare",
      "Period Acting", "Accent Work", "Dialects", "Cold Reading"
    ]
  },
  music: {
    icon: Music,
    title: "Musical Skills",
    skills: [
      "Piano", "Guitar", "Violin", "Drums", "Bass", "Saxophone", "Trumpet", "Flute",
      "Cello", "Clarinet", "Harmonica", "Banjo", "Ukulele", "Harp", "Accordion",
      "Music Composition", "Music Production", "Sound Engineering", "DJ", "Beat Boxing"
    ]
  },
  technical: {
    icon: Camera,
    title: "Technical & Media",
    skills: [
      "Photography", "Videography", "Film Editing", "Sound Recording", "Lighting",
      "Camera Operation", "Directing", "Producing", "Screenwriting", "Script Supervision",
      "Makeup Artistry", "Costume Design", "Set Design", "Props", "Special Effects",
      "3D Animation", "Motion Graphics", "Video Editing", "Color Grading"
    ]
  },
  voice: {
    icon: Mic,
    title: "Voice & Communication",
    skills: [
      "Voice Over", "Radio", "Podcasting", "Narration", "Commercial Voice",
      "Cartoon Voice", "Video Game Voice", "Audiobook Narration", "E-Learning Voice",
      "Phone System Voice", "Accent Coaching", "Speech Therapy", "Presentation Skills",
      "Broadcasting", "News Reporting", "Interviewing"
    ]
  },
  specialty: {
    icon: Zap,
    title: "Special Skills",
    skills: [
      "Magic", "Juggling", "Fire Breathing", "Contortion", "Tightrope Walking",
      "Clowning", "Animal Training", "Falconry", "Archery", "Knife Throwing",
      "Lockpicking", "Escape Artistry", "Balloon Artistry", "Face Painting",
      "Caricature Drawing", "Speed Reading", "Memory Techniques", "Hypnosis"
    ]
  },
  languages: {
    icon: Users,
    title: "Languages & Dialects",
    skills: [
      "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Mandarin",
      "Japanese", "Korean", "Arabic", "Hebrew", "Hindi", "Thai", "Vietnamese",
      "Dutch", "Swedish", "Norwegian", "Polish", "Greek", "Turkish", "ASL",
      "British Accent", "Southern Accent", "New York Accent", "Boston Accent"
    ]
  }
};

interface SkillEndorsementsProps {
  profile?: {
    id?: number;
    skills?: string[];
    talentType?: string;
  };
}

export function SkillEndorsements({ profile }: SkillEndorsementsProps) {
  // Safety check for profile data
  if (!profile || !profile.id) {
    console.log("SkillEndorsements: No profile data available");
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Profile data is loading...</p>
        </CardContent>
      </Card>
    );
  }

  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills || []);
  const [customSkill, setCustomSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update skills when profile changes
  useEffect(() => {
    if (profile?.skills) {
      setSelectedSkills(profile.skills);
    }
  }, [profile?.skills]);

  // Save skills mutation with proper error handling
  const saveSkillsMutation = useMutation({
    mutationFn: async (skills: string[]) => {
      console.log("🎯 SKILLS: Starting save mutation", { skills, profileId: profile?.id });
      setIsSubmitting(true);
      
      if (!profile?.id) {
        throw new Error("Profile ID is required");
      }
      
      try {
        const response = await apiRequest("PUT", `/api/user/skills`, { skills });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to save skills: ${response.status} ${errorData}`);
        }
        
        const result = await response.json();
        console.log("🎯 SKILLS: Save successful", { result });
        return result;
      } catch (error) {
        console.error("🎯 SKILLS: Save error", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("🎯 SKILLS: Mutation success", { data });
      setIsSubmitting(false);
      
      // Invalidate profile queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Skills Updated",
        description: "Your skills have been saved successfully!",
      });
    },
    onError: (error) => {
      console.error("🎯 SKILLS: Mutation error", error);
      setIsSubmitting(false);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.log("Final skills error message:", errorMessage);
      
      toast({
        title: "Failed to Save Skills",
        description: `Error: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      console.log("🎯 SKILLS: Added skill", { skill, newSkills });
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(newSkills);
    console.log("🎯 SKILLS: Removed skill", { skill, newSkills });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      const newSkills = [...selectedSkills, customSkill.trim()];
      setSelectedSkills(newSkills);
      setCustomSkill("");
      console.log("🎯 SKILLS: Added custom skill", { skill: customSkill.trim(), newSkills });
    }
  };

  const handleSaveSkills = () => {
    console.log("🎯 SKILLS: Save button clicked", { selectedSkills, profileId: profile?.id });
    if (selectedSkills.length === 0) {
      toast({
        title: "No Skills Selected",
        description: "Please select at least one skill to save.",
        variant: "destructive",
      });
      return;
    }
    saveSkillsMutation.mutate(selectedSkills);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Skills
        </CardTitle>
        <p className="text-sm text-gray-500">
          Select skills from categories below or add your own custom skills
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Skills Display */}
        {selectedSkills.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Your Selected Skills ({selectedSkills.length})</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSkills.map((skill) => (
                <Badge key={skill} variant="default" className="flex items-center gap-1 px-3 py-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Skill Input */}
        <div className="space-y-2">
          <h4 className="font-medium">Add Custom Skill</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a skill not listed below..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
              className="flex-1"
            />
            <Button 
              onClick={addCustomSkill} 
              disabled={!customSkill.trim()}
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Skill Categories */}
        <div>
          <h4 className="font-medium mb-3">Browse Skills by Category</h4>
          <Tabs defaultValue="performing" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              {Object.entries(SKILL_CATEGORIES).map(([key, category]) => {
                const IconComponent = category.icon;
                return (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    <IconComponent className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{category.title.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {category.title}
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {category.skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <Button
                          key={skill}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`justify-start text-left h-auto py-2 ${
                            isSelected 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted"
                          }`}
                          onClick={() => isSelected ? removeSkill(skill) : addSkill(skill)}
                        >
                          <span className="truncate">{skill}</span>
                          {isSelected && <CheckCircle2 className="h-3 w-3 ml-auto flex-shrink-0" />}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSaveSkills}
            disabled={isSubmitting || selectedSkills.length === 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Saving..." : "Save Skills"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}