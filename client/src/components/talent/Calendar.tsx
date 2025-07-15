import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface CalendarEvent {
  id: number;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'available' | 'busy' | 'unavailable';
  notes?: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CalendarProps {
  showAddButton?: boolean;
}

export function Calendar({ showAddButton = true }: CalendarProps) {
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [eventForm, setEventForm] = useState({
    startDate: '',
    endDate: '',
    status: 'available' as 'available' | 'busy' | 'unavailable',
    notes: '',
    allDay: true
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch calendar events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/calendar/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/calendar/events");
      return response.json();
    },
    enabled: !!user
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/calendar/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setShowAddEventDialog(false);
      setEventForm({
        startDate: '',
        endDate: '',
        status: 'available',
        notes: '',
        allDay: true
      });
      toast({
        title: "Event added",
        description: "Your calendar event has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddEvent = () => {
    if (!eventForm.startDate || !eventForm.endDate) {
      toast({
        title: "Missing information",
        description: "Please provide both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    addEventMutation.mutate(eventForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-red-600 bg-red-50';
      case 'unavailable': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const upcomingEvents = events.filter((event: CalendarEvent) => 
    new Date(event.startDate) >= new Date()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Add Event Button */}
      {showAddButton && (
        <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              <span>Schedule & Availability</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Availability
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                    <span>Add Calendar Event</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={eventForm.startDate}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={eventForm.endDate}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="event-status">Status</Label>
                    <Select value={eventForm.status} onValueChange={(value: 'available' | 'busy' | 'unavailable') => setEventForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="event-notes">Notes</Label>
                    <Textarea
                      id="event-notes"
                      placeholder="Add any notes about your availability..."
                      rows={3}
                      value={eventForm.notes}
                      onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddEventDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddEvent}
                      disabled={addEventMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {addEventMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Adding...
                        </div>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Event
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Upcoming Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming events</p>
              <p className="text-sm">Add your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event: CalendarEvent) => (
                <div key={event.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                          <span>-</span>
                          <span>{new Date(event.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {event.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{event.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}