import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Tag,
  Users,
  Calendar,
  TrendingUp,
  Gift,
  Percent,
  DollarSign,
  Clock,
  Target,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface PromoCode {
  id: number;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed_amount" | "first_month_free" | "first_month_discount";
  value: string;
  active: boolean;
  maxUses: number | null;
  maxUsesPerUser: number;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  planRestriction: "monthly_only" | "annual_only" | "no_restriction" | "specific_tier" | null;
  categoryRestriction: "talent" | "manager" | "producer" | "agent" | null;
  specificTierId: number | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface PromoCodeUsage {
  id: number;
  promoCodeId: number;
  userId: number;
  usedAt: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface PricingTier {
  id: number;
  name: string;
  category: string;
  price: number;
  annualPrice: number;
}

const PromoCodeManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showUsage, setShowUsage] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as const,
    value: "",
    active: true,
    maxUses: "",
    maxUsesPerUser: "1",
    startsAt: "",
    expiresAt: "",
    planRestriction: "no_restriction" as const,
    categoryRestriction: "",
    specificTierId: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ["/api/admin/promo-codes"],
  });

  const { data: pricingTiers = [] } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/pricing-tiers"],
  });

  const { data: promoCodeUsage = [] } = useQuery({
    queryKey: ["/api/admin/promo-codes", showUsage, "usage"],
    enabled: showUsage !== null,
  });

  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/promo-codes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promo code created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive",
      });
    },
  });

  const updatePromoCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/promo-codes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promo code updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setIsDialogOpen(false);
      setEditingPromoCode(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update promo code",
        variant: "destructive",
      });
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/promo-codes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete promo code",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: "",
      active: true,
      maxUses: "",
      maxUsesPerUser: "1",
      startsAt: "",
      expiresAt: "",
      planRestriction: "no_restriction",
      categoryRestriction: "",
      specificTierId: ""
    });
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      name: promoCode.name,
      description: promoCode.description,
      type: promoCode.type,
      value: promoCode.value,
      active: promoCode.active,
      maxUses: promoCode.maxUses?.toString() || "",
      maxUsesPerUser: promoCode.maxUsesPerUser.toString(),
      startsAt: promoCode.startsAt ? format(new Date(promoCode.startsAt), "yyyy-MM-dd'T'HH:mm") : "",
      expiresAt: promoCode.expiresAt ? format(new Date(promoCode.expiresAt), "yyyy-MM-dd'T'HH:mm") : "",
      planRestriction: promoCode.planRestriction || "no_restriction",
      categoryRestriction: promoCode.categoryRestriction || "",
      specificTierId: promoCode.specificTierId?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      maxUsesPerUser: parseInt(formData.maxUsesPerUser),
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      planRestriction: formData.planRestriction === "no_restriction" ? null : formData.planRestriction,
      categoryRestriction: formData.categoryRestriction || null,
      specificTierId: formData.specificTierId ? parseInt(formData.specificTierId) : null
    };

    if (editingPromoCode) {
      updatePromoCodeMutation.mutate({ id: editingPromoCode.id, data: submitData });
    } else {
      createPromoCodeMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      deletePromoCodeMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPromoCode(null);
    resetForm();
  };

  const filteredPromoCodes = promoCodes.filter((promoCode: PromoCode) => {
    const matchesSearch = promoCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promoCode.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || promoCode.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && promoCode.active) ||
                         (filterStatus === "inactive" && !promoCode.active);
    const matchesCategory = filterCategory === "all" || promoCode.categoryRestriction === filterCategory;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed_amount":
        return <DollarSign className="h-4 w-4" />;
      case "first_month_free":
        return <Gift className="h-4 w-4" />;
      case "first_month_discount":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "bg-blue-100 text-blue-800";
      case "fixed_amount":
        return "bg-green-100 text-green-800";
      case "first_month_free":
        return "bg-purple-100 text-purple-800";
      case "first_month_discount":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDiscount = (type: string, value: string) => {
    switch (type) {
      case "percentage":
        return `${value}% off`;
      case "fixed_amount":
        return `$${value} off`;
      case "first_month_free":
        return "First month free";
      case "first_month_discount":
        return `${value}% off first month`;
      default:
        return value;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promo Code Management</h1>
          <p className="text-muted-foreground">
            Create and manage promotional codes for your platform
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromoCode ? "Edit Promo Code" : "Create New Promo Code"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., WELCOME20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Discount"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the promo code"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Discount Type *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                      <SelectItem value="first_month_free">First Month Free</SelectItem>
                      <SelectItem value="first_month_discount">First Month Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === "percentage" ? "20" : "10.00"}
                    type="number"
                    step={formData.type === "percentage" ? "1" : "0.01"}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUses">Max Total Uses</Label>
                  <Input
                    id="maxUses"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    type="number"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsesPerUser">Max Uses Per User *</Label>
                  <Input
                    id="maxUsesPerUser"
                    value={formData.maxUsesPerUser}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                    type="number"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startsAt">Start Date</Label>
                  <Input
                    id="startsAt"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    type="datetime-local"
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">End Date</Label>
                  <Input
                    id="expiresAt"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    type="datetime-local"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planRestriction">Plan Restriction</Label>
                  <Select value={formData.planRestriction} onValueChange={(value: any) => setFormData({ ...formData, planRestriction: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_restriction">No Restriction</SelectItem>
                      <SelectItem value="monthly_only">Monthly Plans Only</SelectItem>
                      <SelectItem value="annual_only">Annual Plans Only</SelectItem>
                      <SelectItem value="specific_tier">Specific Tier Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoryRestriction">Category Restriction</Label>
                  <Select value={formData.categoryRestriction} onValueChange={(value: any) => setFormData({ ...formData, categoryRestriction: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_restriction">No Restriction</SelectItem>
                      <SelectItem value="talent">Talent Only</SelectItem>
                      <SelectItem value="manager">Manager Only</SelectItem>
                      <SelectItem value="producer">Producer Only</SelectItem>
                      <SelectItem value="agent">Agent Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.planRestriction === "specific_tier" && (
                <div>
                  <Label htmlFor="specificTierId">Specific Tier</Label>
                  <Select value={formData.specificTierId} onValueChange={(value: any) => setFormData({ ...formData, specificTierId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id.toString()}>
                          {tier.name} ({tier.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPromoCodeMutation.isPending || updatePromoCodeMutation.isPending}>
                  {editingPromoCode ? "Update" : "Create"} Promo Code
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
            <SelectItem value="first_month_free">First Month Free</SelectItem>
            <SelectItem value="first_month_discount">First Month Discount</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="talent">Talent</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="producer">Producer</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPromoCodes.length} of {promoCodes.length} promo codes
        </p>
      </div>

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromoCodes.map((promoCode: PromoCode) => (
          <Card key={promoCode.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(promoCode.type)}
                  <CardTitle className="text-lg">{promoCode.code}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant={promoCode.active ? "default" : "secondary"}>
                    {promoCode.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {promoCode.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={getTypeColor(promoCode.type)} variant="secondary">
                  {formatDiscount(promoCode.type, promoCode.value)}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{promoCode.usedCount}</span>
                  {promoCode.maxUses && <span>/{promoCode.maxUses}</span>}
                </div>
              </div>

              {promoCode.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {promoCode.description}
                </p>
              )}

              <div className="space-y-2">
                {promoCode.expiresAt && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Expires: {format(new Date(promoCode.expiresAt), "MMM d, yyyy")}</span>
                  </div>
                )}
                {promoCode.categoryRestriction && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>{promoCode.categoryRestriction} only</span>
                  </div>
                )}
                {promoCode.planRestriction && promoCode.planRestriction !== "no_restriction" && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{promoCode.planRestriction.replace("_", " ")}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUsage(promoCode.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Usage
                  </Button>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(promoCode)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(promoCode.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPromoCodes.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Tag className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No promo codes found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== "all" || filterStatus !== "all" || filterCategory !== "all" 
                  ? "Try adjusting your filters" 
                  : "Create your first promo code to get started"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Modal */}
      {showUsage && (
        <Dialog open={showUsage !== null} onOpenChange={() => setShowUsage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Promo Code Usage</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {promoCodeUsage.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No usage data available for this promo code.
                </p>
              ) : (
                <div className="space-y-2">
                  {promoCodeUsage.map((usage: PromoCodeUsage) => (
                    <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {usage.user?.firstName} {usage.user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {usage.user?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(usage.usedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PromoCodeManagement;