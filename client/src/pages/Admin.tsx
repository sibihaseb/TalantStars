import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Settings, 
  DollarSign, 
  FileText, 
  Edit, 
  Trash2, 
  Plus, 
  Shield, 
  Crown,
  Star,
  Activity,
  BarChart3,
  UserCheck,
  AlertCircle
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profile?: {
    displayName: string;
    talentType: string;
    bio: string;
    location: string;
    verified: boolean;
  };
  createdAt: string;
}

interface PricingTier {
  id: number;
  name: string;
  price: number;
  duration: number;
  features: string[];
  active: boolean;
}

interface ProfileQuestion {
  id: number;
  talentType: string;
  question: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
  options?: string[];
  order: number;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<ProfileQuestion | null>(null);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  // Fetch pricing tiers
  const { data: pricingTiers = [], isLoading: tiersLoading } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/pricing-tiers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/pricing-tiers");
      return response.json();
    },
  });

  // Fetch profile questions
  const { data: profileQuestions = [], isLoading: questionsLoading } = useQuery<ProfileQuestion[]>({
    queryKey: ["/api/admin/profile-questions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/profile-questions");
      return response.json();
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
  });

  // Verify user mutation
  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/verify`, { verified });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User verification status updated",
      });
    },
  });

  // Create/Update pricing tier mutation
  const savePricingTierMutation = useMutation({
    mutationFn: async (tier: Partial<PricingTier>) => {
      const method = tier.id ? "PUT" : "POST";
      const url = tier.id ? `/api/admin/pricing-tiers/${tier.id}` : "/api/admin/pricing-tiers";
      const response = await apiRequest(method, url, tier);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-tiers"] });
      setIsEditingTier(false);
      setEditingTier(null);
      toast({
        title: "Success",
        description: "Pricing tier saved successfully",
      });
    },
  });

  // Delete pricing tier mutation
  const deletePricingTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/pricing-tiers/${tierId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-tiers"] });
      toast({
        title: "Success",
        description: "Pricing tier deleted successfully",
      });
    },
  });

  // Create/Update profile question mutation
  const saveProfileQuestionMutation = useMutation({
    mutationFn: async (question: Partial<ProfileQuestion>) => {
      const method = question.id ? "PUT" : "POST";
      const url = question.id ? `/api/admin/profile-questions/${question.id}` : "/api/admin/profile-questions";
      const response = await apiRequest(method, url, question);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile-questions"] });
      setIsEditingQuestion(false);
      setEditingQuestion(null);
      toast({
        title: "Success",
        description: "Profile question saved successfully",
      });
    },
  });

  // Delete profile question mutation
  const deleteProfileQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/profile-questions/${questionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile-questions"] });
      toast({
        title: "Success",
        description: "Profile question deleted successfully",
      });
    },
  });

  // Statistics
  const totalUsers = users.length;
  const talentUsers = users.filter(u => u.profile?.role === "talent").length;
  const producerUsers = users.filter(u => u.profile?.role === "producer").length;
  const managerUsers = users.filter(u => u.profile?.role === "manager").length;
  const verifiedUsers = users.filter(u => u.profile?.isVerified).length;

  const handleSaveTier = (formData: FormData) => {
    const tierData = {
      ...editingTier,
      name: formData.get("name") as string,
      price: parseInt(formData.get("price") as string),
      duration: parseInt(formData.get("duration") as string),
      features: (formData.get("features") as string).split("\n").filter(f => f.trim()),
      active: formData.get("active") === "true",
    };
    savePricingTierMutation.mutate(tierData);
  };

  const handleSaveQuestion = (formData: FormData) => {
    const questionData = {
      ...editingQuestion,
      question: formData.get("question") as string,
      fieldName: formData.get("fieldName") as string,
      fieldType: formData.get("fieldType") as string,
      talentType: formData.get("talentType") as string,
      required: formData.get("required") === "true",
      options: formData.get("options") ? (formData.get("options") as string).split("\n").filter(o => o.trim()) : [],
      order: parseInt(formData.get("order") as string) || 0,
    };
    saveProfileQuestionMutation.mutate(questionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, pricing, and platform settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="h-4 w-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="questions">
              <FileText className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active platform users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Talent Users</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{talentUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered talents
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Producers</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{producerUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active producers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{verifiedUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Verified profiles
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">New user registration</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">User profile verified</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Profile flagged for review</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.profile?.displayName || `${user.firstName} ${user.lastName}`}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.profile?.role === "talent" ? "default" : "secondary"}>
                              {user.profile?.role || "No role"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.profile?.talentType || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.profile?.isVerified ? "default" : "secondary"}>
                              {user.profile?.isVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Select
                                value={user.profile?.role || ""}
                                onValueChange={(role) => updateUserRoleMutation.mutate({ userId: user.id, role })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="talent">Talent</SelectItem>
                                  <SelectItem value="producer">Producer</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant={user.profile?.isVerified ? "destructive" : "default"}
                                size="sm"
                                onClick={() => verifyUserMutation.mutate({ 
                                  userId: user.id, 
                                  verified: !user.profile?.isVerified 
                                })}
                              >
                                {user.profile?.isVerified ? "Unverify" : "Verify"}
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

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pricing Tiers</CardTitle>
                <Dialog open={isEditingTier} onOpenChange={setIsEditingTier}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTier({} as PricingTier)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTier?.id ? "Edit Pricing Tier" : "Create Pricing Tier"}
                      </DialogTitle>
                    </DialogHeader>
                    <form action={handleSaveTier}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingTier?.name}
                            placeholder="Basic, Premium, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            defaultValue={editingTier?.price}
                            placeholder="29.99"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duration (days)</Label>
                          <Input
                            id="duration"
                            name="duration"
                            type="number"
                            defaultValue={editingTier?.duration}
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <Label htmlFor="features">Features (one per line)</Label>
                          <Textarea
                            id="features"
                            name="features"
                            defaultValue={editingTier?.features?.join("\n")}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                          />
                        </div>
                        <div>
                          <Label htmlFor="active">Status</Label>
                          <Select name="active" defaultValue={editingTier?.active?.toString() || "true"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setIsEditingTier(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingTier?.id ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tiersLoading ? (
                  <div className="text-center py-8">Loading pricing tiers...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pricingTiers.map((tier) => (
                      <Card key={tier.id} className="relative">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {tier.name}
                            <Badge variant={tier.active ? "default" : "secondary"}>
                              {tier.active ? "Active" : "Inactive"}
                            </Badge>
                          </CardTitle>
                          <p className="text-3xl font-bold">${tier.price}</p>
                          <p className="text-sm text-muted-foreground">
                            per {tier.duration} days
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 mb-4">
                            {tier.features.map((feature, index) => (
                              <li key={index} className="text-sm">
                                • {feature}
                              </li>
                            ))}
                          </ul>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTier(tier);
                                setIsEditingTier(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deletePricingTierMutation.mutate(tier.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Questions</CardTitle>
                <Dialog open={isEditingQuestion} onOpenChange={setIsEditingQuestion}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingQuestion({} as ProfileQuestion)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuestion?.id ? "Edit Profile Question" : "Create Profile Question"}
                      </DialogTitle>
                    </DialogHeader>
                    <form action={handleSaveQuestion}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="question">Question</Label>
                          <Input
                            id="question"
                            name="question"
                            defaultValue={editingQuestion?.question}
                            placeholder="What is your height?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fieldName">Field Name</Label>
                          <Input
                            id="fieldName"
                            name="fieldName"
                            defaultValue={editingQuestion?.fieldName}
                            placeholder="height"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fieldType">Field Type</Label>
                          <Select name="fieldType" defaultValue={editingQuestion?.fieldType || "text"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="multiselect">Multi-select</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="talentType">Talent Type</Label>
                          <Select name="talentType" defaultValue={editingQuestion?.talentType || "all"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="actor">Actor</SelectItem>
                              <SelectItem value="musician">Musician</SelectItem>
                              <SelectItem value="voice_artist">Voice Artist</SelectItem>
                              <SelectItem value="model">Model</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="options">Options (for select/multiselect, one per line)</Label>
                          <Textarea
                            id="options"
                            name="options"
                            defaultValue={editingQuestion?.options?.join("\n")}
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                          />
                        </div>
                        <div>
                          <Label htmlFor="order">Order</Label>
                          <Input
                            id="order"
                            name="order"
                            type="number"
                            defaultValue={editingQuestion?.order}
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="required">Required</Label>
                          <Select name="required" defaultValue={editingQuestion?.required?.toString() || "false"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setIsEditingQuestion(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingQuestion?.id ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="text-center py-8">Loading profile questions...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Field Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Talent Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profileQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="font-medium">{question.question}</TableCell>
                          <TableCell>{question.fieldName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{question.fieldType}</Badge>
                          </TableCell>
                          <TableCell>{question.talentType}</TableCell>
                          <TableCell>
                            <Badge variant={question.required ? "default" : "secondary"}>
                              {question.required ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{question.order}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingQuestion(question);
                                  setIsEditingQuestion(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteProfileQuestionMutation.mutate(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      defaultValue="Talents & Stars"
                      placeholder="Your platform name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      defaultValue="support@talentsandstars.com"
                      placeholder="support@yoursite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <Select defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="registrationEnabled">User Registration</Label>
                    <Select defaultValue="true">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}