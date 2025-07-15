import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Star, 
  Crown, 
  Medal, 
  Trophy, 
  Zap, 
  Users, 
  Eye,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

interface FeaturedTalent {
  id: number;
  userId: number;
  displayName: string;
  talentType: string;
  profileImageUrl: string;
  isFeatured: boolean;
  featuredAt: string;
  featuredTier: string;
  profileViews: number;
  user: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface PricingTier {
  id: number;
  name: string;
  price: number;
  canBeFeatured: boolean;
  featuredTierName: string;
  featuredPriority: number;
  maxPhotos: number;
  maxVideos: number;
  maxAudioFiles: number;
}

export default function FeaturedTalentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch featured talent
  const { data: featuredTalents = [], isLoading: talentsLoading } = useQuery<FeaturedTalent[]>({
    queryKey: ['/api/admin/featured-talent'],
  });

  // Fetch pricing tiers
  const { data: pricingTiers = [], isLoading: tiersLoading } = useQuery<PricingTier[]>({
    queryKey: ['/api/admin/pricing-tiers'],
  });

  // Fetch all talent profiles for selection
  const { data: allTalents = [], isLoading: allTalentsLoading } = useQuery<FeaturedTalent[]>({
    queryKey: ['/api/admin/all-talent-profiles'],
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ userId, isFeatured, featuredTier }: { userId: number; isFeatured: boolean; featuredTier?: string }) => {
      return await apiRequest('POST', '/api/admin/toggle-featured', {
        userId,
        isFeatured,
        featuredTier
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-talent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-talent-profiles'] });
      toast({
        title: "Success",
        description: "Featured status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update featured status",
        variant: "destructive",
      });
    },
  });

  // Filter and search logic
  const filteredTalents = allTalents.filter(talent => {
    const matchesSearch = talent.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || talent.featuredTier === filterTier;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'featured' && talent.isFeatured) ||
                         (filterStatus === 'not-featured' && !talent.isFeatured);
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleToggleFeatured = (talent: FeaturedTalent) => {
    if (!talent.isFeatured) {
      // Show tier selection modal or use default tier
      const defaultTier = pricingTiers.find(tier => tier.canBeFeatured)?.featuredTierName || 'Premium';
      toggleFeaturedMutation.mutate({
        userId: talent.userId,
        isFeatured: true,
        featuredTier: defaultTier
      });
    } else {
      toggleFeaturedMutation.mutate({
        userId: talent.userId,
        isFeatured: false
      });
    }
  };

  const getFeaturedIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Crown className="w-4 h-4 text-purple-500" />;
      case 'gold': return <Medal className="w-4 h-4 text-yellow-500" />;
      case 'premium': return <Star className="w-4 h-4 text-blue-500" />;
      default: return <Trophy className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'premium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (talentsLoading || tiersLoading || allTalentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Featured Talent Management</h1>
          <p className="text-gray-600 mt-1">Manage which talents are featured on the platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            <Star className="w-4 h-4 mr-1" />
            {featuredTalents.length} Featured
          </Badge>
          <Badge variant="outline">
            <Users className="w-4 h-4 mr-1" />
            {allTalents.length} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Talent</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tier-filter">Featured Tier</Label>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Featured Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="not-featured">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Talent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pricingTiers.filter(tier => tier.canBeFeatured).map((tier) => {
          const tierCount = featuredTalents.filter(t => t.featuredTier === tier.featuredTierName).length;
          return (
            <Card key={tier.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFeaturedIcon(tier.featuredTierName)}
                    <span className="font-medium">{tier.featuredTierName}</span>
                  </div>
                  <Badge className={getTierColor(tier.featuredTierName)}>
                    {tierCount}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Priority: {tier.featuredPriority}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Talent List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            All Talent ({filteredTalents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTalents.map((talent) => (
              <Card key={talent.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {talent.profileImageUrl ? (
                        <img
                          src={talent.profileImageUrl}
                          alt={talent.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{talent.displayName}</h3>
                        <Switch
                          checked={talent.isFeatured}
                          onCheckedChange={() => handleToggleFeatured(talent)}
                          disabled={toggleFeaturedMutation.isPending}
                        />
                      </div>
                      <p className="text-sm text-gray-600">@{talent.user.username}</p>
                      <p className="text-sm text-gray-500 capitalize">{talent.talentType}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{talent.profileViews}</span>
                        </div>
                        {talent.isFeatured && (
                          <Badge className={getTierColor(talent.featuredTier)}>
                            {getFeaturedIcon(talent.featuredTier)}
                            <span className="ml-1">{talent.featuredTier}</span>
                          </Badge>
                        )}
                      </div>
                      
                      {talent.featuredAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Featured: {new Date(talent.featuredAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTalents.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No talent found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tier Media Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Pricing Tier Media Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tier</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Photos</th>
                  <th className="text-left p-2">Videos</th>
                  <th className="text-left p-2">Audio</th>
                  <th className="text-left p-2">Featured</th>
                </tr>
              </thead>
              <tbody>
                {pricingTiers.map((tier) => (
                  <tr key={tier.id} className="border-b">
                    <td className="p-2 font-medium">{tier.name}</td>
                    <td className="p-2">${tier.price}</td>
                    <td className="p-2">{tier.maxPhotos === 0 ? 'Unlimited' : tier.maxPhotos}</td>
                    <td className="p-2">{tier.maxVideos === 0 ? 'Unlimited' : tier.maxVideos}</td>
                    <td className="p-2">{tier.maxAudioFiles === 0 ? 'Unlimited' : tier.maxAudioFiles}</td>
                    <td className="p-2">
                      {tier.canBeFeatured ? (
                        <Badge className={getTierColor(tier.featuredTierName)}>
                          {getFeaturedIcon(tier.featuredTierName)}
                          <span className="ml-1">{tier.featuredTierName}</span>
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}