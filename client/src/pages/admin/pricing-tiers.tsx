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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  Search,
  Crown,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Settings,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";

interface PricingTier {
  id: number;
  name: string;
  price: string;
  annualPrice: string;
  duration: number;
  features: string[];
  active: boolean;
  category: 'talent' | 'manager' | 'producer' | 'agent';
  maxPhotos: number;
  maxVideos: number;
  maxAudio: number;
  maxExternalLinks: number;
  maxStorageGB: number;
  maxProjects: number;
  maxApplications: number;
  hasAnalytics: boolean;
  hasMessaging: boolean;
  hasAIFeatures: boolean;
  hasPrioritySupport: boolean;
  canCreateJobs: boolean;
  canViewProfiles: boolean;
  canExportData: boolean;
  hasSocialFeatures: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PricingTiersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    annualPrice: "",
    duration: 30,
    features: [] as string[],
    active: true,
    category: "talent" as const,
    maxPhotos: 10,
    maxVideos: 5,
    maxAudio: 5,
    maxExternalLinks: 3,
    maxStorageGB: 1,
    maxProjects: 3,
    maxApplications: 10,
    hasAnalytics: false,
    hasMessaging: true,
    hasAIFeatures: false,
    hasPrioritySupport: false,
    canCreateJobs: false,
    canViewProfiles: true,
    canExportData: false,
    hasSocialFeatures: true,
  });

  // Fetch pricing tiers
  const { data: pricingTiers = [], isLoading } = useQuery<PricingTier[]>({
    queryKey: ['/api/admin/pricing-tiers'],
  });

  // Create/Update tier mutation
  const saveTierMutation = useMutation({
    mutationFn: async (tierData: any) => {
      const method = editingTier ? "PUT" : "POST";
      const url = editingTier ? `/api/admin/pricing-tiers/${editingTier.id}` : "/api/admin/pricing-tiers";
      const response = await apiRequest(method, url, tierData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save tier");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingTier(null);
      resetForm();
      toast({
        title: "Success",
        description: `Pricing tier ${editingTier ? 'updated' : 'created'} successfully`,
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

  // Delete tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/pricing-tiers/${tierId}`);
      if (!response.ok) {
        throw new Error("Failed to delete tier");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      toast({
        title: "Success",
        description: "Pricing tier deleted successfully",
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

  // Toggle tier status mutation
  const toggleTierStatusMutation = useMutation({
    mutationFn: async (tier: PricingTier) => {
      const response = await apiRequest("PUT", `/api/admin/pricing-tiers/${tier.id}`, {
        ...tier,
        active: !tier.active
      });
      if (!response.ok) {
        throw new Error("Failed to toggle tier status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      toast({
        title: "Success",
        description: "Tier status updated successfully",
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

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      annualPrice: "",
      duration: 30,
      features: [],
      active: true,
      category: "talent",
      maxPhotos: 10,
      maxVideos: 5,
      maxAudio: 5,
      maxStorageGB: 1,
      maxProjects: 3,
      maxApplications: 10,
      hasAnalytics: false,
      hasMessaging: true,
      hasAIFeatures: false,
      hasPrioritySupport: false,
      canCreateJobs: false,
      canViewProfiles: true,
      canExportData: false,
      hasSocialFeatures: true,
    });
  };

  const handleEdit = (tier: PricingTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      price: tier.price,
      annualPrice: tier.annualPrice,
      duration: tier.duration,
      features: tier.features,
      active: tier.active,
      category: tier.category,
      maxPhotos: tier.maxPhotos,
      maxVideos: tier.maxVideos,
      maxAudio: tier.maxAudio,
      maxExternalLinks: tier.maxExternalLinks,
      maxStorageGB: tier.maxStorageGB,
      maxProjects: tier.maxProjects,
      maxApplications: tier.maxApplications,
      hasAnalytics: tier.hasAnalytics,
      hasMessaging: tier.hasMessaging,
      hasAIFeatures: tier.hasAIFeatures,
      hasPrioritySupport: tier.hasPrioritySupport,
      canCreateJobs: tier.canCreateJobs,
      canViewProfiles: tier.canViewProfiles,
      canExportData: tier.canExportData,
      hasSocialFeatures: tier.hasSocialFeatures,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTierMutation.mutate(formData);
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Filter and sort tiers
  const filteredTiers = pricingTiers
    .filter(tier => {
      const matchesSearch = tier.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? tier.active : !tier.active);
      const matchesPrice = priceFilter === "all" || 
        (priceFilter === "free" && parseFloat(tier.price) === 0) ||
        (priceFilter === "paid" && parseFloat(tier.price) > 0) ||
        (priceFilter === "low" && parseFloat(tier.price) > 0 && parseFloat(tier.price) <= 25) ||
        (priceFilter === "medium" && parseFloat(tier.price) > 25 && parseFloat(tier.price) <= 100) ||
        (priceFilter === "high" && parseFloat(tier.price) > 100);
      const matchesDuration = durationFilter === "all" ||
        (durationFilter === "monthly" && tier.duration === 30) ||
        (durationFilter === "quarterly" && tier.duration === 90) ||
        (durationFilter === "yearly" && tier.duration === 365);
      const matchesCategory = categoryFilter === "all" || tier.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPrice && matchesDuration && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof PricingTier];
      let bValue: any = b[sortBy as keyof PricingTier];
      
      if (sortBy === "price") {
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
      }
      
      if (sortBy === "name") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const formatPrice = (price: string, annualPrice: string) => {
    if (parseFloat(price) === 0) return 'Free';
    const monthly = parseFloat(price);
    const annual = parseFloat(annualPrice);
    const annualSavings = annual > 0 ? ((monthly * 12 - annual) / (monthly * 12) * 100).toFixed(0) : 0;
    
    return (
      <div className="space-y-1">
        <div className="text-2xl font-bold">${monthly.toFixed(2)}/month</div>
        {annual > 0 && (
          <div className="text-sm text-gray-600">
            ${annual.toFixed(2)}/year 
            {annualSavings > 0 && <span className="text-green-600 ml-1">({annualSavings}% off)</span>}
          </div>
        )}
      </div>
    );
  };

  const getTierIcon = (tier: PricingTier) => {
    if (tier.name.toLowerCase().includes('enterprise')) return <Crown className="w-5 h-5 text-purple-500" />;
    if (tier.name.toLowerCase().includes('pro')) return <Star className="w-5 h-5 text-yellow-500" />;
    return <Settings className="w-5 h-5 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pricing Tiers Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage subscription tiers, features, and pricing for your platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <DollarSign className="w-4 h-4 mr-2" />
              {pricingTiers.length} Total Tiers
            </Badge>
            <Button 
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Tier
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Advanced Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div>
                <Label htmlFor="search">Search Tiers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="talent">🎭 Talent</SelectItem>
                    <SelectItem value="manager">👔 Manager</SelectItem>
                    <SelectItem value="producer">🎬 Producer</SelectItem>
                    <SelectItem value="agent">🤝 Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price Range</Label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free ($0)</SelectItem>
                    <SelectItem value="low">Low ($1-$25)</SelectItem>
                    <SelectItem value="medium">Medium ($26-$100)</SelectItem>
                    <SelectItem value="high">High ($100+)</SelectItem>
                    <SelectItem value="paid">All Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                    <SelectItem value="quarterly">Quarterly (90 days)</SelectItem>
                    <SelectItem value="yearly">Yearly (365 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPriceFilter("all");
                    setDurationFilter("all");
                    setCategoryFilter("all");
                    setSortBy("name");
                    setSortOrder("asc");
                  }}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
            
            {/* Sort Order Toggle */}
            <div className="mt-4 flex items-center space-x-2">
              <Label>Sort Order:</Label>
              <Button
                variant={sortOrder === "asc" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOrder("asc")}
              >
                Ascending
              </Button>
              <Button
                variant={sortOrder === "desc" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOrder("desc")}
              >
                Descending
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border-0 shadow-sm">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {filteredTiers.length} of {pricingTiers.length} tiers shown
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
              </span>
            </div>
            {(searchTerm || statusFilter !== "all" || priceFilter !== "all" || durationFilter !== "all" || categoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriceFilter("all");
                  setDurationFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTiers.map((tier) => (
            <Card key={tier.id} className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Tier Header */}
              <div className={`h-2 ${tier.active ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`} />
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant={tier.active ? "default" : "secondary"}>
                  {tier.active ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTierIcon(tier)}
                    <div>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {tier.category === 'talent' && '🎭 Talent'}
                          {tier.category === 'manager' && '👔 Manager'}
                          {tier.category === 'producer' && '🎬 Producer'}
                          {tier.category === 'agent' && '🤝 Agent'}
                        </Badge>
                        <span className="text-sm text-gray-600">{tier.duration} days</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-blue-600">
                  {formatPrice(tier.price, tier.annualPrice)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Features & Permissions</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>📊 Analytics Dashboard</span>
                      {tier.hasAnalytics ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>💬 Messaging System</span>
                      {tier.hasMessaging ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>🤖 AI-Powered Features</span>
                      {tier.hasAIFeatures ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>⚡ Priority Support</span>
                      {tier.hasPrioritySupport ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>🔍 View Profiles</span>
                      {tier.canViewProfiles ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>📝 Create Jobs</span>
                      {tier.canCreateJobs ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>🌟 Social Features</span>
                      {tier.hasSocialFeatures ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Limits</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Photos: {tier.maxPhotos}</div>
                    <div>Videos: {tier.maxVideos}</div>
                    <div>Audio: {tier.maxAudio}</div>
                    <div>Links: {tier.maxExternalLinks}</div>
                    <div>Storage: {tier.maxStorageGB}GB</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTierStatusMutation.mutate(tier)}
                    disabled={toggleTierStatusMutation.isPending}
                  >
                    {tier.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTierMutation.mutate(tier.id)}
                      disabled={deleteTierMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTiers.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tiers Found</h3>
              <p className="text-gray-600 mb-4">
                No pricing tiers match your current filters. Try adjusting your search criteria.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriceFilter("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingTier(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTier ? 'Edit Pricing Tier' : 'Create New Pricing Tier'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Tier Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Professional"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talent">🎭 Talent</SelectItem>
                      <SelectItem value="manager">👔 Manager</SelectItem>
                      <SelectItem value="producer">🎬 Producer</SelectItem>
                      <SelectItem value="agent">🤝 Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="annualPrice">Annual Price ($)</Label>
                  <Input
                    id="annualPrice"
                    type="number"
                    step="0.01"
                    value={formData.annualPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, annualPrice: e.target.value }))}
                    placeholder="0.00 (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for monthly-only plans</p>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              {/* Limits */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Resource Limits</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="maxPhotos">Max Photos</Label>
                    <Input
                      id="maxPhotos"
                      type="number"
                      value={formData.maxPhotos}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxPhotos: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxVideos">Max Videos</Label>
                    <Input
                      id="maxVideos"
                      type="number"
                      value={formData.maxVideos}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxVideos: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAudio">Max Audio</Label>
                    <Input
                      id="maxAudio"
                      type="number"
                      value={formData.maxAudio}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAudio: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxExternalLinks">Max External Links</Label>
                    <Input
                      id="maxExternalLinks"
                      type="number"
                      value={formData.maxExternalLinks}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxExternalLinks: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStorageGB">Storage (GB)</Label>
                    <Input
                      id="maxStorageGB"
                      type="number"
                      value={formData.maxStorageGB}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStorageGB: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              {/* Features & Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Features & Permissions</h3>
                <div className="space-y-6">
                  
                  {/* Analytics & Reporting */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-blue-600">📊 Analytics & Reporting</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="hasAnalytics" className="font-medium">Analytics Dashboard</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">View performance metrics and insights</p>
                        </div>
                        <Switch
                          id="hasAnalytics"
                          checked={formData.hasAnalytics}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasAnalytics: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="canExportData" className="font-medium">Export Data</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Download reports and data exports</p>
                        </div>
                        <Switch
                          id="canExportData"
                          checked={formData.canExportData}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, canExportData: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Communication */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-green-600">💬 Communication</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="hasMessaging" className="font-medium">Messaging System</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Send and receive messages with other users</p>
                        </div>
                        <Switch
                          id="hasMessaging"
                          checked={formData.hasMessaging}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasMessaging: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="hasPrioritySupport" className="font-medium">Priority Support</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Get priority customer support</p>
                        </div>
                        <Switch
                          id="hasPrioritySupport"
                          checked={formData.hasPrioritySupport}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasPrioritySupport: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI & Smart Features */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-purple-600">🤖 AI & Smart Features</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="hasAIFeatures" className="font-medium">AI-Powered Features</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Profile optimization, smart matching, and AI suggestions</p>
                        </div>
                        <Switch
                          id="hasAIFeatures"
                          checked={formData.hasAIFeatures}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasAIFeatures: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Platform Access */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-orange-600">🔍 Platform Access</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="canViewProfiles" className="font-medium">View Talent Profiles</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Browse and view detailed talent profiles</p>
                        </div>
                        <Switch
                          id="canViewProfiles"
                          checked={formData.canViewProfiles}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, canViewProfiles: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="canCreateJobs" className="font-medium">Create Job Posts</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Post jobs and casting calls</p>
                        </div>
                        <Switch
                          id="canCreateJobs"
                          checked={formData.canCreateJobs}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, canCreateJobs: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Features */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-pink-600">🌟 Social Features</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="hasSocialFeatures" className="font-medium">Social Networking</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Create posts, follow others, and engage with the community</p>
                        </div>
                        <Switch
                          id="hasSocialFeatures"
                          checked={formData.hasSocialFeatures}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasSocialFeatures: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingTier(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveTierMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {saveTierMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingTier ? 'Update' : 'Create'} Tier
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}