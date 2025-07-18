import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  XCircle,
  GripVertical,
  ArrowUpDown
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
  { value: 'writer', label: 'Writer' },
  { value: 'director', label: 'Director' },
  { value: 'cinematographer', label: 'Cinematographer' },
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

interface SortableQuestionCardProps {
  question: ProfileQuestion;
  onEdit: (question: ProfileQuestion) => void;
  onDelete: (questionId: number) => void;
  isDragging?: boolean;
}

interface SortableQuestionCardProps {
  question: ProfileQuestion;
  onEdit: (question: ProfileQuestion) => void;
  onDelete: (questionId: number) => void;
  isDragging?: boolean;
  isEditing?: boolean;
  editingData?: any;
  onSaveEdit?: (questionId: number, data: any) => void;
  onCancelEdit?: () => void;
  onUpdateEditData?: (data: any) => void;
}

const SortableQuestionCard = ({ 
  question, 
  onEdit, 
  onDelete, 
  isDragging, 
  isEditing, 
  editingData, 
  onSaveEdit, 
  onCancelEdit, 
  onUpdateEditData 
}: SortableQuestionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.3 : 1,
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group relative bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500 shadow-lg"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              Editing Question #{question.order}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Question Text</Label>
              <Textarea
                id="edit-question"
                value={editingData?.question || ''}
                onChange={(e) => onUpdateEditData?.({ ...editingData, question: e.target.value })}
                placeholder="Enter the question text..."
                className="min-h-[80px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-field-name">Field Name</Label>
                <Input
                  id="edit-field-name"
                  value={editingData?.field_name || ''}
                  onChange={(e) => onUpdateEditData?.({ ...editingData, field_name: e.target.value })}
                  placeholder="Enter field name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-field-type">Field Type</Label>
                <Select 
                  value={editingData?.field_type || 'text'} 
                  onValueChange={(value) => onUpdateEditData?.({ ...editingData, field_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-required"
                  checked={editingData?.required || false}
                  onCheckedChange={(checked) => onUpdateEditData?.({ ...editingData, required: checked })}
                />
                <Label htmlFor="edit-required">Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={editingData?.active || false}
                  onCheckedChange={(checked) => onUpdateEditData?.({ ...editingData, active: checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button 
                onClick={() => onSaveEdit?.(question.id, editingData)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-lg border-2 
        ${isSortableDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200 dark:border-gray-700'}
        hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  #{question.order}
                </span>
                <Badge variant={question.active ? 'default' : 'secondary'}>
                  {question.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {question.field_type}
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {question.question}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Field: {question.field_name}
              </p>
              {question.options && question.options.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.options.slice(0, 3).map((option, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {option}
                    </Badge>
                  ))}
                  {question.options.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{question.options.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(question)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DragOverlayContent = ({ question }: { question: ProfileQuestion }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 shadow-xl p-4 opacity-90">
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        #{question.order}
      </span>
      <Badge variant={question.active ? 'default' : 'secondary'}>
        {question.active ? 'Active' : 'Inactive'}
      </Badge>
    </div>
    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
      {question.question}
    </h3>
  </div>
);

export default function DragDropQuestionsManager() {
  const [selectedTalentType, setSelectedTalentType] = useState<string>('actor');
  const [editingQuestion, setEditingQuestion] = useState<ProfileQuestion | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
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
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [inlineEditData, setInlineEditData] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sensor configuration for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch questions by talent type
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['/api/admin/questions', selectedTalentType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/questions?talent_type=${selectedTalentType}`);
      return response.json();
    }
  });

  // Sorted questions for display
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.order - b.order);
  }, [questions]);

  // Reorder questions mutation
  const reorderMutation = useMutation({
    mutationFn: async (questionsData: { id: number; order: number }[]) => {
      const response = await apiRequest('POST', '/api/admin/questions/reorder', {
        questions: questionsData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: "Questions reordered successfully",
        description: "The question order has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error reordering questions",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedQuestions.findIndex(q => q.id === active.id);
      const newIndex = sortedQuestions.findIndex(q => q.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(sortedQuestions, oldIndex, newIndex);
        
        // Update order values
        const reorderedQuestions = newQuestions.map((question, index) => ({
          id: question.id,
          order: index + 1
        }));
        
        reorderMutation.mutate(reorderedQuestions);
      }
    }
    
    setActiveId(null);
  };

  // Create/update question mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const response = await apiRequest('POST', '/api/admin/questions', questionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: "Question created successfully",
        description: "The new question has been added."
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error creating question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, ...questionData }: any) => {
      const response = await apiRequest('PUT', `/api/admin/questions/${id}`, questionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: "Question updated successfully",
        description: "The question has been updated."
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error updating question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/questions/${questionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: "Question deleted successfully",
        description: "The question has been removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting question",
        description: error.message,
        variant: "destructive"
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
      order: questions.length + 1,
      active: true
    });
    setNewOption('');
    setEditingQuestion(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingQuestion) {
      updateQuestionMutation.mutate({
        id: editingQuestion.id,
        ...formData
      });
    } else {
      createQuestionMutation.mutate(formData);
    }
  };

  const startEdit = (question: ProfileQuestion) => {
    setInlineEditingId(question.id);
    setInlineEditData({
      talent_type: question.talent_type,
      question: question.question,
      field_name: question.field_name,
      field_type: question.field_type,
      options: question.options || [],
      required: question.required,
      order: question.order,
      active: question.active
    });
  };

  const handleInlineEdit = (questionId: number, data: any) => {
    updateQuestionMutation.mutate({
      id: questionId,
      ...data
    });
    setInlineEditingId(null);
    setInlineEditData(null);
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineEditData(null);
  };

  const handleDelete = (questionId: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const draggedQuestion = sortedQuestions.find(q => q.id === activeId);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Questions Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Drag and drop to reorder questions for all roles and talent types
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Talent Type Filter */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Talent Type
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {TALENT_TYPES.map(type => (
              <Button
                key={type.value}
                variant={selectedTalentType === type.value ? "default" : "outline"}
                onClick={() => setSelectedTalentType(type.value)}
                className="h-12"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Question Form */}
      {showAddForm && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="talent_type">Talent Type</Label>
                  <Select value={formData.talent_type} onValueChange={(value) => setFormData(prev => ({ ...prev, talent_type: value }))}>
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
                  <Select value={formData.field_type} onValueChange={(value) => setFormData(prev => ({ ...prev, field_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field type" />
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
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question text..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="field_name">Field Name</Label>
                <Input
                  id="field_name"
                  value={formData.field_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, field_name: e.target.value }))}
                  placeholder="Enter field name (e.g., acting_experience)"
                  required
                />
              </div>

              {(formData.field_type === 'select' || formData.field_type === 'checkbox') && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Enter option"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <Button type="button" onClick={addOption} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.options.map((option, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {option}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="h-4 w-4 p-0 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked as boolean }))}
                  />
                  <Label htmlFor="required">Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked as boolean }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List with Drag & Drop */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              Questions for {TALENT_TYPES.find(t => t.value === selectedTalentType)?.label}
            </span>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {sortedQuestions.length} questions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading questions...</p>
            </div>
          ) : sortedQuestions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No questions found for this talent type.</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {sortedQuestions.map((question) => (
                    <SortableQuestionCard
                      key={question.id}
                      question={question}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      isDragging={activeId === question.id}
                      isEditing={inlineEditingId === question.id}
                      editingData={inlineEditingId === question.id ? inlineEditData : null}
                      onSaveEdit={handleInlineEdit}
                      onCancelEdit={cancelInlineEdit}
                      onUpdateEditData={setInlineEditData}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {draggedQuestion && <DragOverlayContent question={draggedQuestion} />}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}