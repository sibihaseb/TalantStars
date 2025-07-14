import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Video, Users, Plus, Edit, Trash2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMeetingSchema } from "@shared/schema";
import { z } from "zod";

const meetingFormSchema = insertMeetingSchema.extend({
  meetingDate: z.string().min(1, "Meeting date is required"),
  meetingTime: z.string().min(1, "Meeting time is required"),
});

export default function MeetingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [meetingType, setMeetingType] = useState<"in_person" | "virtual">("virtual");
  const [virtualPlatform, setVirtualPlatform] = useState("");

  // Fetch meetings
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/meetings"],
    enabled: true,
  });

  // Fetch users for attendee selection
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: true,
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const data = {
        attendeeId: formData.get("attendeeId") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        meetingDate: new Date(`${formData.get("meetingDate")}T${formData.get("meetingTime")}`).toISOString(),
        type: formData.get("type") as "in_person" | "virtual",
        location: formData.get("location") as string,
        virtualLink: formData.get("virtualLink") as string,
        status: "scheduled" as const,
      };

      const response = await apiRequest("POST", "/api/meetings", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create meeting");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({ title: "Success", description: "Meeting created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PUT", `/api/meetings/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update meeting");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({ title: "Success", description: "Meeting updated successfully" });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: number) => {
      const response = await apiRequest("DELETE", `/api/meetings/${meetingId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete meeting");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({ title: "Success", description: "Meeting deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateMeeting = (formData: FormData) => {
    createMeetingMutation.mutate(formData);
  };

  const handleUpdateMeeting = (formData: FormData) => {
    const data = {
      id: selectedMeeting.id,
      attendeeId: formData.get("attendeeId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      meetingDate: new Date(`${formData.get("meetingDate")}T${formData.get("meetingTime")}`).toISOString(),
      type: formData.get("type") as "in_person" | "virtual",
      location: formData.get("location") as string,
      virtualLink: formData.get("virtualLink") as string,
      status: formData.get("status") as string,
    };
    updateMeetingMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Meeting Management</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateMeeting(new FormData(e.currentTarget));
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Meeting Title</Label>
                      <Input name="title" id="title" required />
                    </div>
                    <div>
                      <Label htmlFor="attendeeId">Attendee</Label>
                      <Select name="attendeeId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select attendee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" id="description" rows={3} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meetingDate">Date</Label>
                      <Input 
                        type="date" 
                        name="meetingDate" 
                        id="meetingDate"
                        min={new Date().toISOString().split('T')[0]}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="meetingTime">Time</Label>
                      <Input 
                        type="time" 
                        name="meetingTime" 
                        id="meetingTime"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Meeting Type</Label>
                    <Select 
                      name="type" 
                      value={meetingType} 
                      onValueChange={(value) => setMeetingType(value as "in_person" | "virtual")}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">Virtual Meeting</SelectItem>
                        <SelectItem value="in_person">In-Person Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {meetingType === "virtual" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="virtualPlatform">Platform</Label>
                        <Select name="virtualPlatform" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="meet">Google Meet</SelectItem>
                            <SelectItem value="teams">Microsoft Teams</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="virtualLink">Meeting Link</Label>
                        <Input 
                          type="url" 
                          name="virtualLink" 
                          id="virtualLink"
                          placeholder="https://zoom.us/j/..." 
                          required
                        />
                      </div>
                    </div>
                  )}
                  
                  {meetingType === "in_person" && (
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        name="location" 
                        id="location"
                        placeholder="Enter meeting address"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMeetingMutation.isPending}>
                      {createMeetingMutation.isPending ? "Creating..." : "Create Meeting"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Meeting Cards */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Scheduled Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {meetingsLoading ? (
                    <div className="text-center py-8">Loading meetings...</div>
                  ) : meetings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No meetings scheduled yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meetings.map((meeting: any) => (
                        <div key={meeting.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{meeting.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(meeting.status)}`}>
                                {meeting.status}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMeeting(meeting);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteMeetingMutation.mutate(meeting.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{formatDate(meeting.meetingDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>Attendee: {meeting.attendeeId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {meeting.type === "virtual" ? (
                                <Video className="w-4 h-4 text-gray-500" />
                              ) : (
                                <MapPin className="w-4 h-4 text-gray-500" />
                              )}
                              <span>
                                {meeting.type === "virtual" 
                                  ? `Virtual - ${meeting.virtualLink}` 
                                  : `In-Person - ${meeting.location}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Meeting Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Meetings</span>
                      <span className="font-semibold">{meetings.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Scheduled</span>
                      <span className="font-semibold text-blue-600">
                        {meetings.filter((m: any) => m.status === "scheduled").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Confirmed</span>
                      <span className="font-semibold text-green-600">
                        {meetings.filter((m: any) => m.status === "confirmed").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-semibold text-gray-600">
                        {meetings.filter((m: any) => m.status === "completed").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Start Conference Call
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Calendar
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Invite Participants
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateMeeting(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Meeting Title</Label>
                  <Input 
                    name="title" 
                    id="edit-title" 
                    defaultValue={selectedMeeting.title}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedMeeting.status} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  name="description" 
                  id="edit-description"
                  defaultValue={selectedMeeting.description}
                  rows={3} 
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMeetingMutation.isPending}>
                  {updateMeetingMutation.isPending ? "Updating..." : "Update Meeting"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}