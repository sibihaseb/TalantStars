import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Briefcase, 
  Calendar, 
  MapPin,
  Building,
  Star,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';

interface WorkExperience {
  id: number;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
  role: string;
  status: 'current' | 'completed';
}

interface Skill {
  id: number;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsExperience?: number;
  verified: boolean;
  category: string;
}

export function WorkExperienceManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [activeTab, setActiveTab] = useState("experience");

  // Fetch work experience
  const { data: workExperience = [], isLoading: isLoadingExperience } = useQuery<WorkExperience[]>({
    queryKey: ['/api/job-history'],
    queryFn: async () => {
      const response = await fetch('/api/job-history', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch work experience');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch skills
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery<Skill[]>({
    queryKey: ['/api/skills'],
    queryFn: async () => {
      const response = await fetch('/api/skills', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch skills');
      return response.json();
    },
    enabled: !!user,
  });

  // Add work experience mutation
  const addExperienceMutation = useMutation({
    mutationFn: async (data: Partial<WorkExperience>) => {
      return apiRequest('POST', '/api/job-history', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-history'] });
      setIsAddingExperience(false);
      toast({
        title: "Experience Added",
        description: "Your work experience has been added successfully.",
      });
    },
  });

  // Update work experience mutation
  const updateExperienceMutation = useMutation({
    mutationFn: async (data: Partial<WorkExperience>) => {
      return apiRequest('PUT', `/api/job-history/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-history'] });
      setEditingExperience(null);
      toast({
        title: "Experience Updated",
        description: "Your work experience has been updated successfully.",
      });
    },
  });

  // Delete work experience mutation
  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/job-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-history'] });
      toast({
        title: "Experience Deleted",
        description: "Your work experience has been deleted.",
      });
    },
  });

  const handleSubmitExperience = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      title: formData.get('title') as string,
      company: formData.get('company') as string,
      location: formData.get('location') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || undefined,
      description: formData.get('description') as string,
      role: formData.get('role') as string,
      status: (formData.get('endDate') ? 'completed' : 'current') as 'current' | 'completed',
    };

    if (editingExperience) {
      updateExperienceMutation.mutate({ ...data, id: editingExperience.id });
    } else {
      addExperienceMutation.mutate(data);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'actor':
        return <Star className="w-4 h-4 text-purple-500" />;
      case 'musician':
        return <Award className="w-4 h-4 text-blue-500" />;
      default:
        return <Briefcase className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Advanced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Experience & Skills</h2>
          <p className="text-gray-600">Manage your professional experience and skillset</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Work Experience
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Skills & Expertise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experience" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <p className="text-gray-600">Your professional work history and achievements</p>
            </div>
            <Dialog open={isAddingExperience} onOpenChange={setIsAddingExperience}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Experience
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Work Experience</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitExperience} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        placeholder="e.g. Lead Actor" 
                        defaultValue={editingExperience?.title || ""}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Production</Label>
                      <Input 
                        id="company" 
                        name="company" 
                        placeholder="e.g. Netflix, HBO" 
                        defaultValue={editingExperience?.company || ""}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="role">Role Category</Label>
                      <Select name="role" defaultValue={editingExperience?.role || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actor">Actor</SelectItem>
                          <SelectItem value="musician">Musician</SelectItem>
                          <SelectItem value="voice_artist">Voice Artist</SelectItem>
                          <SelectItem value="model">Model</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                          <SelectItem value="writer">Writer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate" 
                        name="startDate" 
                        type="date" 
                        defaultValue={editingExperience?.startDate || ""}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input 
                        id="endDate" 
                        name="endDate" 
                        type="date" 
                        defaultValue={editingExperience?.endDate || ""}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      placeholder="e.g. Los Angeles, CA" 
                      defaultValue={editingExperience?.location || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Describe your role and responsibilities..."
                      rows={4}
                      defaultValue={editingExperience?.description || ""}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddingExperience(false);
                      setEditingExperience(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingExperience ? "Update" : "Add"} Experience
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingExperience ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : workExperience.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No work experience yet</h3>
                <p className="text-gray-500 mb-4">Start building your professional portfolio by adding your work experience.</p>
                <Button onClick={() => setIsAddingExperience(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Experience
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workExperience.map((experience) => (
                <Card key={experience.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getRoleIcon(experience.role)}
                        <div>
                          <CardTitle className="text-lg">{experience.title}</CardTitle>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="w-4 h-4" />
                            <span>{experience.company}</span>
                            {experience.location && (
                              <>
                                <span>•</span>
                                <MapPin className="w-4 h-4" />
                                <span>{experience.location}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(experience.startDate), "MMM yyyy")} - 
                              {experience.endDate ? format(new Date(experience.endDate), "MMM yyyy") : "Present"}
                            </span>
                            {experience.status === 'current' && (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingExperience(experience);
                            setIsAddingExperience(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this experience?")) {
                              deleteExperienceMutation.mutate(experience.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {experience.description && (
                    <CardContent className="pt-0">
                      <p className="text-gray-700">{experience.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Skills & Expertise</h3>
            <p className="text-gray-600">Your professional skills and expertise levels</p>
          </div>

          {isLoadingSkills ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : skills.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No skills listed yet</h3>
                <p className="text-gray-500 mb-4">Your skills will be populated from your profile questionnaire responses.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {category.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySkills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.name}</span>
                            {skill.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <Badge className={getSkillLevelColor(skill.level)}>
                            {skill.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}