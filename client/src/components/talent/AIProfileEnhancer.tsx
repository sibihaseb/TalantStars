import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Zap, Target, TrendingUp, Award, FileText, Lightbulb } from "lucide-react";

interface AIEnhancementResult {
  enhancedBio: string;
  suggestedSkills: string[];
  careerSuggestions: string[];
  profileOptimization: string[];
  industryTags: string[];
  resumeEnhancement: string;
  marketingPoints: string[];
}

export function AIProfileEnhancer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [enhancementResult, setEnhancementResult] = useState<AIEnhancementResult | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceProfileMutation = useMutation({
    mutationFn: async () => {
      setIsEnhancing(true);
      const response = await apiRequest("POST", "/api/profile/ai-enhance", {});
      if (!response.ok) throw new Error("Failed to enhance profile");
      return response.json();
    },
    onSuccess: (data) => {
      setEnhancementResult(data);
      setIsEnhancing(false);
      toast({ 
        title: "Profile Enhanced!", 
        description: "AI has analyzed your profile and provided suggestions for improvement." 
      });
    },
    onError: (error) => {
      setIsEnhancing(false);
      toast({ 
        title: "Enhancement Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const applyEnhancementMutation = useMutation({
    mutationFn: async (enhancedData: Partial<AIEnhancementResult>) => {
      const response = await apiRequest("PUT", "/api/profile", {
        bio: enhancedData.enhancedBio,
        resume: enhancedData.resumeEnhancement,
        skills: enhancedData.suggestedSkills,
      });
      if (!response.ok) throw new Error("Failed to apply enhancements");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ 
        title: "Enhancements Applied!", 
        description: "Your profile has been updated with AI suggestions." 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to Apply", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Profile Enhancer
        </CardTitle>
        <p className="text-sm text-gray-600">
          Let AI analyze your profile and provide personalized suggestions to improve your visibility and booking opportunities.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!enhancementResult ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-4">
                <Zap className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">Enhance Your Profile with AI</h3>
                <p className="text-gray-600 mb-4">
                  Get personalized suggestions for your bio, skills, resume, and career development based on industry best practices.
                </p>
                <Button 
                  onClick={() => enhanceProfileMutation.mutate()}
                  disabled={isEnhancing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {isEnhancing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enhance Profile
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">Bio Enhancement</h4>
                  <p className="text-sm text-gray-600">Professional, engaging bio</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium">Skills Optimization</h4>
                  <p className="text-sm text-gray-600">Relevant skills & tags</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-medium">Career Guidance</h4>
                  <p className="text-sm text-gray-600">Industry insights & tips</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Enhancement Results</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => applyEnhancementMutation.mutate(enhancementResult)}
                    disabled={applyEnhancementMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {applyEnhancementMutation.isPending ? "Applying..." : "Apply All"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => enhanceProfileMutation.mutate()}
                    disabled={isEnhancing}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>

              {/* Enhanced Bio */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Enhanced Bio
                </h4>
                <p className="text-gray-700 italic">"{enhancementResult.enhancedBio}"</p>
              </div>

              {/* Suggested Skills */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Suggested Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {enhancementResult.suggestedSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-green-100 text-green-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industry Tags */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  Industry Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {enhancementResult.industryTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-100 text-purple-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Career Suggestions */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                  Career Development Suggestions
                </h4>
                <ul className="space-y-2">
                  {enhancementResult.careerSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Profile Optimization */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Profile Optimization Tips
                </h4>
                <ul className="space-y-2">
                  {enhancementResult.profileOptimization.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Marketing Points */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-red-600" />
                  Key Marketing Points
                </h4>
                <ul className="space-y-2">
                  {enhancementResult.marketingPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}