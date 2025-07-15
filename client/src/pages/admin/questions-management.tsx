import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Settings,
  FileText,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ProfileQuestion {
  id: number;
  talent_type: string;
  question: string;
  field_name: string;
  field_type: string;
  options?: string[];
  required: boolean;
  order: number;
  active: boolean;
}

const TALENT_TYPES = [
  { value: 'actor', label: 'Actor' },
  { value: 'musician', label: 'Musician' },
  { value: 'voice_artist', label: 'Voice Artist' },
  { value: 'model', label: 'Model' },
  { value: 'manager', label: 'Manager' },
  { value: 'agent', label: 'Agent' },
  { value: 'producer', label: 'Producer' },
  { value: 'profile', label: 'Personal Questions' }
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Select Dropdown' },
  { value: 'checkbox', label: 'Multiple Choice' },
  { value: 'number', label: 'Number' }
];

export default function QuestionsManagement() {
  const [selectedTalentType, setSelectedTalentType] = useState<string>('actor');
  const [editingQuestion, setEditingQuestion] = useState<ProfileQuestion | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    talent_type: '',
    question: '',
    field_name: '',
    field_type: 'text',
    options: [] as string[],
    required: true,
    order: 1,
    active: true
  });
  const [newOption, setNewOption] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch questions by talent type
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['/api/admin/questions', selectedTalentType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/questions?talent_type=${selectedTalentType}`);
      return response.json();
    }
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const response = await apiRequest('POST', '/api/admin/questions', questionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      setShowAddForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Question created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      });
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/questions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      setEditingQuestion(null);
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/questions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      talent_type: selectedTalentType,
      question: '',
      field_name: '',
      field_type: 'text',
      options: [],
      required: true,
      order: 1,
      active: true
    });
    setNewOption('');
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data: formData });
    } else {
      createQuestionMutation.mutate(formData);
    }
  };

  const startEdit = (question: ProfileQuestion) => {
    setEditingQuestion(question);
    setFormData({
      talent_type: question.talent_type,
      question: question.question,
      field_name: question.field_name,
      field_type: question.field_type,
      options: question.options || [],
      required: question.required,
      order: question.order,
      active: question.active
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setShowAddForm(false);
    resetForm();
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage onboarding questions for all roles and talent types</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Talent Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Filter by Talent Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTalentType} onValueChange={setSelectedTalentType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select talent type" />
            </SelectTrigger>
            <SelectContent>
              {TALENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="talent_type">Talent Type</Label>
                  <Select 
                    value={formData.talent_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, talent_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select talent type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TALENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="field_type">Field Type</Label>
                  <Select 
                    value={formData.field_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, field_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question text..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="field_name">Field Name</Label>
                <Input
                  id="field_name"
                  value={formData.field_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, field_name: e.target.value }))}
                  placeholder="field_name_example"
                  required
                />
              </div>

              {/* Options for select and checkbox fields */}
              {(formData.field_type === 'select' || formData.field_type === 'checkbox') && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Add option..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      />
                      <Button type="button" onClick={handleAddOption}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.options.map((option, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {option}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="order">Order (Priority)</Label>
                  <Select 
                    value={formData.order.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, order: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - First (Highest Priority)</SelectItem>
                      <SelectItem value="2">2 - Second</SelectItem>
                      <SelectItem value="3">3 - Third</SelectItem>
                      <SelectItem value="4">4 - Fourth</SelectItem>
                      <SelectItem value="5">5 - Fifth</SelectItem>
                      <SelectItem value="6">6 - Sixth</SelectItem>
                      <SelectItem value="7">7 - Seventh</SelectItem>
                      <SelectItem value="8">8 - Eighth</SelectItem>
                      <SelectItem value="9">9 - Ninth</SelectItem>
                      <SelectItem value="10">10 - Tenth</SelectItem>
                      <SelectItem value="11">11 - Eleventh</SelectItem>
                      <SelectItem value="12">12 - Twelfth</SelectItem>
                      <SelectItem value="13">13 - Thirteenth</SelectItem>
                      <SelectItem value="14">14 - Fourteenth</SelectItem>
                      <SelectItem value="15">15 - Fifteenth</SelectItem>
                      <SelectItem value="16">16 - Sixteenth</SelectItem>
                      <SelectItem value="17">17 - Seventeenth</SelectItem>
                      <SelectItem value="18">18 - Eighteenth</SelectItem>
                      <SelectItem value="19">19 - Nineteenth</SelectItem>
                      <SelectItem value="20">20 - Twentieth</SelectItem>
                      <SelectItem value="21">21 - Twenty-first</SelectItem>
                      <SelectItem value="22">22 - Twenty-second</SelectItem>
                      <SelectItem value="23">23 - Twenty-third</SelectItem>
                      <SelectItem value="24">24 - Twenty-fourth</SelectItem>
                      <SelectItem value="25">25 - Twenty-fifth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: !!checked }))}
                  />
                  <Label htmlFor="required">Required</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: !!checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuestion ? 'Update' : 'Create'} Question
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Questions for {TALENT_TYPES.find(t => t.value === selectedTalentType)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions found for this talent type
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question: ProfileQuestion) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.field_type}</Badge>
                        <Badge variant={question.required ? "default" : "secondary"}>
                          {question.required ? "Required" : "Optional"}
                        </Badge>
                        <Badge variant={question.active ? "default" : "secondary"}>
                          {question.active ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {question.active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority: {question.order}</Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{question.question}</h3>
                      <p className="text-sm text-gray-500">Field: {question.field_name}</p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.options.map((option, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQuestionMutation.mutate(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}