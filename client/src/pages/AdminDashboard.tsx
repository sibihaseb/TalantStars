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
import { Checkbox } from "@/components/ui/checkbox";
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
  FileBarChart,
  Archive,
  RefreshCw,
  UserPlus,
  Briefcase,
  Clock,
  X,
  Gift,
  ArrowLeft
} from "lucide-react";
import UserLimitsManagement from '@/components/admin/UserLimitsManagement';
import EmailCampaigns from "./admin/email-campaigns";
import AdminPayments from "./AdminPayments";
import AdminUsageAnalytics from "@/components/admin/AdminUsageAnalytics";
import EmailTemplates from "@/components/admin/EmailTemplates";
import DragDropEmailTemplates from "@/components/admin/DragDropEmailTemplates";
import DragDropQuestionsManager from "@/components/admin/DragDropQuestionsManager";
import SeoManagement from "@/components/admin/SeoManagement";
import AutomatedTesting from "@/components/admin/AutomatedTesting";
import TalentCategoriesManagement from "@/components/admin/TalentCategoriesManagement";
import TalentTypeManagement from "@/components/admin/TalentTypeManagement";

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
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
  const [filterFieldType, setFilterFieldType] = useState("all");
  const [filterRequired, setFilterRequired] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isMassEmailDialogOpen, setIsMassEmailDialogOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState({
    'admin-users': false,
    'admin-jobs': false,
    'admin-settings': false,
    'admin-analytics': false,
    'content-create': false,
    'content-edit': false,
    'content-delete': false,
    'content-publish': false,
  });
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [isScheduleMeetingDialogOpen, setIsScheduleMeetingDialogOpen] = useState(false);

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

  const { data: analytics = { userGrowth: [], jobActivity: [], applicationTrends: [], paymentVolume: [] }, isLoading: analyticsLoading } = useQuery<{userGrowth: any[], jobActivity: any[], applicationTrends: any[], paymentVolume: any[]}>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: analyticsSummary = { totalUsers: 0, totalJobs: 0, totalApplications: 0, totalPayments: 0 }, isLoading: summaryLoading } = useQuery<{totalUsers: number; totalJobs: number; totalApplications: number; totalPayments: number}>({
    queryKey: ["/api/admin/analytics/summary"],
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditingUser(false);
      setEditingUser(null);
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: Partial<User> }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}`, userData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditingUser(false);
      setEditingUser(null);
      toast({ title: "Success", description: "User updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Error updating user:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendPasswordResetMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/reset-password`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send password reset");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password reset email sent successfully" });
    },
    onError: (error: Error) => {
      console.error("Error sending password reset:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendMassEmailMutation = useMutation({
    mutationFn: async (emailData: { subject: string; content: string; recipients: string[] }) => {
      const response = await apiRequest("POST", "/api/admin/mass-email", emailData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send mass email");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Mass email sent successfully" });
      setIsMassEmailDialogOpen(false);
      setEmailTemplate("");
      setEmailSubject("");
      setSelectedUserGroups([]);
    },
    onError: (error: Error) => {
      console.error("Error sending mass email:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

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
    const matchesRole = filterRole === "all" || user.role === filterRole;
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

  const handleSaveUser = (formData: FormData) => {
    const userData = {
      ...(editingUser?.id && { id: editingUser.id }),
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      ...(formData.get("password") && { password: formData.get("password") as string }),
    };
    console.log("Saving user:", userData);
    if (editingUser?.id) {
      updateUserMutation.mutate({ userId: editingUser.id, userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const handleSavePermissions = async () => {
    try {
      if (!selectedUserForPermissions) return;
      
      // Create individual permission requests
      const permissionRequests = Object.entries(userPermissions)
        .filter(([_, granted]) => granted)
        .map(([permission, _]) => {
          const [category, action] = permission.split('-');
          return {
            category: category.toUpperCase(),
            action: action.toUpperCase(),
            resource: 'all',
            granted: true
          };
        });

      // Send each permission individually as the API expects
      for (const permissionData of permissionRequests) {
        await apiRequest('POST', `/api/admin/users/${selectedUserForPermissions.id}/permissions`, permissionData);
      }
      
      toast({
        title: "Success",
        description: "Permissions saved successfully",
      });
      
      setIsPermissionsDialogOpen(false);
      setSelectedUserForPermissions(null);
      setUserPermissions({
        'admin-users': false,
        'admin-jobs': false,
        'admin-settings': false,
        'admin-analytics': false,
        'content-create': false,
        'content-edit': false,
        'content-delete': false,
        'content-publish': false,
      });
    } catch (error) {
      console.error("Permissions save error:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Modern Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your platform with comprehensive tools and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Users className="w-4 h-4 mr-2" />
              {users.length} Total Users
            </Badge>
            <Button 
              onClick={() => window.location.href = '/admin/pricing-tiers'}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing Tiers
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/promo-codes'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <Gift className="w-4 h-4 mr-2" />
              Promo Codes
            </Button>
            <Button 
              onClick={() => setIsMassEmailDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              Mass Email
            </Button>
          </div>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg h-fit sticky top-24">
            <div className="space-y-2">
              {/* Core Management */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Core Management</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'overview' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'users' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Users</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'analytics' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>
                </div>
              </div>

              {/* Content Management */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Content Management</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'jobs' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Jobs</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('talent-categories')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'talent-categories' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    <span>Talent Categories</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'questions' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Questions</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('talent-types')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'talent-types' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Talent Types</span>
                  </button>
                </div>
              </div>

              {/* Communication */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Communication</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('emails')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'emails' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Emails</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'templates' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Templates</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'campaigns' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Campaigns</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('meetings')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'meetings' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Meetings</span>
                  </button>
                </div>
              </div>

              {/* Financial */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Financial</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'payments' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Payments</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'pricing' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Pricing</span>
                  </button>
                </div>
              </div>

              {/* System */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">System</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'settings' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('limits')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'limits' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>User Limits</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'seo' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>SEO</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('testing')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'testing' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Testing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          <TabsContent value="overview" className="space-y-6">
            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{totalUsers}</p>
                      <p className="text-xs text-blue-100 mt-1">
                        {verifiedUsers} verified
                      </p>
                    </div>
                    <div className="bg-blue-400/30 p-3 rounded-full">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Active Jobs</p>
                      <p className="text-3xl font-bold">{activeJobs}</p>
                      <p className="text-xs text-green-100 mt-1">
                        {completedJobs} completed
                      </p>
                    </div>
                    <div className="bg-green-400/30 p-3 rounded-full">
                      <Briefcase className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Pricing Tiers</p>
                      <p className="text-3xl font-bold">{activeTiers}</p>
                      <p className="text-xs text-purple-100 mt-1">
                        {pricingTiers.length} total
                      </p>
                    </div>
                    <div className="bg-purple-400/30 p-3 rounded-full">
                      <DollarSign className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Profile Questions</p>
                      <p className="text-3xl font-bold">{profileQuestions.length}</p>
                      <p className="text-xs text-orange-100 mt-1">
                        across all talent types
                      </p>
                    </div>
                    <div className="bg-orange-400/30 p-3 rounded-full">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced User Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Talents</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-blue-500"></div>
                        </div>
                        <span className="text-sm text-gray-600">{talentUsers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Managers</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-1/4 h-full bg-green-500"></div>
                        </div>
                        <span className="text-sm text-gray-600">{managerUsers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Producers</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-1/6 h-full bg-purple-500"></div>
                        </div>
                        <span className="text-sm text-gray-600">{producerUsers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Admins</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-1/12 h-full bg-red-500"></div>
                        </div>
                        <span className="text-sm text-gray-600">{adminUsers}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {analyticsSummary && [
                      { event: "Total Users", count: analyticsSummary.totalUsers },
                      { event: "Total Jobs", count: analyticsSummary.totalJobs },
                      { event: "Total Applications", count: analyticsSummary.totalApplications },
                      { event: "Total Payments", count: analyticsSummary.totalPayments }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.event}</p>
                          <p className="text-xs text-gray-500">{activity.count} total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Messages</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-auto p-4 flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Add User</span>
                  </Button>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-auto p-4 flex flex-col items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    <span className="text-sm">Create Job</span>
                  </Button>
                  <Button 
                    onClick={() => setIsMassEmailDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Mail className="w-6 h-6" />
                    <span className="text-sm">Send Email</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("settings")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <AdminUsageAnalytics />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      setEditingUser(null);
                      setIsEditingUser(true);
                    }}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          await apiRequest("POST", "/api/admin/seed-talents");
                          toast({
                            title: "Success",
                            description: "Talent database seeded successfully",
                          });
                          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to seed talent database",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Seed Talents
                    </Button>
                  </div>
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
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role || "No Role"}
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
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsEditingUser(true);
                                }}
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendPasswordResetMutation.mutate(user.id)}
                                title="Send password reset email"
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUserForPermissions(user);
                                  setIsPermissionsDialogOpen(true);
                                }}
                                title="Manage permissions"
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteUserMutation.mutate(user.id)}
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

            {/* User Create/Edit Dialog */}
            <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Edit User' : 'Create User'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveUser(new FormData(e.currentTarget));
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        name="email"
                        type="email"
                        defaultValue={editingUser?.email || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        name="firstName"
                        defaultValue={editingUser?.firstName || ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        name="lastName"
                        defaultValue={editingUser?.lastName || ""}
                        required
                      />
                    </div>
                    {!editingUser && (
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          name="password"
                          type="password"
                          placeholder="Enter password for new user"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <select 
                        name="role" 
                        defaultValue={editingUser?.role || ""}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select role</option>
                        <option value="talent">Talent</option>
                        <option value="producer">Producer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsEditingUser(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Update User' : 'Create User'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* User Permissions Dialog */}
            <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Manage Permissions - {selectedUserForPermissions?.firstName} {selectedUserForPermissions?.lastName}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Admin Permissions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="admin-users" 
                            checked={userPermissions['admin-users']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'admin-users': e.target.checked})}
                          />
                          <Label htmlFor="admin-users">Manage Users</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="admin-jobs" 
                            checked={userPermissions['admin-jobs']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'admin-jobs': e.target.checked})}
                          />
                          <Label htmlFor="admin-jobs">Manage Jobs</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="admin-settings" 
                            checked={userPermissions['admin-settings']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'admin-settings': e.target.checked})}
                          />
                          <Label htmlFor="admin-settings">System Settings</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="admin-analytics" 
                            checked={userPermissions['admin-analytics']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'admin-analytics': e.target.checked})}
                          />
                          <Label htmlFor="admin-analytics">View Analytics</Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Content Permissions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="content-create" 
                            checked={userPermissions['content-create']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'content-create': e.target.checked})}
                          />
                          <Label htmlFor="content-create">Create Content</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="content-edit" 
                            checked={userPermissions['content-edit']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'content-edit': e.target.checked})}
                          />
                          <Label htmlFor="content-edit">Edit Content</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="content-delete" 
                            checked={userPermissions['content-delete']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'content-delete': e.target.checked})}
                          />
                          <Label htmlFor="content-delete">Delete Content</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="content-publish" 
                            checked={userPermissions['content-publish']}
                            onChange={(e) => setUserPermissions({...userPermissions, 'content-publish': e.target.checked})}
                          />
                          <Label htmlFor="content-publish">Publish Content</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={() => handleSavePermissions()}>
                      Save Permissions
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingJob ? 'Edit Job' : 'Create Job'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveJob(new FormData(e.currentTarget));
                }}>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
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
                    
                    {/* Entertainment Industry Specific Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectType">Project Type</Label>
                        <select 
                          name="projectType" 
                          defaultValue={editingJob?.projectType || ""}
                          onChange={(e) => setSelectedProjectType(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select project type</option>
                          <option value="feature-film">Feature Film</option>
                          <option value="short-film">Short Film</option>
                          <option value="tv-series">TV Series</option>
                          <option value="commercial">Commercial</option>
                          <option value="music-video">Music Video</option>
                          <option value="documentary">Documentary</option>
                          <option value="theater">Theater</option>
                          <option value="web-series">Web Series</option>
                          <option value="animation">Animation/Voice Over</option>
                          <option value="live-event">Live Event</option>
                          <option value="photo-shoot">Photo Shoot</option>
                          <option value="modeling">Modeling</option>
                          <option value="recording">Recording Session</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="genre">Genre</Label>
                        <select 
                          name="genre" 
                          defaultValue={editingJob?.genre || ""}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select genre</option>
                          {/* Dynamic options based on project type */}
                          {selectedProjectType === "modeling" ? (
                            <>
                              <option value="fashion">Fashion</option>
                              <option value="commercial">Commercial</option>
                              <option value="editorial">Editorial</option>
                              <option value="runway">Runway</option>
                              <option value="beauty">Beauty</option>
                              <option value="lifestyle">Lifestyle</option>
                              <option value="fitness">Fitness</option>
                              <option value="swimwear">Swimwear</option>
                              <option value="lingerie">Lingerie</option>
                              <option value="catalog">Catalog</option>
                              <option value="plus-size">Plus Size</option>
                              <option value="mature">Mature</option>
                              <option value="parts">Parts (Hands/Feet)</option>
                            </>
                          ) : (
                            <>
                              <option value="drama">Drama</option>
                              <option value="comedy">Comedy</option>
                              <option value="action">Action</option>
                              <option value="thriller">Thriller</option>
                              <option value="horror">Horror</option>
                              <option value="romance">Romance</option>
                              <option value="sci-fi">Sci-Fi</option>
                              <option value="fantasy">Fantasy</option>
                              <option value="documentary">Documentary</option>
                              <option value="musical">Musical</option>
                              <option value="animation">Animation</option>
                              <option value="reality">Reality TV</option>
                              <option value="other">Other</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ageRange">Age Range</Label>
                        <Input
                          name="ageRange"
                          defaultValue={editingJob?.ageRange || ""}
                          placeholder="e.g., 25-35"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select 
                          name="gender" 
                          defaultValue={editingJob?.gender || ""}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Any</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-Binary</option>
                          <option value="any">Any</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="ethnicity">Ethnicity</Label>
                        <select 
                          name="ethnicity" 
                          defaultValue={editingJob?.ethnicity || ""}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Any</option>
                          <option value="white">White</option>
                          <option value="black">Black/African American</option>
                          <option value="hispanic">Hispanic/Latino</option>
                          <option value="asian">Asian</option>
                          <option value="native-american">Native American</option>
                          <option value="pacific-islander">Pacific Islander</option>
                          <option value="middle-eastern">Middle Eastern</option>
                          <option value="mixed">Mixed/Multi-racial</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payRate">Pay Rate</Label>
                        <select 
                          name="payRate" 
                          defaultValue={editingJob?.payRate || ""}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select pay rate</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="project">Project Rate</option>
                          <option value="deferred">Deferred</option>
                          <option value="copy-credit">Copy, Credit & Meals</option>
                          <option value="stipend">Stipend</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <select 
                          name="experienceLevel" 
                          defaultValue={editingJob?.experienceLevel || ""}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Any level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="professional">Professional</option>
                          <option value="expert">Expert/Celebrity</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shootingDays">Shooting Days</Label>
                        <Input
                          type="number"
                          name="shootingDays"
                          defaultValue={editingJob?.shootingDays || ""}
                          placeholder="Number of days"
                        />
                      </div>
                      <div>
                        <Label htmlFor="applicationDeadline">Application Deadline</Label>
                        <Input
                          type="date"
                          name="applicationDeadline"
                          defaultValue={editingJob?.applicationDeadline || ""}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="specialSkills">Special Skills/Requirements</Label>
                      <Textarea
                        name="specialSkills"
                        defaultValue={editingJob?.specialSkills || ""}
                        placeholder="e.g., Martial arts, singing, dancing, accents, specific looks, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="wardrobe">Wardrobe/Costume Notes</Label>
                      <Textarea
                        name="wardrobe"
                        defaultValue={editingJob?.wardrobe || ""}
                        placeholder="What should talent bring or expect for wardrobe?"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isUnion"
                          defaultChecked={editingJob?.isUnion}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isUnion">Union Project (SAG-AFTRA)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="providesTransport"
                          defaultChecked={editingJob?.providesTransport}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="providesTransport">Transportation Provided</Label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="providesMeals"
                          defaultChecked={editingJob?.providesMeals}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="providesMeals">Meals Provided</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="providesAccommodation"
                          defaultChecked={editingJob?.providesAccommodation}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="providesAccommodation">Accommodation Provided</Label>
                      </div>
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
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t bg-white dark:bg-gray-800 sticky bottom-0">
                    <Button type="button" variant="outline" onClick={() => setIsEditingJob(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Meeting Scheduling Dialog */}
            <Dialog open={isScheduleMeetingDialogOpen} onOpenChange={setIsScheduleMeetingDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const meetingData = {
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    attendeeId: parseInt(formData.get('attendeeId') as string),
                    meetingDate: formData.get('meetingDate') as string,
                    meetingTime: formData.get('meetingTime') as string,
                    duration: parseInt(formData.get('duration') as string),
                    type: formData.get('type') as string,
                    location: formData.get('location') as string,
                    notes: formData.get('notes') as string,
                  };
                  
                  // Create meeting mutation would go here
                  console.log('Creating meeting:', meetingData);
                  toast({
                    title: "Success",
                    description: "Meeting scheduled successfully",
                  });
                  setIsScheduleMeetingDialogOpen(false);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Meeting Title</Label>
                      <Input name="title" id="title" required />
                    </div>
                    <div>
                      <Label htmlFor="attendeeId">Attendee</Label>
                      <select 
                        name="attendeeId" 
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select attendee</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" id="description" required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="meetingDate">Date</Label>
                      <Input name="meetingDate" id="meetingDate" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="meetingTime">Time</Label>
                      <Input name="meetingTime" id="meetingTime" type="time" required />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input name="duration" id="duration" type="number" min="15" max="480" defaultValue="60" required />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Meeting Type</Label>
                    <select 
                      name="type" 
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select meeting type</option>
                      <option value="virtual">Virtual Meeting</option>
                      <option value="in_person">In-Person Meeting</option>
                      <option value="phone">Phone Call</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location/Platform</Label>
                    <Input name="location" id="location" placeholder="e.g., Zoom, Studio Address, etc." required />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea name="notes" id="notes" placeholder="Any additional notes for the meeting..." />
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsScheduleMeetingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Schedule Meeting
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Meeting Management
                  </span>
                  <Button onClick={() => setIsScheduleMeetingDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Talent Interview</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Scheduled</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Jane Doe</p>
                      <p className="text-sm text-gray-600 mb-1">July 15, 2025 at 2:00 PM</p>
                      <p className="text-sm text-gray-600 mb-3">Virtual - Zoom</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Producer Meeting</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Confirmed</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Project X Discussion</p>
                      <p className="text-sm text-gray-600 mb-1">July 16, 2025 at 10:00 AM</p>
                      <p className="text-sm text-gray-600 mb-3">In-Person - Studio A, Los Angeles</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Manager Check-in</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Team Review</p>
                      <p className="text-sm text-gray-600 mb-1">July 17, 2025 at 3:30 PM</p>
                      <p className="text-sm text-gray-600 mb-3">Virtual - Google Meet</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Meeting Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700">Total Meetings</p>
                        <p className="text-2xl font-bold text-blue-900">24</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Completed</p>
                        <p className="text-2xl font-bold text-green-900">18</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-yellow-700">Upcoming</p>
                        <p className="text-2xl font-bold text-yellow-900">6</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-700">Cancelled</p>
                        <p className="text-2xl font-bold text-red-900">2</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <DragDropEmailTemplates />
          </TabsContent>

          <TabsContent value="emails" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Email Management</h3>
                  <p className="text-sm text-gray-600">Send individual emails and manage email configuration</p>
                </div>
                <Button onClick={() => setIsMassEmailDialogOpen(true)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Mass Email
                </Button>
              </div>
              
              {/* Email Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Sent</p>
                        <p className="text-2xl font-bold">2,847</p>
                      </div>
                      <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Delivered</p>
                        <p className="text-2xl font-bold">2,782</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Bounced</p>
                        <p className="text-2xl font-bold">65</p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                        <p className="text-2xl font-bold">97.7%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Mass Email Dialog */}
              <Dialog open={isMassEmailDialogOpen} onOpenChange={setIsMassEmailDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Mass Email</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    sendMassEmailMutation.mutate({
                      subject: emailSubject,
                      message: emailTemplate,
                      targetGroups: selectedUserGroups
                    });
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Enter email subject"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email-template">Message</Label>
                      <Textarea
                        id="email-template"
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        placeholder="Enter your email message"
                        rows={8}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label>Target Audience</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="all-users"
                              checked={selectedUserGroups.includes("all")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(["all"]);
                                } else {
                                  setSelectedUserGroups([]);
                                }
                              }}
                            />
                            <Label htmlFor="all-users" className="text-sm">All Users</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="managers"
                              checked={selectedUserGroups.includes("manager")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "manager"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "manager"));
                                }
                              }}
                            />
                            <Label htmlFor="managers" className="text-sm">Managers</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="producers"
                              checked={selectedUserGroups.includes("producer")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "producer"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "producer"));
                                }
                              }}
                            />
                            <Label htmlFor="producers" className="text-sm">Producers</Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="talents"
                              checked={selectedUserGroups.includes("talent")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "talent"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "talent"));
                                }
                              }}
                            />
                            <Label htmlFor="talents" className="text-sm">All Talents</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="actors"
                              checked={selectedUserGroups.includes("actor")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "actor"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "actor"));
                                }
                              }}
                            />
                            <Label htmlFor="actors" className="text-sm">Actors</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="musicians"
                              checked={selectedUserGroups.includes("musician")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "musician"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "musician"));
                                }
                              }}
                            />
                            <Label htmlFor="musicians" className="text-sm">Musicians</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="voice_artists"
                              checked={selectedUserGroups.includes("voice_artist")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "voice_artist"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "voice_artist"));
                                }
                              }}
                            />
                            <Label htmlFor="voice_artists" className="text-sm">Voice Artists</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="models"
                              checked={selectedUserGroups.includes("model")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "model"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "model"));
                                }
                              }}
                            />
                            <Label htmlFor="models" className="text-sm">Models</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="agents"
                              checked={selectedUserGroups.includes("agent")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "agent"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "agent"));
                                }
                              }}
                            />
                            <Label htmlFor="agents" className="text-sm">Agents</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="verified"
                              checked={selectedUserGroups.includes("verified")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "verified"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "verified"));
                                }
                              }}
                            />
                            <Label htmlFor="verified" className="text-sm">Verified Users</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="premium"
                              checked={selectedUserGroups.includes("premium")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "premium"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "premium"));
                                }
                              }}
                            />
                            <Label htmlFor="premium" className="text-sm">Premium Users</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="new_users"
                              checked={selectedUserGroups.includes("new_users")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "new_users"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "new_users"));
                                }
                              }}
                            />
                            <Label htmlFor="new_users" className="text-sm">New Users (Last 30 Days)</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsMassEmailDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={sendMassEmailMutation.isPending}>
                        {sendMassEmailMutation.isPending ? "Sending..." : "Send Email"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <EmailCampaigns />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Mass Email System
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-subject" className="text-sm font-medium">Email Subject</Label>
                      <Input
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Target Audience</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="all-users"
                              checked={selectedUserGroups.includes("all")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(["all"]);
                                } else {
                                  setSelectedUserGroups([]);
                                }
                              }}
                            />
                            <Label htmlFor="all-users" className="text-sm">All Users</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="admins"
                              checked={selectedUserGroups.includes("admin")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "admin"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "admin"));
                                }
                              }}
                            />
                            <Label htmlFor="admins" className="text-sm">Admins</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="managers"
                              checked={selectedUserGroups.includes("manager")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "manager"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "manager"));
                                }
                              }}
                            />
                            <Label htmlFor="managers" className="text-sm">Managers</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="producers"
                              checked={selectedUserGroups.includes("producer")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "producer"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "producer"));
                                }
                              }}
                            />
                            <Label htmlFor="producers" className="text-sm">Producers</Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="talents"
                              checked={selectedUserGroups.includes("talent")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "talent"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "talent"));
                                }
                              }}
                            />
                            <Label htmlFor="talents" className="text-sm">All Talents</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="actors"
                              checked={selectedUserGroups.includes("actor")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "actor"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "actor"));
                                }
                              }}
                            />
                            <Label htmlFor="actors" className="text-sm">Actors</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="musicians"
                              checked={selectedUserGroups.includes("musician")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "musician"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "musician"));
                                }
                              }}
                            />
                            <Label htmlFor="musicians" className="text-sm">Musicians</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="voice_artists"
                              checked={selectedUserGroups.includes("voice_artist")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "voice_artist"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "voice_artist"));
                                }
                              }}
                            />
                            <Label htmlFor="voice_artists" className="text-sm">Voice Artists</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="models"
                              checked={selectedUserGroups.includes("model")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "model"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "model"));
                                }
                              }}
                            />
                            <Label htmlFor="models" className="text-sm">Models</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="agents"
                              checked={selectedUserGroups.includes("agent")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "agent"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "agent"));
                                }
                              }}
                            />
                            <Label htmlFor="agents" className="text-sm">Agents</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="verified"
                              checked={selectedUserGroups.includes("verified")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "verified"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "verified"));
                                }
                              }}
                            />
                            <Label htmlFor="verified" className="text-sm">Verified Users</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="premium"
                              checked={selectedUserGroups.includes("premium")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "premium"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "premium"));
                                }
                              }}
                            />
                            <Label htmlFor="premium" className="text-sm">Premium Users</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="new_users"
                              checked={selectedUserGroups.includes("new_users")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "new_users"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "new_users"));
                                }
                              }}
                            />
                            <Label htmlFor="new_users" className="text-sm">New Users (Last 30 Days)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="musicians"
                              checked={selectedUserGroups.includes("musician")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "musician"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "musician"));
                                }
                              }}
                            />
                            <Label htmlFor="musicians" className="text-sm">Musicians</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="voice-artists"
                              checked={selectedUserGroups.includes("voice_artist")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "voice_artist"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "voice_artist"));
                                }
                              }}
                            />
                            <Label htmlFor="voice-artists" className="text-sm">Voice Artists</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="models"
                              checked={selectedUserGroups.includes("model")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "model"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "model"));
                                }
                              }}
                            />
                            <Label htmlFor="models" className="text-sm">Models</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="writers"
                              checked={selectedUserGroups.includes("writer")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "writer"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "writer"));
                                }
                              }}
                            />
                            <Label htmlFor="writers" className="text-sm">Writers</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="directors"
                              checked={selectedUserGroups.includes("director")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "director"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "director"));
                                }
                              }}
                            />
                            <Label htmlFor="directors" className="text-sm">Directors</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="cinematographers"
                              checked={selectedUserGroups.includes("cinematographer")}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUserGroups(prev => [...prev.filter(g => g !== "all"), "cinematographer"]);
                                } else {
                                  setSelectedUserGroups(prev => prev.filter(g => g !== "cinematographer"));
                                }
                              }}
                            />
                            <Label htmlFor="cinematographers" className="text-sm">Cinematographers</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email-template" className="text-sm font-medium">Email Content</Label>
                      <Textarea
                        id="email-template"
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        placeholder="Enter your email content here..."
                        className="mt-1 min-h-[200px]"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Recipients: {selectedUserGroups.includes("all") ? users.length : 
                          users.filter(user => 
                            selectedUserGroups.includes(user.role) || 
                            selectedUserGroups.includes(user.profile?.talentType || "")
                          ).length
                        }
                      </div>
                      <Button
                        onClick={() => {
                          const recipients = selectedUserGroups.includes("all") 
                            ? users.map(u => u.email) 
                            : users.filter(user => 
                                selectedUserGroups.includes(user.role) || 
                                selectedUserGroups.includes(user.profile?.talentType || "")
                              ).map(u => u.email);
                          
                          sendMassEmailMutation.mutate({
                            subject: emailSubject,
                            content: emailTemplate,
                            recipients
                          });
                        }}
                        disabled={!emailSubject || !emailTemplate || selectedUserGroups.length === 0 || sendMassEmailMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {sendMassEmailMutation.isPending ? "Sending..." : "Send Email"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <FileBarChart className="w-5 h-5" />
                    Email Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">847</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Emails Sent</div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">92.5%</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Delivery Rate</div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">68.3%</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">Open Rate</div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">24.7%</div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">Click Rate</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Recent Email Campaigns</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <div className="font-medium">Welcome New Talents</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Sent to 127 users</div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Delivered</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <div className="font-medium">Monthly Newsletter</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Sent to 543 users</div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Sending</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <div className="font-medium">Job Opportunities</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Sent to 89 users</div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Delivered</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <DragDropQuestionsManager />
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl" style={{ display: 'none' }}>
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Profile Questions Management
                  </span>
                  <Dialog open={isEditingQuestion} onOpenChange={setIsEditingQuestion}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setEditingQuestion(null)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
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
                              <option value="">Select question category</option>
                              <optgroup label="General">
                                <option value="profile">Profile (General)</option>
                              </optgroup>
                              <optgroup label="Talent Types">
                                <option value="actor">Actor</option>
                                <option value="musician">Musician</option>
                                <option value="voice_artist">Voice Artist</option>
                                <option value="model">Model</option>
                                <option value="writer">Writer</option>
                                <option value="director">Director</option>
                                <option value="cinematographer">Cinematographer</option>
                              </optgroup>
                              <optgroup label="Professional Roles">
                                <option value="manager">Manager</option>
                                <option value="agent">Agent</option>
                                <option value="producer">Producer</option>
                              </optgroup>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="question">Question</Label>
                            <Input
                              id="question"
                              name="question"
                              defaultValue={editingQuestion?.question || ""}
                              placeholder="Enter the question to ask users..."
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="fieldName">Field Name</Label>
                            <Input
                              id="fieldName"
                              name="fieldName"
                              defaultValue={editingQuestion?.fieldName || ""}
                              placeholder="e.g., experience_years, height, vocal_range"
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
                              <option value="radio">Radio</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="email">Email</option>
                              <option value="url">URL</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="options">Options (one per line, for select/multiselect)</Label>
                            <Textarea
                              id="options"
                              name="options"
                              defaultValue={editingQuestion?.options?.join("\n") || ""}
                              placeholder="Option 1\nOption 2\nOption 3"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="order">Order</Label>
                            <Input
                              id="order"
                              name="order"
                              type="number"
                              defaultValue={editingQuestion?.order || 0}
                              placeholder="Display order (0 = first)"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="required"
                              name="required"
                              defaultChecked={editingQuestion?.required ?? false}
                            />
                            <Label htmlFor="required">Required Field</Label>
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
                        <div className="flex justify-end mt-6 gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsEditingQuestion(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingQuestion ? "Update Question" : "Create Question"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {questionsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-600">Loading questions...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Questions by Category */}
                  {/* Filter and Search */}
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex-1">
                      <Input
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    
                    {/* Talent Type Filter */}
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="profile">Profile (General)</SelectItem>
                        <SelectItem value="actor">Actor</SelectItem>
                        <SelectItem value="musician">Musician</SelectItem>
                        <SelectItem value="voice_artist">Voice Artist</SelectItem>
                        <SelectItem value="model">Model</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="producer">Producer</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Field Type Filter */}
                    <Select value={filterFieldType} onValueChange={setFilterFieldType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fields</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="multiselect">Multi-select</SelectItem>
                        <SelectItem value="radio">Radio</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Required Filter */}
                    <Select value={filterRequired} onValueChange={setFilterRequired}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Required" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Questions</SelectItem>
                        <SelectItem value="required">Required Only</SelectItem>
                        <SelectItem value="optional">Optional Only</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Active Status Filter */}
                    <Select value={filterActive} onValueChange={setFilterActive}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Clear Filters Button */}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setFilterRole("all");
                        setFilterFieldType("all");
                        setFilterRequired("all");
                        setFilterActive("all");
                      }}
                      className="whitespace-nowrap"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>

                  {/* Questions Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    {['profile', 'actor', 'musician', 'voice_artist', 'model', 'total'].map(type => {
                      const count = type === 'total' 
                        ? profileQuestions.filter(q => 
                            (filterRole === 'all' || filterRole === q.talentType) &&
                            (filterFieldType === 'all' || filterFieldType === q.fieldType) &&
                            (filterRequired === 'all' || 
                              (filterRequired === 'required' && q.required) ||
                              (filterRequired === 'optional' && !q.required)) &&
                            (filterActive === 'all' || 
                              (filterActive === 'active' && q.active) ||
                              (filterActive === 'inactive' && !q.active)) &&
                            (searchTerm === '' || 
                              q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              q.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              q.fieldType.toLowerCase().includes(searchTerm.toLowerCase()))
                          ).length
                        : profileQuestions.filter(q => 
                            q.talentType === type && 
                            (filterRole === 'all' || filterRole === q.talentType) &&
                            (filterFieldType === 'all' || filterFieldType === q.fieldType) &&
                            (filterRequired === 'all' || 
                              (filterRequired === 'required' && q.required) ||
                              (filterRequired === 'optional' && !q.required)) &&
                            (filterActive === 'all' || 
                              (filterActive === 'active' && q.active) ||
                              (filterActive === 'inactive' && !q.active)) &&
                            (searchTerm === '' || 
                              q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              q.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              q.fieldType.toLowerCase().includes(searchTerm.toLowerCase()))
                          ).length;
                      
                      return (
                        <div key={type} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-gray-800 dark:text-white">{count}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {type === 'total' ? 'Total' : type === 'voice_artist' ? 'Voice Artist' : type}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Questions organized by talent type */}
                  {['profile', 'actor', 'musician', 'voice_artist', 'model'].map(talentType => {
                    const typeQuestions = profileQuestions.filter(q => 
                      q.talentType === talentType && 
                      (filterRole === 'all' || filterRole === talentType) &&
                      (filterFieldType === 'all' || filterFieldType === q.fieldType) &&
                      (filterRequired === 'all' || 
                        (filterRequired === 'required' && q.required) ||
                        (filterRequired === 'optional' && !q.required)) &&
                      (filterActive === 'all' || 
                        (filterActive === 'active' && q.active) ||
                        (filterActive === 'inactive' && !q.active)) &&
                      (searchTerm === '' || 
                        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        q.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        q.fieldType.toLowerCase().includes(searchTerm.toLowerCase()))
                    );
                    
                    if (typeQuestions.length === 0) return null;
                    
                    return (
                      <div key={talentType} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                          {talentType === 'profile' && <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Profile Questions</span>}
                          {talentType === 'actor' && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Actor Questions</span>}
                          {talentType === 'musician' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Musician Questions</span>}
                          {talentType === 'voice_artist' && <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Voice Artist Questions</span>}
                          {talentType === 'model' && <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">Model Questions</span>}
                          <span className="text-sm text-gray-600">({typeQuestions.length})</span>
                        </h3>
                        
                        <div className="space-y-2">
                          {typeQuestions.sort((a, b) => a.order - b.order).map((question) => (
                            <div 
                              key={question.id} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{question.question}</span>
                                  {question.required && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                                      Required
                                    </Badge>
                                  )}
                                  {!question.active && (
                                    <Badge variant="secondary" className="text-xs">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-4">
                                  <span>Field: <code className="bg-gray-100 px-1 rounded">{question.fieldName}</code></span>
                                  <span>Type: <Badge variant="secondary" className="text-xs">{question.fieldType}</Badge></span>
                                  <span>Order: {question.order}</span>
                                  {question.options && question.options.length > 0 && (
                                    <span>Options: {question.options.slice(0, 2).join(', ')}{question.options.length > 2 ? '...' : ''}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingQuestion(question);
                                    setIsEditingQuestion(true);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this question?')) {
                                      deleteProfileQuestionMutation.mutate(question.id);
                                    }
                                  }}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {profileQuestions.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No questions found</h3>
                      <p className="text-gray-500 mb-4">Create your first profile question to get started.</p>
                      <Button 
                        onClick={() => {
                          setEditingQuestion(null);
                          setIsEditingQuestion(true);
                        }}
                        className="bg-gradient-to-r from-indigo-500 to-blue-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Question
                      </Button>
                    </div>
                  )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Session Duration Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Session Duration Management
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Control how long users can stay logged in before being automatically logged out
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="session-duration">Session Duration (hours)</Label>
                      <p className="text-sm text-gray-500">
                        Current: {systemSettings.find(s => s.key === 'session_duration_hours')?.value || '48'} hours
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="session-duration"
                        type="number"
                        min="1"
                        max="168"
                        defaultValue={systemSettings.find(s => s.key === 'session_duration_hours')?.value || '48'}
                        className="w-20"
                        onChange={(e) => {
                          const hours = parseInt(e.target.value);
                          if (hours >= 1 && hours <= 168) {
                            saveSystemSettingMutation.mutate({
                              key: 'session_duration_hours',
                              value: e.target.value,
                              description: `User session duration in hours. Users will be automatically logged out after ${hours} hours of inactivity.`,
                              category: 'security'
                            });
                          }
                        }}
                      />
                      <span className="text-sm text-gray-500">hours</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>• Minimum: 1 hour, Maximum: 168 hours (7 days)</p>
                    <p>• Default: 48 hours (2 days)</p>
                    <p>• Changes take effect for new login sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <CardTitle className="text-sm">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsSummary.totalUsers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsSummary.totalJobs}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsSummary.totalApplications}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsSummary.totalPayments}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Platform Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Users", value: analyticsSummary.totalUsers },
                      { name: "Jobs", value: analyticsSummary.totalJobs },
                      { name: "Applications", value: analyticsSummary.totalApplications },
                      { name: "Payments", value: analyticsSummary.totalPayments }
                    ].map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="secondary">{item.value} total</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <AdminPayments />
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

          <TabsContent value="seo" className="space-y-6">
            <SeoManagement />
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <AutomatedTesting />
          </TabsContent>

          <TabsContent value="talent-categories" className="space-y-6">
            <TalentCategoriesManagement />
          </TabsContent>

          <TabsContent value="talent-types" className="space-y-6">
            <TalentTypeManagement />
          </TabsContent>

          <TabsContent value="limits" className="space-y-6">
            <UserLimitsManagement />
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}