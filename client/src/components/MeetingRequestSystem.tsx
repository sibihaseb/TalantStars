import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, User, MessageCircle, Check, X, Send, Video, Coffee, Users } from 'lucide-react';

interface MeetingRequest {
  id: number;
  fromUserId: string;
  toUserId: string;
  title: string;
  description: string;
  preferredDateTime: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in-person';
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
  };
  toUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
  };
}

const MEETING_TYPES = {
  video: { icon: Video, label: 'Video Call', color: 'blue' },
  phone: { icon: Coffee, label: 'Phone Call', color: 'green' },
  'in-person': { icon: Users, label: 'In-Person Meeting', color: 'purple' }
};

const STATUS_COLORS = {
  pending: 'yellow',
  accepted: 'green',
  declined: 'red',
  completed: 'gray'
};

export function MeetingRequestSystem() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [activeTab, setActiveTab] = useState('received');

  const { data: meetings = [], isLoading } = useQuery<MeetingRequest[]>({
    queryKey: ['/api/meetings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/meetings');
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users');
      return response.json();
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await apiRequest('POST', '/api/meetings', meetingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      toast({
        title: t('meetingRequestSent'),
        description: "Meeting request sent successfully",
      });
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast({
        title: t('errorOccurred'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await apiRequest('PUT', `/api/meetings/${id}`, { status, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      toast({
        title: t('meetingUpdated'),
        description: "Meeting request updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: t('errorOccurred'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const meetingData = {
      toUserId: selectedUser,
      title: formData.get('title'),
      description: formData.get('description'),
      preferredDateTime: formData.get('preferredDateTime'),
      duration: parseInt(formData.get('duration') as string),
      meetingType: formData.get('meetingType'),
      location: formData.get('location') || undefined,
      notes: formData.get('notes') || undefined,
    };

    createMeetingMutation.mutate(meetingData);
  };

  const handleUpdateMeeting = (id: number, status: string, notes?: string) => {
    updateMeetingMutation.mutate({ id, status, notes });
  };

  const receivedMeetings = meetings.filter(m => m.toUserId === user?.id);
  const sentMeetings = meetings.filter(m => m.fromUserId === user?.id);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderMeetingCard = (meeting: MeetingRequest, isSent: boolean = false) => {
    const otherUser = isSent ? meeting.toUser : meeting.fromUser;
    const MeetingIcon = MEETING_TYPES[meeting.meetingType].icon;
    
    return (
      <Card key={meeting.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {otherUser?.profileImage ? (
                  <img 
                    src={otherUser.profileImage} 
                    alt={otherUser.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{meeting.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{isSent ? 'To:' : 'From:'} {otherUser?.firstName} {otherUser?.lastName}</span>
                  <Badge variant="outline" className="text-xs">
                    {otherUser?.role}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={STATUS_COLORS[meeting.status] as any}>
                {meeting.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{meeting.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDateTime(meeting.preferredDateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{meeting.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <MeetingIcon className="h-4 w-4 text-muted-foreground" />
              <span>{MEETING_TYPES[meeting.meetingType].label}</span>
            </div>
            {meeting.location && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{meeting.location}</span>
              </div>
            )}
          </div>

          {meeting.notes && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Label className="text-xs text-muted-foreground">Notes:</Label>
              <p className="text-sm">{meeting.notes}</p>
            </div>
          )}

          {!isSent && meeting.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => handleUpdateMeeting(meeting.id, 'accepted')}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleUpdateMeeting(meeting.id, 'declined')}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('meetingRequests')}</h1>
          <p className="text-muted-foreground">
            Manage your meeting requests and schedule meetings with other users
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Request Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request a Meeting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <Label htmlFor="user">Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to meet with" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter((u: any) => u.id !== user?.id).map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} (@{u.username}) - {u.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Meeting Title</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="e.g., Project Discussion"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  placeholder="Describe what you'd like to discuss..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDateTime">Preferred Date & Time</Label>
                  <Input 
                    id="preferredDateTime"
                    name="preferredDateTime"
                    type="datetime-local"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration"
                    name="duration"
                    type="number"
                    min="15"
                    max="180"
                    defaultValue="60"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="meetingType">Meeting Type</Label>
                <Select name="meetingType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEETING_TYPES).map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input 
                  id="location"
                  name="location"
                  placeholder="e.g., Zoom link, office address, etc."
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea 
                  id="notes"
                  name="notes"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMeetingMutation.isPending}>
                  {createMeetingMutation.isPending ? 'Sending...' : 'Send Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Received ({receivedMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent ({sentMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedMeetings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No meeting requests received yet</p>
              </CardContent>
            </Card>
          ) : (
            receivedMeetings.map(meeting => renderMeetingCard(meeting, false))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentMeetings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No meeting requests sent yet</p>
              </CardContent>
            </Card>
          ) : (
            sentMeetings.map(meeting => renderMeetingCard(meeting, true))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}