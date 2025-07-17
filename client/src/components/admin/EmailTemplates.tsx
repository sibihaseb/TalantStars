import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Save, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { apiRequest } from '@/lib/queryClient';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

interface EmailTemplateFormData {
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  description?: string;
}

const defaultTemplates = [
  {
    name: 'welcome_talent',
    subject: 'Welcome to Talents & Stars!',
    description: 'Welcome email for new talent members',
    variables: ['firstName', 'platformUrl']
  },
  {
    name: 'welcome_manager',
    subject: 'Welcome to Talent Management!',
    description: 'Welcome email for new managers',
    variables: ['firstName', 'platformUrl']
  },
  {
    name: 'welcome_producer',
    subject: 'Welcome to Production!',
    description: 'Welcome email for new producers',
    variables: ['firstName', 'platformUrl']
  },
  {
    name: 'password_reset',
    subject: 'Password Reset Request',
    description: 'Password reset email with reset link',
    variables: ['resetUrl']
  },
  {
    name: 'notification_general',
    subject: 'Notification from Talents & Stars',
    description: 'General notification email template',
    variables: ['firstName', 'message', 'platformUrl']
  }
];

export default function EmailTemplates() {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<EmailTemplateFormData>({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    variables: [],
    description: ''
  });
  const [variableInput, setVariableInput] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/admin/email-templates'],
    queryFn: () => apiRequest('/api/admin/email-templates')
  });

  const createMutation = useMutation({
    mutationFn: (data: EmailTemplateFormData) => 
      apiRequest('/api/admin/email-templates', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Email template created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create email template",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmailTemplateFormData }) =>
      apiRequest(`/api/admin/email-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      setEditingTemplate(null);
      toast({
        title: "Success",
        description: "Email template updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update email template",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/email-templates/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-templates'] });
      toast({
        title: "Success",
        description: "Email template deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete email template",
        variant: "destructive"
      });
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: ({ templateId, email, variables }: { templateId: number; email: string; variables: Record<string, string> }) =>
      apiRequest(`/api/admin/email-templates/${templateId}/test`, {
        method: 'POST',
        body: JSON.stringify({ email, variables })
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      text_content: '',
      variables: [],
      description: ''
    });
    setVariableInput('');
  };

  const handleAddVariable = () => {
    if (variableInput.trim() && !formData.variables.includes(variableInput.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variableInput.trim()]
      }));
      setVariableInput('');
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content,
      variables: template.variables,
      description: template.description || ''
    });
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTestEmail = (template: EmailTemplate) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }

    testEmailMutation.mutate({
      templateId: template.id,
      email: testEmail,
      variables: testVariables
    });
  };

  const renderPreview = (template: EmailTemplate) => {
    let previewHtml = template.html_content;
    let previewText = template.text_content;
    let previewSubject = template.subject;

    // Replace variables with preview values
    template.variables.forEach(variable => {
      const value = testVariables[variable] || `{${variable}}`;
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
      previewText = previewText.replace(regex, value);
      previewSubject = previewSubject.replace(regex, value);
    });

    return { previewHtml, previewText, previewSubject };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">Manage email templates for consistent branding</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {template.variables.length} variables
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{template.name}" template? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(template.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Variables</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.map(variable => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || editingTemplate !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setEditingTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., welcome_talent"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject line"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label>Variables</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={variableInput}
                  onChange={(e) => setVariableInput(e.target.value)}
                  placeholder="Variable name"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
                />
                <Button onClick={handleAddVariable} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.variables.map(variable => (
                  <Badge key={variable} variant="secondary" className="cursor-pointer"
                    onClick={() => handleRemoveVariable(variable)}
                  >
                    {variable} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList>
                <TabsTrigger value="html">HTML Content</TabsTrigger>
                <TabsTrigger value="text">Text Content</TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <Label htmlFor="html_content">HTML Content</Label>
                <Textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                  placeholder="HTML email template content"
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="text">
                <Label htmlFor="text_content">Text Content</Label>
                <Textarea
                  id="text_content"
                  value={formData.text_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_content: e.target.value }))}
                  placeholder="Plain text email template content"
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewTemplate !== null} onOpenChange={(open) => {
        if (!open) {
          setPreviewTemplate(null);
          setTestEmail('');
          setTestVariables({});
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <Button
                    onClick={() => handleTestEmail(previewTemplate)}
                    disabled={testEmailMutation.isPending}
                    className="mt-6"
                  >
                    Send Test Email
                  </Button>
                </div>
              </div>

              <div>
                <Label>Test Variables</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {previewTemplate.variables.map(variable => (
                    <div key={variable}>
                      <Label className="text-sm">{variable}</Label>
                      <Input
                        value={testVariables[variable] || ''}
                        onChange={(e) => setTestVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        placeholder={`Enter ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML Source</TabsTrigger>
                  <TabsTrigger value="text">Text Version</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <div className="border rounded-lg p-4">
                    <div className="mb-4">
                      <Label className="font-medium">Subject:</Label>
                      <p className="text-sm">{renderPreview(previewTemplate).previewSubject}</p>
                    </div>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: renderPreview(previewTemplate).previewHtml 
                      }}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="html">
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {renderPreview(previewTemplate).previewHtml}
                  </pre>
                </TabsContent>
                <TabsContent value="text">
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {renderPreview(previewTemplate).previewText}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}