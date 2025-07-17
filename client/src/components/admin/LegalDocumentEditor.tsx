import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FileText, Save, Plus, Edit, Calendar, Shield, Eye, History, CheckCircle, AlertCircle, Scroll, Book, Clock, User } from 'lucide-react';

interface LegalDocument {
  id: number;
  type: string;
  title: string;
  content: string;
  effectiveDate: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: number;
}

interface LegalDocumentEditorProps {
  onClose?: () => void;
}

const LegalDocumentEditor: React.FC<LegalDocumentEditorProps> = ({ onClose }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/legal-documents');
      return response.json();
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<LegalDocument>) => {
      const response = await apiRequest('PUT', `/api/admin/legal-documents/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-documents'] });
      toast({
        title: "✅ Document Updated",
        description: "Legal document has been successfully updated",
      });
      setIsEditing(false);
      setSelectedDocumentId(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update legal document",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocumentId) {
      updateMutation.mutate({
        id: selectedDocumentId,
        ...formData
      });
    }
  };

  // Load document data into form
  const loadDocumentData = (doc: LegalDocument) => {
    setFormData({
      type: doc.type,
      title: doc.title,
      content: doc.content,
      effectiveDate: doc.effectiveDate.split('T')[0]
    });
    setSelectedDocumentId(doc.id);
    setIsEditing(true);
    setActiveTab('edit');
  };

  // Get document type display info
  const getDocumentTypeInfo = (type: string) => {
    switch (type) {
      case 'terms':
      case 'terms_of_service':
        return {
          icon: <Scroll className="h-5 w-5" />,
          label: 'Terms of Service',
          color: 'bg-blue-500',
          description: 'Legal terms governing platform usage'
        };
      case 'privacy':
      case 'privacy_policy':
        return {
          icon: <Shield className="h-5 w-5" />,
          label: 'Privacy Policy',
          color: 'bg-green-500',
          description: 'Data protection and privacy guidelines'
        };
      default:
        return {
          icon: <FileText className="h-5 w-5" />,
          label: 'Legal Document',
          color: 'bg-gray-500',
          description: 'Legal document'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Book className="h-8 w-8 text-white" />
              </div>
              Legal Document Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage Terms of Service, Privacy Policy, and other legal documents
            </p>
          </div>
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Close Editor
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No legal documents found</p>
              </div>
            ) : (
              documents.map((doc) => {
                const typeInfo = getDocumentTypeInfo(doc.type);
                return (
                  <Card key={doc.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className={`absolute top-0 left-0 w-full h-1 ${typeInfo.color}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${typeInfo.color} text-white`}>
                            {typeInfo.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{typeInfo.description}</p>
                          </div>
                        </div>
                        <Badge variant={doc.isActive ? "default" : "secondary"}>
                          {doc.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {new Date(doc.effectiveDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            v{doc.version}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-20 overflow-hidden">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {doc.content.substring(0, 150)}...
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => loadDocumentData(doc)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocumentId(doc.id);
                            setActiveTab('history');
                          }}
                          className="flex items-center gap-2"
                        >
                          <History className="h-4 w-4" />
                          History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Edit Legal Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effectiveDate">Effective Date</Label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                        className="focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Document Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[400px] focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Enter legal document content in Markdown format..."
                      required
                    />
                    <p className="text-sm text-gray-500">
                      💡 Tip: Use Markdown formatting for better document structure
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedDocumentId(null);
                    setActiveTab('overview');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Select a document from the overview to edit</p>
                <Button onClick={() => setActiveTab('overview')}>
                  Go to Overview
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Document History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Document history feature coming soon</p>
                <p className="text-sm text-gray-500 mt-2">
                  Track changes, versions, and revision history
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalDocumentEditor;