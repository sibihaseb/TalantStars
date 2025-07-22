import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash, Plus, GripVertical, Sparkles, Trophy, Star, AlertTriangle, Loader2, Wand2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface JobHistoryItem {
  id: number;
  title: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  description?: string;
  job_type?: string;
  location?: string;
  verified: boolean;
  order_index?: number;
  ai_enhanced?: boolean;
  skill_validations?: string[];
}

interface SortableJobItemProps {
  job: JobHistoryItem;
  onEdit: (job: JobHistoryItem) => void;
  onDelete: (id: number) => void;
  onEnhance: (id: number) => void;
  onValidateSkills: (id: number) => void;
  isEnhancing?: boolean;
  isValidating?: boolean;
}

function SortableJobItem({ job, onEdit, onDelete, onEnhance, onValidateSkills, isEnhancing, isValidating }: SortableJobItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="mb-3 group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div
                {...listeners}
                className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-sm">{job.title}</h3>
                  {job.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                  {job.ai_enhanced && <Badge variant="outline" className="text-xs text-blue-600">AI Enhanced</Badge>}
                  {job.skill_validations && job.skill_validations.length > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      <Trophy className="w-3 h-3 mr-1" />
                      {job.skill_validations.length} Skills
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{job.company}</p>
                <p className="text-xs text-gray-500">
                  {new Date(job.start_date).getFullYear()} - {job.end_date ? new Date(job.end_date).getFullYear() : 'Present'}
                </p>
                {job.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEnhance(job.id)}
                disabled={isEnhancing}
                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                title="AI Enhance Description"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onValidateSkills(job.id)}
                disabled={isValidating}
                className="h-8 w-8 p-0 text-green-500 hover:text-green-700 disabled:opacity-50"
                title="Validate Skills"
              >
                {isValidating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Star className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("🔥 JOBHISTORYMANAGER: Edit button clicked", { jobId: job.id });
                  onEdit(job);
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-2">
                      Are you sure you want to delete "<strong>{job.title}</strong>" at <strong>{job.company}</strong>?
                      <br />
                      <span className="text-sm text-gray-500 mt-2 block">This action cannot be undone and will permanently remove this work experience from your profile.</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(job.id)}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                      Delete Experience
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface JobHistoryManagerProps {
  jobHistory: JobHistoryItem[];
  onJobUpdated: () => void;
  userId: number;
}

export function JobHistoryManager({ jobHistory, onJobUpdated, userId }: JobHistoryManagerProps) {
  console.log("🔥 JOBHISTORYMANAGER: Component rendering", { jobHistory, userId });
  
  // ALL HOOKS MUST BE AT THE TOP LEVEL - NEVER CONDITIONAL
  const [items, setItems] = useState(jobHistory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobHistoryItem | null>(null);
  const [enhancingJobId, setEnhancingJobId] = useState<number | null>(null);
  const [validatingJobId, setValidatingJobId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    role: '',
    start_date: '',
    end_date: '',
    description: '',
    job_type: '',
    location: ''
  });
  
  // Update items when jobHistory prop changes
  useEffect(() => {
    setItems(jobHistory);
  }, [jobHistory]);

  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (newOrder: JobHistoryItem[]) => {
      const response = await apiRequest('PUT', '/api/job-history/reorder', {
        jobIds: newOrder.map((job, index) => ({ id: job.id, order_index: index }))
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-history/${userId}`] });
      toast({ title: "Order updated successfully!" });
    }
  });

  // AI Enhancement mutation
  const enhanceMutation = useMutation({
    mutationFn: async (jobId: number) => {
      console.log("🔥 ENHANCEMENT: Starting AI enhancement for job", { jobId });
      setEnhancingJobId(jobId);
      try {
        const response = await apiRequest('POST', `/api/job-history/${jobId}/enhance`);
        console.log("🔥 ENHANCEMENT: API response received", { status: response.status });
        if (!response.ok) {
          throw new Error(`Enhancement failed with status ${response.status}`);
        }
        const data = await response.json();
        console.log("🔥 ENHANCEMENT: Success data", { data });
        return data;
      } catch (error) {
        console.error("🔥 ENHANCEMENT: API error", { error });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("🔥 ENHANCEMENT: Mutation success", { data });
      setEnhancingJobId(null);
      queryClient.invalidateQueries({ queryKey: [`/api/job-history/${userId}`] });
      onJobUpdated();
      toast({ 
        title: "AI Enhancement Complete!", 
        description: "Your experience description has been enhanced with professional language and industry keywords."
      });
    },
    onError: (error) => {
      console.error("🔥 ENHANCEMENT: Mutation error", { error });
      setEnhancingJobId(null);
      toast({ 
        title: "Enhancement failed", 
        description: `Unable to enhance the experience description: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Skill validation mutation
  const validateSkillsMutation = useMutation({
    mutationFn: async (jobId: number) => {
      console.log("🔥 VALIDATION: Starting skill validation for job", { jobId });
      setValidatingJobId(jobId);
      try {
        const response = await apiRequest('POST', `/api/job-history/${jobId}/validate-skills`);
        console.log("🔥 VALIDATION: API response received", { status: response.status });
        if (!response.ok) {
          throw new Error(`Validation failed with status ${response.status}`);
        }
        const data = await response.json();
        console.log("🔥 VALIDATION: Success data", { data });
        return data;
      } catch (error) {
        console.error("🔥 VALIDATION: API error", { error });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("🔥 VALIDATION: Mutation success", { data });
      setValidatingJobId(null);
      queryClient.invalidateQueries({ queryKey: [`/api/job-history/${userId}`] });
      onJobUpdated();
      toast({ 
        title: "Skills Validated!", 
        description: `${data.validatedSkills?.length || 0} professional skills identified and validated for this experience.`
      });
    },
    onError: (error) => {
      console.error("🔥 VALIDATION: Mutation error", { error });
      setValidatingJobId(null);
      toast({ 
        title: "Validation failed", 
        description: `Unable to validate skills for this experience: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Create/Update mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const method = editingJob ? 'PUT' : 'POST';
      const url = editingJob ? `/api/job-history/${editingJob.id}` : '/api/job-history';
      console.log("🔥 JOBHISTORYMANAGER: saveJobMutation calling API", { method, url, jobData });
      const response = await apiRequest(method, url, jobData);
      console.log("🔥 JOBHISTORYMANAGER: API response received", { status: response.status });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("🔥 JOBHISTORYMANAGER: saveJobMutation success", { data });
      queryClient.invalidateQueries({ queryKey: [`/api/job-history/${userId}`] });
      onJobUpdated();
      resetForm();
      setIsDialogOpen(false);
      toast({ title: editingJob ? "Experience updated!" : "Experience added!" });
    },
    onError: (error) => {
      console.log("🔥 JOBHISTORYMANAGER: saveJobMutation error", { error });
      toast({ title: "Failed to save experience", variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (jobId: number) => {
      console.log("🔥 JOBHISTORYMANAGER: deleteMutation calling API", { jobId });
      const response = await apiRequest('DELETE', `/api/job-history/${jobId}`);
      console.log("🔥 JOBHISTORYMANAGER: Delete API response received", { status: response.status });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("🔥 JOBHISTORYMANAGER: deleteMutation success", { data });
      queryClient.invalidateQueries({ queryKey: [`/api/job-history/${userId}`] });
      onJobUpdated();
      toast({ title: "Experience deleted!" });
    },
    onError: (error) => {
      console.log("🔥 JOBHISTORYMANAGER: deleteMutation error", { error });
      toast({ title: "Failed to delete experience", variant: "destructive" });
    }
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save new order to backend
        reorderMutation.mutate(newOrder);
        
        return newOrder;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      role: '',
      start_date: '',
      end_date: '',
      description: '',
      job_type: '',
      location: ''
    });
    setEditingJob(null);
  };

  const handleEdit = (job: JobHistoryItem) => {
    console.log("🔥 JOBHISTORYMANAGER: handleEdit called", { job });
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      role: job.role,
      start_date: job.start_date,
      end_date: job.end_date || '',
      description: job.description || '',
      job_type: job.job_type || '',
      location: job.location || ''
    });
    setIsDialogOpen(true);
    console.log("🔥 JOBHISTORYMANAGER: Dialog should be open now");
  };

  const handleSave = () => {
    console.log("🔥 JOBHISTORYMANAGER: handleSave called", { formData, editingJob });
    if (!formData.title || !formData.company || !formData.role) {
      console.log("🔥 JOBHISTORYMANAGER: Missing required fields", {
        title: formData.title,
        company: formData.company,
        role: formData.role
      });
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    console.log("🔥 JOBHISTORYMANAGER: About to call saveJobMutation.mutate");
    saveJobMutation.mutate(formData);
  };

  const handleDelete = (jobId: number) => {
    console.log("🔥 JOBHISTORYMANAGER: handleDelete called", { jobId });
    deleteMutation.mutate(jobId);
  };

  const handleEnhance = (jobId: number) => {
    console.log("🔥 JOBHISTORYMANAGER: handleEnhance called", { jobId });
    enhanceMutation.mutate(jobId);
  };

  const handleValidateSkills = (jobId: number) => {
    console.log("🔥 JOBHISTORYMANAGER: handleValidateSkills called", { jobId });
    validateSkillsMutation.mutate(jobId);
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Work Experience</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => {
              console.log("🔥 JOBHISTORYMANAGER: Add Experience button clicked");
              resetForm();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Lead Actor"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="e.g., Netflix"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g., Supporting Actor"
                  />
                </div>
                <div>
                  <Label htmlFor="job_type">Job Type</Label>
                  <Input
                    id="job_type"
                    value={formData.job_type}
                    onChange={(e) => setFormData({...formData, job_type: e.target.value})}
                    placeholder="e.g., Film, TV, Theater"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Los Angeles, CA"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Description</Label>
                  {formData.description && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Enhance current description using AI
                          if (editingJob) {
                            handleEnhance(editingJob.id);
                          }
                        }}
                        disabled={!editingJob || enhancingJobId === editingJob?.id}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        {enhancingJobId === editingJob?.id ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3 mr-1" />
                        )}
                        Enhance with AI
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Validate skills for current experience
                          if (editingJob) {
                            handleValidateSkills(editingJob.id);
                          }
                        }}
                        disabled={!editingJob || validatingJobId === editingJob?.id}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        {validatingJobId === editingJob?.id ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Star className="w-3 h-3 mr-1" />
                        )}
                        Validate Skills
                      </Button>
                    </div>
                  )}
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your role and achievements..."
                  className="min-h-24"
                />
                {!formData.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Add your description first, then use AI to enhance it with professional language and validate your skills.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveJobMutation.isPending}>
                  {saveJobMutation.isPending ? "Saving..." : (editingJob ? "Update" : "Add")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((job) => (
            <SortableJobItem
              key={job.id}
              job={job}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onEnhance={handleEnhance}
              onValidateSkills={handleValidateSkills}
              isEnhancing={enhancingJobId === job.id}
              isValidating={validatingJobId === job.id}
            />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No work experience added yet</p>
          <p className="text-xs mt-1">Add your first experience to get started!</p>
        </div>
      )}
    </div>
  );
}