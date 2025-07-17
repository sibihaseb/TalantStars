import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FileText, Save, Plus, Edit, Calendar } from 'lucide-react';

interface LegalDocument {
  id: number;
  type: string;
  title: string;
  content: string;
  effectiveDate: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

interface LegalDocumentEditorProps {
  onClose?: () => void;
}

const LegalDocumentEditor: React.FC<LegalDocumentEditorProps> = ({ onClose }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
    effectiveDate: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all legal documents
  const { data: documents = [], isLoading } = useQuery<LegalDocument[]>({
    queryKey: ['/api/legal-documents'],
    queryFn: () => apiRequest('/api/legal-documents')
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<LegalDocument>) =>
      apiRequest(`/api/admin/legal-documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-documents'] });
      toast({
        title: "Success",
        description: "Legal document updated successfully",
      });
      setIsEditing(false);
      setSelectedDocumentId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update legal document",
        variant: "destructive",
      });
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<LegalDocument, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) =>
      apiRequest('/api/admin/legal-documents', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-documents'] });
      toast({
        title: "Success",
        description: "Legal document created successfully",
      });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create legal document",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      type: '',
      title: '',
      content: '',
      effectiveDate: ''
    });
  };

  const handleEdit = (document: LegalDocument) => {
    setSelectedDocumentId(document.id);
    setFormData({
      type: document.type,
      title: document.title,
      content: document.content,
      effectiveDate: document.effectiveDate.split('T')[0] // Format for date input
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      createMutation.mutate(formData);
    } else if (selectedDocumentId) {
      updateMutation.mutate({
        id: selectedDocumentId,
        ...formData
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedDocumentId(null);
    resetForm();
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedDocumentId(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Legal Documents Management</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create New Document
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{doc.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">
                        Effective: {new Date(doc.effectiveDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(doc)}
                    disabled={isEditing && selectedDocumentId === doc.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Create New Document' : isEditing ? 'Edit Document' : 'Document Editor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isEditing || isCreating) ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Document Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terms_of_service">Terms of Service</SelectItem>
                      <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
                      <SelectItem value="cookie_policy">Cookie Policy</SelectItem>
                      <SelectItem value="user_agreement">User Agreement</SelectItem>
                      <SelectItem value="dmca_policy">DMCA Policy</SelectItem>
                      <SelectItem value="community_guidelines">Community Guidelines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                  />
                </div>

                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter document content (supports HTML)"
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending || createMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateMutation.isPending || createMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a document to edit or create a new one
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LegalDocumentEditor;