import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Gift, 
  Crown, 
  Search,
  Filter,
  Image,
  Video,
  Music,
  ExternalLink,
  HardDrive,
  Clock,
  Check,
  X
} from "lucide-react";

interface UserLimits {
  userId: string;
  maxPhotos: number;
  maxVideos: number;
  maxAudio: number;
  maxExternalLinks: number;
  maxStorage: number; // in MB
  customLimits: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  reason?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profileImage?: string;
  role: string;
  pricingTier?: string;
  currentUsage: {
    photos: number;
    videos: number;
    audio: number;
    externalLinks: number;
    storage: number;
  };
}

export default function UserLimitsManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showGrantDialog, setShowGrantDialog] = useState(false);

  // Fetch users with their current limits
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users-with-limits'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users-with-limits');
      return response.json();
    }
  });

  // Grant custom limits mutation
  const grantLimitsMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      limits: Partial<UserLimits>;
    }) => {
      const response = await apiRequest('POST', '/api/admin/grant-user-limits', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users-with-limits'] });
      toast({
        title: "Limits granted successfully",
        description: "User limits have been updated",
      });
      setShowGrantDialog(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to grant limits",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Revoke custom limits mutation
  const revokeLimitsMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/revoke-user-limits/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users-with-limits'] });
      toast({
        title: "Limits revoked successfully",
        description: "User has been reverted to their plan limits",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to revoke limits",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  const getUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            User Limits Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Grant additional storage and upload limits to specific users
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="talent">Talent</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="producer">Producer</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading users...</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profileImage} alt={user.fullName} />
                    <AvatarFallback>
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{user.fullName}</h3>
                        <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant="secondary">{user.pricingTier || 'Free'}</Badge>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowGrantDialog(true);
                          }}
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Grant Limits
                        </Button>
                      </div>
                    </div>

                    {/* Usage Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Image className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Photos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getUsageColor(user.currentUsage.photos, 10)}`}>
                            {user.currentUsage.photos}/10
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${getUsagePercentage(user.currentUsage.photos, 10)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Videos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getUsageColor(user.currentUsage.videos, 5)}`}>
                            {user.currentUsage.videos}/5
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${getUsagePercentage(user.currentUsage.videos, 5)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Music className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Audio</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getUsageColor(user.currentUsage.audio, 5)}`}>
                            {user.currentUsage.audio}/5
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${getUsagePercentage(user.currentUsage.audio, 5)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getUsageColor(user.currentUsage.storage, 100)}`}>
                            {user.currentUsage.storage}/100MB
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${getUsagePercentage(user.currentUsage.storage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Grant Limits Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              Grant Custom Limits to {selectedUser?.fullName}
            </DialogTitle>
          </DialogHeader>

          <GrantLimitsForm 
            user={selectedUser}
            onSubmit={(limits) => {
              if (selectedUser) {
                grantLimitsMutation.mutate({
                  userId: selectedUser.id,
                  limits
                });
              }
            }}
            isLoading={grantLimitsMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface GrantLimitsFormProps {
  user: User | null;
  onSubmit: (limits: Partial<UserLimits>) => void;
  isLoading: boolean;
}

function GrantLimitsForm({ user, onSubmit, isLoading }: GrantLimitsFormProps) {
  const [formData, setFormData] = useState({
    maxPhotos: 50,
    maxVideos: 20,
    maxAudio: 20,
    maxExternalLinks: 10,
    maxStorage: 1000,
    hasExpiry: false,
    expiresAt: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const limits: Partial<UserLimits> = {
      maxPhotos: formData.maxPhotos,
      maxVideos: formData.maxVideos,
      maxAudio: formData.maxAudio,
      maxExternalLinks: formData.maxExternalLinks,
      maxStorage: formData.maxStorage,
      customLimits: true,
      reason: formData.reason
    };

    if (formData.hasExpiry && formData.expiresAt) {
      limits.expiresAt = formData.expiresAt;
    }

    onSubmit(limits);
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxPhotos" className="flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-500" />
            Max Photos
          </Label>
          <Input
            id="maxPhotos"
            type="number"
            min="0"
            value={formData.maxPhotos}
            onChange={(e) => setFormData(prev => ({ ...prev, maxPhotos: parseInt(e.target.value) }))}
          />
        </div>

        <div>
          <Label htmlFor="maxVideos" className="flex items-center gap-2">
            <Video className="h-4 w-4 text-purple-500" />
            Max Videos
          </Label>
          <Input
            id="maxVideos"
            type="number"
            min="0"
            value={formData.maxVideos}
            onChange={(e) => setFormData(prev => ({ ...prev, maxVideos: parseInt(e.target.value) }))}
          />
        </div>

        <div>
          <Label htmlFor="maxAudio" className="flex items-center gap-2">
            <Music className="h-4 w-4 text-green-500" />
            Max Audio Files
          </Label>
          <Input
            id="maxAudio"
            type="number"
            min="0"
            value={formData.maxAudio}
            onChange={(e) => setFormData(prev => ({ ...prev, maxAudio: parseInt(e.target.value) }))}
          />
        </div>

        <div>
          <Label htmlFor="maxExternalLinks" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-orange-500" />
            Max External Links
          </Label>
          <Input
            id="maxExternalLinks"
            type="number"
            min="0"
            value={formData.maxExternalLinks}
            onChange={(e) => setFormData(prev => ({ ...prev, maxExternalLinks: parseInt(e.target.value) }))}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="maxStorage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-red-500" />
            Max Storage (MB)
          </Label>
          <Input
            id="maxStorage"
            type="number"
            min="0"
            value={formData.maxStorage}
            onChange={(e) => setFormData(prev => ({ ...prev, maxStorage: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="hasExpiry"
            checked={formData.hasExpiry}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasExpiry: checked }))}
          />
          <Label htmlFor="hasExpiry" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Set Expiry Date
          </Label>
        </div>

        {formData.hasExpiry && (
          <div>
            <Label htmlFor="expiresAt">Expires At</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
          </div>
        )}

        <div>
          <Label htmlFor="reason">Reason for Grant (Optional)</Label>
          <Textarea
            id="reason"
            placeholder="Why are you granting these limits? (e.g., Contest winner, Special project, etc.)"
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setFormData({
          maxPhotos: 50,
          maxVideos: 20,
          maxAudio: 20,
          maxExternalLinks: 10,
          maxStorage: 1000,
          hasExpiry: false,
          expiresAt: '',
          reason: ''
        })}>
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Granting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Grant Limits
            </>
          )}
        </Button>
      </div>
    </form>
  );
}