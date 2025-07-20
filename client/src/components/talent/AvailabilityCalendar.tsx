import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AvailabilityEntry {
  id: number;
  startDate: string;
  endDate: string;
  status: "available" | "busy" | "unavailable";
  notes?: string;
  allDay: boolean;
}

export function AvailabilityCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AvailabilityEntry | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "busy" | "unavailable">("available");
  const [isAllDay, setIsAllDay] = useState(true);

  const { data: availabilityEntries = [], isLoading } = useQuery<AvailabilityEntry[]>({
    queryKey: ["/api/availability"],
    enabled: !!user,
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: Partial<AvailabilityEntry>) => {
      const response = await apiRequest("POST", "/api/availability", data);
      if (!response.ok) throw new Error("Failed to create availability entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      setIsEditingEntry(false);
      setEditingEntry(null);
      toast({ title: "Success", description: "Availability updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AvailabilityEntry> }) => {
      const response = await apiRequest("PUT", `/api/availability/${id}`, data);
      if (!response.ok) throw new Error("Failed to update availability entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      setIsEditingEntry(false);
      setEditingEntry(null);
      toast({ title: "Success", description: "Availability updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/availability/${id}`);
      if (!response.ok) throw new Error("Failed to delete availability entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({ title: "Success", description: "Availability entry deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveEntry = (formData: FormData) => {
    let startDate = formData.get("startDate") as string;
    let endDate = formData.get("endDate") as string;
    
    // If all day is selected, convert date to datetime format
    if (isAllDay) {
      startDate = startDate + "T00:00";
      endDate = endDate + "T23:59";
    }
    
    const data = {
      startDate,
      endDate,
      status: formData.get("status") as "available" | "busy" | "unavailable",
      notes: formData.get("notes") as string,
      allDay: isAllDay,
    };

    if (editingEntry) {
      updateAvailabilityMutation.mutate({ id: editingEntry.id, data });
    } else {
      createAvailabilityMutation.mutate(data);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "busy":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "unavailable":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability Calendar
          </span>
          <Dialog open={isEditingEntry} onOpenChange={setIsEditingEntry}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingEntry(null);
                setIsAllDay(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Availability" : "Add Availability"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveEntry(new FormData(e.currentTarget));
              }}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="allDay"
                      name="allDay"
                      checked={isAllDay}
                      onCheckedChange={setIsAllDay}
                      defaultChecked={editingEntry?.allDay ?? true}
                    />
                    <Label htmlFor="allDay">All Day</Label>
                  </div>
                  <div>
                    <Label htmlFor="startDate">{isAllDay ? "Start Date" : "Start Date & Time"}</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type={isAllDay ? "date" : "datetime-local"}
                      defaultValue={editingEntry?.startDate ? 
                        (isAllDay ? 
                          new Date(editingEntry.startDate).toISOString().slice(0, 10) : 
                          new Date(editingEntry.startDate).toISOString().slice(0, 16)
                        ) : ""
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">{isAllDay ? "End Date" : "End Date & Time"}</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type={isAllDay ? "date" : "datetime-local"}
                      defaultValue={editingEntry?.endDate ? 
                        (isAllDay ? 
                          new Date(editingEntry.endDate).toISOString().slice(0, 10) : 
                          new Date(editingEntry.endDate).toISOString().slice(0, 16)
                        ) : ""
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingEntry?.status || "available"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Optional notes about this availability period"
                      defaultValue={editingEntry?.notes || ""}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditingEntry(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEntry ? "Update" : "Create"} Availability
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : availabilityEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No availability entries yet. Add your first availability period.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availabilityEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(entry.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {format(new Date(entry.startDate), "MMM d, yyyy")}
                        {!entry.allDay && ` ${format(new Date(entry.startDate), "h:mm a")}`}
                      </span>
                      <span className="text-gray-500">to</span>
                      <span className="font-medium">
                        {format(new Date(entry.endDate), "MMM d, yyyy")}
                        {!entry.allDay && ` ${format(new Date(entry.endDate), "h:mm a")}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                      {entry.notes && (
                        <span className="text-sm text-gray-600">{entry.notes}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingEntry(entry);
                      setIsEditingEntry(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this availability entry?")) {
                        deleteAvailabilityMutation.mutate(entry.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}