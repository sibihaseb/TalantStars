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
import { Switch } from "@/components/ui/switch";
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
  AlertCircle,
  TrendingUp,
  Database,
  Lock,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Zap,
  Globe,
  Mail,
  CreditCard,
  Bell,
  Key,
  Archive,
  RefreshCw,
  FileBarChart,
  UserPlus,
  Briefcase
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
    role: string;
    isVerified: boolean;
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
  createdAt: string;
  updatedAt: string;
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
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  dataType: string;
  updatedAt: string;
  updatedBy: string;
}

interface AdminLog {
  id: number;
  adminId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface Job {
  id: number;
  userId: string;
  title: string;
  description: string;
  talentType: string;
  location: string;
  budget: number;
  projectDate: string;
  requirements: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  id: number;
  event: string;
  userId: string;
  metadata: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingTier, setIsEditingTier] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingSetting, setIsEditingSetting] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<ProfileQuestion | null>(null);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Fetch all data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pricingTiers = [], isLoading: tiersLoading } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/pricing-tiers"],
  });

  const { data: profileQuestions = [], isLoading: questionsLoading } = useQuery<ProfileQuestion[]>({
    queryKey: ["/api/admin/profile-questions"],
  });

  const { data: systemSettings = [], isLoading: settingsLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: adminLogs = [], isLoading: logsLoading } = useQuery<AdminLog[]>({
    queryKey: ["/api/admin/logs"],
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/admin/jobs"],
  });

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: analyticsSummary = [], isLoading: summaryLoading } = useQuery<{event: string; count: number}[]>({
    queryKey: ["/api/admin/analytics/summary"],
  });

  // Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Error updating user role:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/verify`, { verified });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user verification");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User verification status updated" });
    },
    onError: (error: Error) => {
      console.error("Error updating user verification:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const savePricingTierMutation = useMutation({
    mutationFn: async (tier: Partial<PricingTier>) => {
      const method = tier.id ? "PUT" : "POST";
      const url = tier.id ? `/api/admin/pricing-tiers/${tier.id}` : "/api/admin/pricing-tiers";
      const response = await apiRequest(method, url, tier);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save pricing tier");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-tiers"] });
      setIsEditingTier(false);
      setEditingTier(null);
      toast({ title: "Success", description: "Pricing tier saved successfully" });
    },
    onError: (error: Error) => {
      console.error("Error saving pricing tier:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePricingTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/pricing-tiers/${tierId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete pricing tier");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-tiers"] });
      toast({ title: "Success", description: "Pricing tier deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Error deleting pricing tier:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const saveProfileQuestionMutation = useMutation({
    mutationFn: async (question: Partial<ProfileQuestion>) => {
      const method = question.id ? "PUT" : "POST";
      const url = question.id ? `/api/admin/profile-questions/${question.id}` : "/api/admin/profile-questions";
      const response = await apiRequest(method, url, question);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save profile question");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile-questions"] });
      setIsEditingQuestion(false);
      setEditingQuestion(null);
      toast({ title: "Success", description: "Profile question saved successfully" });
    },
    onError: (error: Error) => {
      console.error("Error saving profile question:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteProfileQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/profile-questions/${questionId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete profile question");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile-questions"] });
      toast({ title: "Success", description: "Profile question deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Error deleting profile question:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const saveSystemSettingMutation = useMutation({
    mutationFn: async (setting: Partial<SystemSetting>) => {
      const method = setting.id ? "PUT" : "POST";
      const url = setting.id ? `/api/admin/settings/${setting.key}` : "/api/admin/settings";
      const response = await apiRequest(method, url, setting);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save system setting");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setIsEditingSetting(false);
      setEditingSetting(null);
      toast({ title: "Success", description: "System setting saved successfully" });
    },
    onError: (error: Error) => {
      console.error("Error saving system setting:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSystemSettingMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("DELETE", `/api/admin/settings/${key}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete system setting");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Success", description: "System setting deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Error deleting system setting:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (job: Partial<Job>) => {
      const response = await apiRequest("POST", "/api/admin/jobs", job);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create job");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsEditingJob(false);
      setEditingJob(null);
      toast({ title: "Success", description: "Job created successfully" });
    },
    onError: (error: Error) => {
      console.error("Error creating job:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, data }: { jobId: number; data: Partial<Job> }) => {
      const response = await apiRequest("PUT", `/api/admin/jobs/${jobId}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update job");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsEditingJob(false);
      setEditingJob(null);
      toast({ title: "Success", description: "Job updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Error updating job:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/jobs/${jobId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete job");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Success", description: "Job deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Error deleting job:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Statistics
  const totalUsers = users.length;
  const talentUsers = users.filter(u => u.profile?.role === "talent").length;
  const producerUsers = users.filter(u => u.profile?.role === "producer").length;
  const managerUsers = users.filter(u => u.profile?.role === "manager").length;
  const adminUsers = users.filter(u => u.profile?.role === "admin").length;
  const verifiedUsers = users.filter(u => u.profile?.isVerified).length;
  const activeTiers = pricingTiers.filter(t => t.active).length;
  const activeJobs = jobs.filter(j => j.status === "open").length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.profile?.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSaveTier = (formData: FormData) => {
    const tierData = {
      ...(editingTier?.id && { id: editingTier.id }),
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      duration: parseInt(formData.get("duration") as string),
      features: (formData.get("features") as string).split("\n").filter(f => f.trim()),
      active: formData.get("active") === "on",
    };
    console.log("Saving tier:", tierData);
    savePricingTierMutation.mutate(tierData);
  };

  const handleSaveQuestion = (formData: FormData) => {
    const questionData = {
      ...(editingQuestion?.id && { id: editingQuestion.id }),
      talentType: formData.get("talentType") as string,
      question: formData.get("question") as string,
      fieldName: formData.get("fieldName") as string,
      fieldType: formData.get("fieldType") as string,
      required: formData.get("required") === "on",
      options: formData.get("options") ? (formData.get("options") as string).split("\n").filter(o => o.trim()) : undefined,
      order: parseInt(formData.get("order") as string) || 0,
      active: formData.get("active") === "on",
    };
    console.log("Saving question:", questionData);
    saveProfileQuestionMutation.mutate(questionData);
  };

  const handleSaveSetting = (formData: FormData) => {
    const settingData = {
      ...(editingSetting?.id && { id: editingSetting.id }),
      key: formData.get("key") as string,
      value: formData.get("value") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      dataType: formData.get("dataType") as string,
      updatedBy: user?.id || "admin",
    };
    console.log("Saving setting:", settingData);
    saveSystemSettingMutation.mutate(settingData);
  };

  const handleSaveJob = (formData: FormData) => {
    const jobData = {
      ...(editingJob?.id && { id: editingJob.id }),
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      talentType: formData.get("talentType") as string,
      location: formData.get("location") as string,
      budget: parseFloat(formData.get("budget") as string),
      projectDate: formData.get("projectDate") as string,
      requirements: formData.get("requirements") as string,
      status: formData.get("status") as string,
      isPublic: formData.get("isPublic") === "on",
      userId: user?.id || "admin",
    };
    console.log("Saving job:", jobData);
    if (editingJob?.id) {
      updateJobMutation.mutate({ jobId: editingJob.id, data: jobData });
    } else {
      createJobMutation.mutate(jobData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your platform, users, and settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-auto">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="questions">
              <FileText className="w-4 h-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Archive className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

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
                    {verifiedUsers} verified
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedJobs} completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pricing Tiers</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeTiers}</div>
                  <p className="text-xs text-muted-foreground">
                    {pricingTiers.length} total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Questions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profileQuestions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    across all talent types
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">User Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Talent</span>
                    <Badge variant="outline">{talentUsers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Producers</span>
                    <Badge variant="outline">{producerUsers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Managers</span>
                    <Badge variant="outline">{managerUsers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admins</span>
                    <Badge variant="outline">{adminUsers}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsSummary.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{event.event}</span>
                        <Badge variant="secondary">{event.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messages</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management
                  </span>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="talent">Talent</SelectItem>
                      <SelectItem value="producer">Producer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Talent Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.profile?.role === "admin" ? "default" : "secondary"}>
                              {user.profile?.role || "No Role"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.profile?.talentType && (
                              <Badge variant="outline">{user.profile.talentType}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{user.profile?.location || "Not specified"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.profile?.isVerified ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => verifyUserMutation.mutate({ 
                                  userId: user.id, 
                                  verified: !user.profile?.isVerified 
                                })}
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Job Management
                  </span>
                  <Button onClick={() => {
                    setEditingJob(null);
                    setIsEditingJob(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Talent Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{job.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {job.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.talentType}</Badge>
                          </TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>${job.budget}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === "open" ? "default" : "secondary"}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingJob(job);
                                  setIsEditingJob(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteJobMutation.mutate(job.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Job Create/Edit Dialog */}
            <Dialog open={isEditingJob} onOpenChange={setIsEditingJob}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingJob ? 'Edit Job' : 'Create Job'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveJob(new FormData(e.currentTarget));
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        name="title"
                        defaultValue={editingJob?.title || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        name="description"
                        defaultValue={editingJob?.description || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="talentType">Talent Type</Label>
                      <select 
                        name="talentType" 
                        defaultValue={editingJob?.talentType || ""}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select talent type</option>
                        <option value="actor">Actor</option>
                        <option value="musician">Musician</option>
                        <option value="voice_artist">Voice Artist</option>
                        <option value="model">Model</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        name="location"
                        defaultValue={editingJob?.location || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        type="number"
                        name="budget"
                        defaultValue={editingJob?.budget || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectDate">Project Date</Label>
                      <Input
                        type="date"
                        name="projectDate"
                        defaultValue={editingJob?.projectDate || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="requirements">Requirements</Label>
                      <Textarea
                        name="requirements"
                        defaultValue={editingJob?.requirements || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select 
                        name="status" 
                        defaultValue={editingJob?.status || "open"}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isPublic"
                        defaultChecked={editingJob?.isPublic}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isPublic">Public Job</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsEditingJob(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing Tiers
                  </span>
                  <Dialog open={isEditingTier} onOpenChange={setIsEditingTier}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingTier(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tier
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingTier ? "Edit Pricing Tier" : "Create Pricing Tier"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveTier(new FormData(e.currentTarget));
                      }}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              defaultValue={editingTier?.name || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Price</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              defaultValue={editingTier?.price || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration (days)</Label>
                            <Input
                              id="duration"
                              name="duration"
                              type="number"
                              defaultValue={editingTier?.duration || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="features">Features (one per line)</Label>
                            <Textarea
                              id="features"
                              name="features"
                              defaultValue={editingTier?.features?.join("\n") || ""}
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="active"
                              name="active"
                              defaultChecked={editingTier?.active ?? true}
                            />
                            <Label htmlFor="active">Active</Label>
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button type="submit">
                            {editingTier ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pricingTiers.map((tier) => (
                    <Card key={tier.id} className={tier.active ? "border-green-200" : "border-gray-200"}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{tier.name}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTier(tier);
                                setIsEditingTier(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletePricingTierMutation.mutate(tier.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">${tier.price}</div>
                          <div className="text-sm text-gray-500">
                            {tier.duration} days
                          </div>
                          <div className="space-y-1">
                            {tier.features.map((feature, index) => (
                              <div key={index} className="text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                          <div className="pt-2">
                            <Badge variant={tier.active ? "default" : "secondary"}>
                              {tier.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Profile Questions
                  </span>
                  <Dialog open={isEditingQuestion} onOpenChange={setIsEditingQuestion}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingQuestion(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingQuestion ? "Edit Profile Question" : "Create Profile Question"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveQuestion(new FormData(e.currentTarget));
                      }}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="talentType">Talent Type</Label>
                            <select 
                              name="talentType" 
                              defaultValue={editingQuestion?.talentType || ""}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              required
                            >
                              <option value="">Select talent type</option>
                              <option value="actor">Actor</option>
                              <option value="musician">Musician</option>
                              <option value="voice_artist">Voice Artist</option>
                              <option value="model">Model</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="question">Question</Label>
                            <Input
                              id="question"
                              name="question"
                              defaultValue={editingQuestion?.question || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="fieldName">Field Name</Label>
                            <Input
                              id="fieldName"
                              name="fieldName"
                              defaultValue={editingQuestion?.fieldName || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="fieldType">Field Type</Label>
                            <select 
                              name="fieldType" 
                              defaultValue={editingQuestion?.fieldType || ""}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              required
                            >
                              <option value="">Select field type</option>
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                              <option value="select">Select</option>
                              <option value="multiselect">Multi-select</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="number">Number</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="options">Options (one per line, for select/multiselect)</Label>
                            <Textarea
                              id="options"
                              name="options"
                              defaultValue={editingQuestion?.options?.join("\n") || ""}
                            />
                          </div>
                          <div>
                            <Label htmlFor="order">Order</Label>
                            <Input
                              id="order"
                              name="order"
                              type="number"
                              defaultValue={editingQuestion?.order || 0}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="required"
                              name="required"
                              defaultChecked={editingQuestion?.required ?? false}
                            />
                            <Label htmlFor="required">Required</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="active"
                              name="active"
                              defaultChecked={editingQuestion?.active ?? true}
                            />
                            <Label htmlFor="active">Active</Label>
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button type="submit">
                            {editingQuestion ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Talent Type</TableHead>
                        <TableHead>Field Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profileQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <div className="max-w-xs truncate">{question.question}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{question.talentType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{question.fieldType}</Badge>
                          </TableCell>
                          <TableCell>
                            {question.required ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                Required
                              </Badge>
                            ) : (
                              <Badge variant="outline">Optional</Badge>
                            )}
                          </TableCell>
                          <TableCell>{question.order}</TableCell>
                          <TableCell>
                            <Badge variant={question.active ? "default" : "secondary"}>
                              {question.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingQuestion(question);
                                  setIsEditingQuestion(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteProfileQuestionMutation.mutate(question.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Settings
                  </span>
                  <Dialog open={isEditingSetting} onOpenChange={setIsEditingSetting}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingSetting(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Setting
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingSetting ? "Edit System Setting" : "Create System Setting"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveSetting(new FormData(e.currentTarget));
                      }}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="key">Key</Label>
                            <Input
                              id="key"
                              name="key"
                              defaultValue={editingSetting?.key || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="value">Value</Label>
                            <Input
                              id="value"
                              name="value"
                              defaultValue={editingSetting?.value || ""}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              defaultValue={editingSetting?.description || ""}
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <select 
                              name="category" 
                              defaultValue={editingSetting?.category || ""}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              required
                            >
                              <option value="">Select category</option>
                              <option value="general">General</option>
                              <option value="security">Security</option>
                              <option value="email">Email</option>
                              <option value="payment">Payment</option>
                              <option value="notifications">Notifications</option>
                              <option value="integration">Integration</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="dataType">Data Type</Label>
                            <select 
                              name="dataType" 
                              defaultValue={editingSetting?.dataType || ""}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              required
                            >
                              <option value="">Select data type</option>
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="json">JSON</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button type="submit">
                            {editingSetting ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemSettings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-mono">{setting.key}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{setting.value}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{setting.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{setting.dataType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{setting.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingSetting(setting);
                                  setIsEditingSetting(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteSystemSettingMutation.mutate(setting.key)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Event Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsSummary.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Top Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {analyticsSummary[0]?.event || "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Today's Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.filter(a => 
                          new Date(a.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyticsSummary.map((event, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{event.event}</span>
                            <Badge variant="secondary">{event.count} events</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Archive className="w-5 h-5" />
                    Admin Activity Logs
                  </span>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.adminId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.resource}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {log.details ? JSON.stringify(log.details) : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>{log.ipAddress}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}