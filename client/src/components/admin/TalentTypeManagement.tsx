import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Users,
  CheckCircle,
  XCircle,
  Theater,
  Music,
  Camera,
  Mic,
  PenTool,
  Video,
  Clapperboard
} from 'lucide-react';

interface TalentType {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  questionCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

const ICON_OPTIONS = [
  { value: 'theater', label: 'Theater', icon: Theater },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'camera', label: 'Camera', icon: Camera },
  { value: 'mic', label: 'Microphone', icon: Mic },
  { value: 'pen-tool', label: 'Pen Tool', icon: PenTool },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'clapperboard', label: 'Clapperboard', icon: Clapperboard },
  { value: 'users', label: 'Users', icon: Users }
];

const getIconComponent = (iconName: string) => {
  const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
  return iconOption ? iconOption.icon : Users;
};

export default function TalentTypeManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingType, setEditingType] = useState<TalentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'users',
    isActive: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: talentTypes = [], isLoading } = useQuery<TalentType[]>({
    queryKey: ['/api/admin/talent-types'],
  });

  const createTalentTypeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/talent-types', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/talent-types'] });
      toast({
        title: "Success",
        description: "Talent type created successfully",
      });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create talent type",
        variant: "destructive",
      });
    }
  });

  const updateTalentTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/admin/talent-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/talent-types'] });
      toast({
        title: "Success",
        description: "Talent type updated successfully",
      });
      setEditingType(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update talent type",
        variant: "destructive",
      });
    }
  });

  const deleteTalentTypeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/talent-types/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/talent-types'] });
      toast({
        title: "Success",
        description: "Talent type deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete talent type",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'users',
      isActive: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType) {
      updateTalentTypeMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createTalentTypeMutation.mutate(formData);
    }
  };

  const handleEdit = (talentType: TalentType) => {
    setEditingType(talentType);
    setFormData({
      name: talentType.name,
      slug: talentType.slug,
      description: talentType.description,
      icon: talentType.icon,
      isActive: talentType.isActive
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Talent Types Management
          </span>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Talent Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingType ? "Edit Talent Type" : "Create New Talent Type"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Writer, Director"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (Auto-generated)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g., writer, director"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this talent type"
                  />
                </div>
                
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {ICON_OPTIONS.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            formData.icon === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-xs">{option.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isActive">Active (visible to users)</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setEditingType(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTalentTypeMutation.isPending || updateTalentTypeMutation.isPending}
                  >
                    {createTalentTypeMutation.isPending || updateTalentTypeMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingType ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {talentTypes.map((talentType) => {
            const IconComponent = getIconComponent(talentType.icon);
            return (
              <Card key={talentType.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{talentType.name}</h3>
                        <p className="text-sm text-gray-500">{talentType.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {talentType.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{talentType.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {talentType.questionCount} Questions
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {talentType.userCount} Users
                      </Badge>
                    </div>
                    <Badge variant={talentType.isActive ? "default" : "secondary"}>
                      {talentType.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        handleEdit(talentType);
                        setIsCreating(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${talentType.name}"? This action cannot be undone.`)) {
                          deleteTalentTypeMutation.mutate(talentType.id);
                        }
                      }}
                      disabled={deleteTalentTypeMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}