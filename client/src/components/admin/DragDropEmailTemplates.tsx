import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  GripVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Mail,
  Send,
  Settings,
  Palette,
  Code,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  description: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SortableItemProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: number) => void;
  onPreview: (template: EmailTemplate) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  template,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  onToggleActive
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'notification': return 'bg-green-100 text-green-800';
      case 'transactional': return 'bg-purple-100 text-purple-800';
      case 'marketing': return 'bg-orange-100 text-orange-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'welcome': return <Mail className="w-3 h-3" />;
      case 'notification': return <Send className="w-3 h-3" />;
      case 'transactional': return <FileText className="w-3 h-3" />;
      case 'marketing': return <Palette className="w-3 h-3" />;
      case 'reminder': return <Settings className="w-3 h-3" />;
      case 'system': return <Code className="w-3 h-3" />;
      default: return <Mail className="w-3 h-3" />;
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`transition-all duration-200 ${
        isDragging ? 'shadow-lg' : 'hover:shadow-md'
      } ${!template.is_active ? 'opacity-60' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={`${getCategoryColor(template.category)} text-xs`}
                >
                  {getCategoryIcon(template.category)}
                  <span className="ml-1 capitalize">{template.category}</span>
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              <p className="text-sm font-medium text-gray-800">{template.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(template.id, !template.is_active)}
              className={template.is_active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
            >
              {template.is_active ? 'Active' : 'Inactive'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(template)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(template)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(template)}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(template.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-3">
          {template.variables?.map((variable, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {`{{${variable}}}`}
            </Badge>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          Updated: {new Date(template.updated_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

interface EmailTemplateFormProps {
  template?: EmailTemplate;
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({ 
  template, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    html_content: template?.html_content || '',
    text_content: template?.text_content || '',
    description: template?.description || '',
    category: template?.category || 'notification',
    variables: template?.variables?.join(', ') || '',
    is_active: template?.is_active ?? true
  });

  const categories = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'notification', label: 'Notification' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'system', label: 'System' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      variables: formData.variables.split(',').map(v => v.trim()).filter(v => v)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Subject Line</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this template"
        />
      </div>

      <div>
        <Label htmlFor="variables">Variables (comma-separated)</Label>
        <Input
          id="variables"
          value={formData.variables}
          onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
          placeholder="firstName, lastName, companyName"
        />
      </div>

      <div>
        <Label htmlFor="html_content">HTML Content</Label>
        <Textarea
          id="html_content"
          value={formData.html_content}
          onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
          rows={10}
          className="font-mono text-sm"
          required
        />
      </div>

      <div>
        <Label htmlFor="text_content">Text Content</Label>
        <Textarea
          id="text_content"
          value={formData.text_content}
          onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
          rows={8}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};

export default function DragDropEmailTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/admin/email-templates'],
    select: (data: EmailTemplate[]) => data.sort((a, b) => a.sort_order - b.sort_order)
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (templates: EmailTemplate[]) => {
      const updates = templates.map((template, index) => ({
        id: template.id,
        sort_order: index + 1
      }));
      return apiRequest('/api/admin/email-templates/reorder', 'POST', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: "Order updated",
        description: "Email templates have been reordered successfully."
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: (template: Partial<EmailTemplate>) => 
      apiRequest('/api/admin/email-templates', 'POST', template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Template created",
        description: "Email template has been created successfully."
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...template }: Partial<EmailTemplate> & { id: number }) => 
      apiRequest(`/api/admin/email-templates/${id}`, 'PUT', template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      toast({
        title: "Template updated",
        description: "Email template has been updated successfully."
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/email-templates/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: "Template deleted",
        description: "Email template has been deleted successfully."
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => 
      apiRequest(`/api/admin/email-templates/${id}`, 'PUT', { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: (template: EmailTemplate) => {
      const duplicateTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined
      };
      return apiRequest('/api/admin/email-templates', 'POST', duplicateTemplate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: "Template duplicated",
        description: "Email template has been duplicated successfully."
      });
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = templates.findIndex((item) => item.id === active.id);
      const newIndex = templates.findIndex((item) => item.id === over?.id);
      
      const newTemplates = arrayMove(templates, oldIndex, newIndex);
      updateOrderMutation.mutate(newTemplates);
    }
  };

  const handleCreate = (template: Partial<EmailTemplate>) => {
    createMutation.mutate(template);
  };

  const handleEdit = (template: Partial<EmailTemplate>) => {
    if (editingTemplate) {
      updateMutation.mutate({ ...template, id: editingTemplate.id });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    duplicateMutation.mutate(template);
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, is_active: isActive });
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-gray-600 mt-1">
            Manage and organize your email templates with drag-and-drop functionality
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Email Template</DialogTitle>
            </DialogHeader>
            <EmailTemplateForm
              onSave={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold">{templates.filter(t => t.is_active).length}</p>
              </div>
              <Settings className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{new Set(templates.map(t => t.category)).size}</p>
              </div>
              <Palette className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={templates} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {templates.map((template) => (
              <SortableItem
                key={template.id}
                template={template}
                onEdit={openEditDialog}
                onDelete={handleDelete}
                onPreview={handlePreview}
                onDuplicate={handleDuplicate}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {templates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Email Templates</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first email template
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <EmailTemplateForm
              template={editingTemplate}
              onSave={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingTemplate(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject:</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">{previewTemplate.subject}</p>
              </div>
              <div>
                <Label>HTML Preview:</Label>
                <div 
                  className="border rounded p-4 bg-white max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }}
                />
              </div>
              <div>
                <Label>Text Content:</Label>
                <pre className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {previewTemplate.text_content}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}