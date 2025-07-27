import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CategoryWithQuestions, QuestionnaireCategory, QuestionnaireQuestion } from '@shared/schema';
import { Plus, Edit, Trash, Save, X, Settings } from 'lucide-react';

export function AdminQuestionnaireManager() {
  const [selectedCategory, setSelectedCategory] = useState<QuestionnaireCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionnaireQuestion | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories with questions
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/questionnaire/categories'],
    queryFn: () => apiRequest('GET', '/api/questionnaire/categories'),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/questionnaire/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/categories'] });
      setShowAddCategory(false);
      toast({ title: "Category created successfully" });
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/admin/questionnaire/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/categories'] });
      setEditingCategory(false);
      toast({ title: "Category updated successfully" });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/questionnaire/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/categories'] });
      setSelectedCategory(null);
      toast({ title: "Category deleted successfully" });
    }
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/questionnaire/questions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/categories'] });
      setShowAddQuestion(false);
      toast({ title: "Question created successfully" });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/admin/questionnaire/questions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/categories'] });
      setEditingQuestion(null);
      toast({ title: "Question updated successfully" });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/questionnaire/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/categories'] });
      toast({ title: "Question deleted successfully" });
    }
  });

  const handleCategorySubmit = (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      targetRoles: (formData.get('targetRoles') as string)?.split(',').map(r => r.trim()).filter(Boolean) || [],
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      isActive: formData.get('isActive') === 'on'
    };

    if (editingCategory && selectedCategory) {
      updateCategoryMutation.mutate({ id: selectedCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleQuestionSubmit = (formData: FormData) => {
    const optionsText = formData.get('options') as string;
    let options = [];
    
    if (optionsText.trim()) {
      try {
        options = JSON.parse(optionsText);
      } catch {
        // Fallback: split by lines and create simple options
        options = optionsText.split('\n').filter(Boolean).map(line => ({
          value: line.trim().toLowerCase().replace(/\s+/g, '_'),
          label: line.trim()
        }));
      }
    }

    const data = {
      categoryId: selectedCategory?.id,
      question: formData.get('question') as string,
      slug: formData.get('slug') as string,
      questionType: formData.get('questionType') as string,
      options,
      isRequired: formData.get('isRequired') === 'on',
      isActive: formData.get('isActive') === 'on',
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      helpText: formData.get('helpText') as string
    };

    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Questionnaire Management</h2>
          <p className="text-gray-600">Manage questionnaire categories and questions</p>
        </div>
        <Button onClick={() => setShowAddCategory(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Categories</h3>
          {Array.isArray(categories) && categories.map((category: CategoryWithQuestions) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-colors ${
                selectedCategory?.id === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {category.description && (
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600">
                  {category.questions.length} questions
                </div>
                {category.targetRoles && category.targetRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {category.targetRoles.map(role => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Details */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedCategory.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCategory(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddQuestion(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCategoryMutation.mutate(selectedCategory.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {Array.isArray(selectedCategory.questions) && selectedCategory.questions.map((question: any) => (
                  <Card key={question.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{question.question}</h4>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{question.questionType}</Badge>
                            {question.isRequired && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                            <Badge variant={question.isActive ? 'default' : 'secondary'}>
                              {question.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {question.helpText && (
                            <p className="text-sm text-gray-600 mt-2">{question.helpText}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteQuestionMutation.mutate(question.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Select a category to view and manage questions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {(showAddCategory || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCategorySubmit(new FormData(e.target as HTMLFormElement));
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCategory ? selectedCategory?.name : ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editingCategory ? selectedCategory?.slug : ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingCategory ? selectedCategory?.description || '' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="targetRoles">Target Roles (comma-separated)</Label>
                  <Input
                    id="targetRoles"
                    name="targetRoles"
                    defaultValue={editingCategory ? selectedCategory?.targetRoles?.join(', ') : ''}
                    placeholder="talent, manager, producer"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    defaultValue={editingCategory ? selectedCategory?.sortOrder || 0 : 0}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    name="isActive"
                    defaultChecked={editingCategory ? selectedCategory?.isActive || false : true}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddCategory(false);
                      setEditingCategory(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {(showAddQuestion || editingQuestion) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuestionSubmit(new FormData(e.target as HTMLFormElement));
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    name="question"
                    defaultValue={editingQuestion?.question || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editingQuestion?.slug || ''}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select name="questionType" defaultValue={editingQuestion?.questionType || 'text'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="multiselect">Multi-select</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="options">Options (JSON format or line-separated)</Label>
                  <Textarea
                    id="options"
                    name="options"
                    defaultValue={editingQuestion?.options ? JSON.stringify(editingQuestion.options, null, 2) : ''}
                    placeholder='[{"value": "option1", "label": "Option 1"}] or line-separated list'
                  />
                </div>
                <div>
                  <Label htmlFor="helpText">Help Text</Label>
                  <Textarea
                    id="helpText"
                    name="helpText"
                    defaultValue={editingQuestion?.helpText || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    defaultValue={editingQuestion?.sortOrder || 0}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isRequired"
                      name="isRequired"
                      defaultChecked={editingQuestion?.isRequired || false}
                    />
                    <Label htmlFor="isRequired">Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      name="isActive"
                      defaultChecked={editingQuestion?.isActive ?? true}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddQuestion(false);
                      setEditingQuestion(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}