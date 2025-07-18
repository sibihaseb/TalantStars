import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit3, Trash2, Star, Crown, Shield, Zap, Trophy, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TalentCategory {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedTalent {
  id: number;
  userId: number;
  categoryId?: number;
  featuredReason?: string;
  displayOrder: number;
  isActive: boolean;
  featuredUntil?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    type: string;
    bio?: string;
    location?: string;
    profileImageUrl?: string;
    isVerified?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  category?: TalentCategory;
}

const IconMap = {
  crown: Crown,
  shield: Shield,
  zap: Zap,
  trophy: Trophy,
  sparkles: Sparkles,
  star: Star,
};

const ColorMap = {
  gold: 'bg-yellow-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
};

export default function TalentCategoriesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TalentCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TalentCategory[]>({
    queryKey: ['/api/admin/talent-categories'],
  });

  const { data: featuredTalents = [], isLoading: talentsLoading } = useQuery<FeaturedTalent[]>({
    queryKey: ['/api/admin/featured-talents'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: Omit<TalentCategory, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiRequest('/api/admin/talent-categories', 'POST', categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/talent-categories'] });
      setIsCreateModalOpen(false);
      toast({
        title: 'Success',
        description: 'Talent category created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create talent category',
        variant: 'destructive',
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...categoryData }: Partial<TalentCategory> & { id: number }) =>
      apiRequest(`/api/admin/talent-categories/${id}`, 'PUT', categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/talent-categories'] });
      setEditingCategory(null);
      toast({
        title: 'Success',
        description: 'Talent category updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update talent category',
        variant: 'destructive',
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/talent-categories/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/talent-categories'] });
      toast({
        title: 'Success',
        description: 'Talent category deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete talent category',
        variant: 'destructive',
      });
    },
  });

  const handleCreateCategory = (formData: FormData) => {
    const categoryData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      isActive: formData.get('isActive') === 'on',
    };
    createCategoryMutation.mutate(categoryData);
  };

  const handleUpdateCategory = (formData: FormData) => {
    if (!editingCategory) return;
    
    const categoryData = {
      id: editingCategory.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      isActive: formData.get('isActive') === 'on',
    };
    updateCategoryMutation.mutate(categoryData);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = showInactive || category.isActive;
    return matchesSearch && matchesStatus;
  });

  const getCategoryFeaturedCount = (categoryId: number) => {
    return featuredTalents.filter(talent => talent.categoryId === categoryId && talent.isActive).length;
  };

  const renderCategoryIcon = (icon: string, color: string) => {
    const IconComponent = IconMap[icon as keyof typeof IconMap] || Star;
    const colorClass = ColorMap[color as keyof typeof ColorMap] || 'bg-gray-500';
    return (
      <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>
    );
  };

  const CategoryForm = ({ category, onSubmit }: { category?: TalentCategory; onSubmit: (formData: FormData) => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter category name"
            defaultValue={category?.name || ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter category description"
            defaultValue={category?.description || ''}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select name="icon" defaultValue={category?.icon || 'star'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crown">👑 Crown</SelectItem>
                <SelectItem value="shield">🛡️ Shield</SelectItem>
                <SelectItem value="zap">⚡ Zap</SelectItem>
                <SelectItem value="trophy">🏆 Trophy</SelectItem>
                <SelectItem value="sparkles">✨ Sparkles</SelectItem>
                <SelectItem value="star">⭐ Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select name="color" defaultValue={category?.color || 'blue'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">🟡 Gold</SelectItem>
                <SelectItem value="purple">🟣 Purple</SelectItem>
                <SelectItem value="blue">🔵 Blue</SelectItem>
                <SelectItem value="orange">🟠 Orange</SelectItem>
                <SelectItem value="green">🟢 Green</SelectItem>
                <SelectItem value="red">🔴 Red</SelectItem>
                <SelectItem value="gray">⚫ Gray</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={category?.isActive !== false}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateModalOpen(false);
            setEditingCategory(null);
          }}>
            Cancel
          </Button>
          <Button type="submit">
            {category ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </form>
    );
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Talent Categories</h2>
          <p className="text-gray-600">Manage talent categories for featured talent organization</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Talent Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSubmit={handleCreateCategory} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="showInactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="showInactive">Show Inactive</Label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {renderCategoryIcon(category.icon, category.color)}
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                {category.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Featured talents:</span>
                <span className="font-medium">{getCategoryFeaturedCount(category.id)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No talent categories found</p>
        </div>
      )}

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Talent Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm category={editingCategory} onSubmit={handleUpdateCategory} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}