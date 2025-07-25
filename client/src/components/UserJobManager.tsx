import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  Eye, 
  DollarSign, 
  Calendar, 
  MapPin,
  Briefcase,
  Users,
  Clock,
  Star
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  description: string;
  talentType: string;
  location: string;
  budget: string;
  projectDate: string;
  requirements: string;
  status: string;
  projectType?: string;
  genre?: string;
  ageRange?: string;
  gender?: string;
  ethnicity?: string;
  experienceLevel?: string;
  shootingDays?: string;
  applicationDeadline?: string;
  specialSkills?: string;
  wardrobe?: string;
  isUnion?: boolean;
  providesTransport?: boolean;
  providesMeals?: boolean;
  providesAccommodation?: boolean;
  isRemote?: boolean;
  allowCommunication?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function UserJobManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Job>>({});

  // Fetch user's jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/user/jobs'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/jobs');
      return response.json();
    },
    enabled: !!user,
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: number; updates: Partial<Job> }) => {
      const response = await apiRequest('PUT', `/api/jobs/${jobId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setEditingJob(null);
      toast({
        title: "Job updated successfully",
        description: "Your job posting has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update job",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest('DELETE', `/api/jobs/${jobId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Job deleted successfully",
        description: "Your job posting has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete job",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/jobs/${jobId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Job status updated",
        description: "Your job status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setEditFormData(job);
  };

  const handleSaveEdit = () => {
    if (editingJob) {
      updateJobMutation.mutate({
        jobId: editingJob.id,
        updates: editFormData,
      });
    }
  };

  const handleDelete = (jobId: number) => {
    deleteJobMutation.mutate(jobId);
  };

  const handleStatusChange = (jobId: number, status: string) => {
    updateStatusMutation.mutate({ jobId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'booked': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Jobs Posted Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            You haven't posted any jobs yet. Start by posting your first gig!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Posted Jobs ({jobs.length})
        </h2>
      </div>

      <div className="grid gap-6">
        {jobs.map((job: Job) => (
          <Card key={job.id} className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.talentType}
                    </div>
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                    )}
                    {job.budget && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${job.budget}
                      </div>
                    )}
                    {job.projectDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.projectDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                  {job.updatedAt !== job.createdAt && (
                    <span> • Updated {new Date(job.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Status Updates */}
                  {job.status === 'open' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(job.id, 'booked')}
                      disabled={updateStatusMutation.isPending}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark as Booked
                    </Button>
                  )}

                  {job.status === 'booked' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(job.id, 'completed')}
                      disabled={updateStatusMutation.isPending}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}

                  {/* Edit Job Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(job)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Job: {job.title}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Job Title *</Label>
                            <Input
                              id="title"
                              value={editFormData.title || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="talentType">Talent Type *</Label>
                            <Select value={editFormData.talentType || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, talentType: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select talent type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="actor">Actor</SelectItem>
                                <SelectItem value="musician">Musician</SelectItem>
                                <SelectItem value="voice_artist">Voice Artist</SelectItem>
                                <SelectItem value="model">Model</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={editFormData.location || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="budget">Budget ($)</Label>
                            <Input
                              id="budget"
                              type="number"
                              value={editFormData.budget || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, budget: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            value={editFormData.description || ''}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="requirements">Requirements</Label>
                          <Textarea
                            id="requirements"
                            value={editFormData.requirements || ''}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, requirements: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="projectDate">Project Date</Label>
                            <Input
                              id="projectDate"
                              type="date"
                              value={editFormData.projectDate ? new Date(editFormData.projectDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, projectDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={editFormData.status || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="booked">Booked</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingJob(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveEdit}
                            disabled={updateJobMutation.isPending}
                          >
                            {updateJobMutation.isPending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : null}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Job Alert */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{job.title}"? This action cannot be undone and will remove all applications and communications for this job.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(job.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleteJobMutation.isPending}
                        >
                          {deleteJobMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : null}
                          Delete Job
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}