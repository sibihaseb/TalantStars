import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Plus, Edit, Trash2, Calendar, Users, Mail, Eye } from "lucide-react";
import { format } from "date-fns";

interface EmailCampaign {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  targetGroups: string[];
  template: any;
  scheduledFor: string;
  sentCount: number;
  failedCount: number;
  totalTargets: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  active: boolean;
  createdAt: string;
}

const targetGroupOptions = [
  { value: "all", label: "All Users" },
  { value: "talent", label: "Talent" },
  { value: "manager", label: "Managers" },
  { value: "producer", label: "Producers" },
  { value: "agent", label: "Agents" },
  { value: "actor", label: "Actors" },
  { value: "musician", label: "Musicians" },
  { value: "voice_artist", label: "Voice Artists" },
  { value: "model", label: "Models" },
];

const campaignStatusColors = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800",
  sending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function EmailCampaigns() {
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState<EmailCampaign | null>(null);
  const { toast } = useToast();

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    type: "instant",
    targetGroups: [] as string[],
    template: {
      subject: "",
      htmlContent: "",
      textContent: "",
    },
    scheduledFor: "",
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "newsletter",
    subject: "",
    htmlContent: "",
    textContent: "",
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/admin/email-campaigns"],
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/admin/email-templates"],
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: any) => {
      const res = await apiRequest("POST", "/api/admin/email-campaigns", campaign);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      setCampaignDialog(false);
      resetCampaignForm();
      toast({
        title: "Success",
        description: "Email campaign created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const res = await apiRequest("PUT", `/api/admin/email-campaigns/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      setCampaignDialog(false);
      setEditingCampaign(null);
      resetCampaignForm();
      toast({
        title: "Success",
        description: "Email campaign updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/email-campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({
        title: "Success",
        description: "Email campaign deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/email-campaigns/${id}/send`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({
        title: "Success",
        description: "Email campaign sent successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const res = await apiRequest("POST", "/api/admin/email-templates", template);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      setTemplateDialog(false);
      resetTemplateForm();
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const res = await apiRequest("PUT", `/api/admin/email-templates/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      setTemplateDialog(false);
      setEditingTemplate(null);
      resetTemplateForm();
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetCampaignForm = () => {
    setCampaignForm({
      name: "",
      description: "",
      type: "instant",
      targetGroups: [],
      template: {
        subject: "",
        htmlContent: "",
        textContent: "",
      },
      scheduledFor: "",
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      description: "",
      category: "newsletter",
      subject: "",
      htmlContent: "",
      textContent: "",
    });
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || "",
      type: campaign.type,
      targetGroups: campaign.targetGroups,
      template: campaign.template,
      scheduledFor: campaign.scheduledFor ? format(new Date(campaign.scheduledFor), "yyyy-MM-dd'T'HH:mm") : "",
    });
    setCampaignDialog(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || "",
      category: template.category,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || "",
    });
    setTemplateDialog(true);
  };

  const handleSaveCampaign = () => {
    if (editingCampaign) {
      updateCampaignMutation.mutate({ id: editingCampaign.id, ...campaignForm });
    } else {
      createCampaignMutation.mutate(campaignForm);
    }
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, ...templateForm });
    } else {
      createTemplateMutation.mutate(templateForm);
    }
  };

  const handleTargetGroupChange = (value: string, checked: boolean) => {
    if (checked) {
      setCampaignForm(prev => ({
        ...prev,
        targetGroups: [...prev.targetGroups, value]
      }));
    } else {
      setCampaignForm(prev => ({
        ...prev,
        targetGroups: prev.targetGroups.filter(g => g !== value)
      }));
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    setCampaignForm(prev => ({
      ...prev,
      template: {
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent || "",
      }
    }));
    toast({
      title: "Template Applied",
      description: `Template "${template.name}" has been applied to your campaign`,
    });
  };

  const handlePreview = (campaign: EmailCampaign) => {
    setPreviewContent(campaign);
    setPreviewDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Campaigns</h2>
        <div className="flex gap-2">
          <Button onClick={() => { resetCampaignForm(); setCampaignDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
          <Button variant="outline" onClick={() => { resetTemplateForm(); setTemplateDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Target Groups</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Sent/Failed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: EmailCampaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-gray-500">{campaign.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={campaignStatusColors[campaign.status as keyof typeof campaignStatusColors]}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {campaign.targetGroups.slice(0, 3).map(group => (
                              <Badge key={group} variant="secondary" className="text-xs">
                                {targetGroupOptions.find(opt => opt.value === group)?.label || group}
                              </Badge>
                            ))}
                            {campaign.targetGroups.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{campaign.targetGroups.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {campaign.scheduledFor ? (
                            <div className="text-sm">
                              {format(new Date(campaign.scheduledFor), "MMM dd, yyyy HH:mm")}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-green-600">{campaign.sentCount || 0} sent</div>
                            <div className="text-red-600">{campaign.failedCount || 0} failed</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(campaign)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {campaign.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                disabled={sendCampaignMutation.isPending}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                              disabled={deleteCampaignMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template: EmailTemplate) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>
                          <Badge variant={template.active ? "default" : "secondary"}>
                            {template.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(template.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUseTemplate(template)}
                            >
                              Use
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteTemplateMutation.mutate(template.id)}
                              disabled={deleteTemplateMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((sum: number, campaign: EmailCampaign) => sum + (campaign.sentCount || 0), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates.filter((template: EmailTemplate) => template.active).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialog} onOpenChange={setCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Edit Campaign" : "Create Campaign"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Campaign Type</Label>
                <Select value={campaignForm.type} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={campaignForm.description}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label>Target Groups</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {targetGroupOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={campaignForm.targetGroups.includes(option.value)}
                      onCheckedChange={(checked) => handleTargetGroupChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {campaignForm.type === "scheduled" && (
              <div>
                <Label htmlFor="scheduledFor">Scheduled For</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={campaignForm.scheduledFor}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduledFor: e.target.value }))}
                />
              </div>
            )}

            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={campaignForm.template.subject}
                onChange={(e) => setCampaignForm(prev => ({
                  ...prev,
                  template: { ...prev.template, subject: e.target.value }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="htmlContent">HTML Content</Label>
              <Textarea
                id="htmlContent"
                rows={8}
                value={campaignForm.template.htmlContent}
                onChange={(e) => setCampaignForm(prev => ({
                  ...prev,
                  template: { ...prev.template, htmlContent: e.target.value }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="textContent">Text Content</Label>
              <Textarea
                id="textContent"
                rows={6}
                value={campaignForm.template.textContent}
                onChange={(e) => setCampaignForm(prev => ({
                  ...prev,
                  template: { ...prev.template, textContent: e.target.value }
                }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCampaignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCampaign} disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}>
                {editingCampaign ? "Update" : "Create"} Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={templateForm.category} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="templateSubject">Subject</Label>
              <Input
                id="templateSubject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="templateHtmlContent">HTML Content</Label>
              <Textarea
                id="templateHtmlContent"
                rows={8}
                value={templateForm.htmlContent}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, htmlContent: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="templateTextContent">Text Content</Label>
              <Textarea
                id="templateTextContent"
                rows={6}
                value={templateForm.textContent}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, textContent: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                {editingTemplate ? "Update" : "Create"} Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Campaign Preview: {previewContent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Subject: {previewContent?.template.subject}</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewContent?.template.htmlContent || ""
                  }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Target Groups:</strong> {previewContent?.targetGroups.join(", ")}</p>
              <p><strong>Type:</strong> {previewContent?.type}</p>
              <p><strong>Status:</strong> {previewContent?.status}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}