import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, X, Palette, Tag as TagIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserTag {
  id: number;
  userId: number;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

interface MediaFile {
  id: number;
  title: string;
  url: string;
  thumbnailUrl?: string;
  mediaType: string;
  tags?: UserTag[];
}

interface TagManagerProps {
  mediaFiles: MediaFile[];
  onMediaFilesUpdate: () => void;
  className?: string;
}

const COLOR_PRESETS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#F43F5E', '#8B5A2B', '#6B7280', '#1F2937'
];

export function TagManager({ mediaFiles, onMediaFilesUpdate, className }: TagManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<UserTag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [draggedTag, setDraggedTag] = useState<UserTag | null>(null);
  const [dragOverMedia, setDragOverMedia] = useState<number | null>(null);
  const [filter, setFilter] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user tags
  const { data: tags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ['/api/tags'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/tags');
      return await res.json();
    },
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (tagData: { name: string; color: string; description?: string }) => {
      const res = await apiRequest('POST', '/api/tags', tagData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Tag created",
        description: "Your new tag has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, ...tagData }: { id: number; name: string; color: string; description?: string }) => {
      const res = await apiRequest('PATCH', `/api/tags/${id}`, tagData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setEditingTag(null);
      resetForm();
      toast({
        title: "Tag updated",
        description: "Your tag has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/tags/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      onMediaFilesUpdate();
      toast({
        title: "Tag deleted",
        description: "Your tag has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add tag to media file mutation
  const addTagToMediaMutation = useMutation({
    mutationFn: async ({ mediaId, tagId }: { mediaId: number; tagId: number }) => {
      const res = await apiRequest('POST', `/api/media/${mediaId}/tags/${tagId}`);
      return await res.json();
    },
    onSuccess: () => {
      onMediaFilesUpdate();
      toast({
        title: "Tag added",
        description: "Tag has been added to the media file.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove tag from media file mutation
  const removeTagFromMediaMutation = useMutation({
    mutationFn: async ({ mediaId, tagId }: { mediaId: number; tagId: number }) => {
      const res = await apiRequest('DELETE', `/api/media/${mediaId}/tags/${tagId}`);
      return await res.json();
    },
    onSuccess: () => {
      onMediaFilesUpdate();
      toast({
        title: "Tag removed",
        description: "Tag has been removed from the media file.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewTagName('');
    setNewTagColor('#3B82F6');
    setNewTagDescription('');
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: newTagColor,
      description: newTagDescription.trim() || undefined,
    });
  };

  const handleUpdateTag = () => {
    if (!editingTag || !newTagName.trim()) return;
    
    updateTagMutation.mutate({
      id: editingTag.id,
      name: newTagName.trim(),
      color: newTagColor,
      description: newTagDescription.trim() || undefined,
    });
  };

  const handleEditTag = (tag: UserTag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setNewTagDescription(tag.description || '');
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTag = (tagId: number) => {
    if (window.confirm('Are you sure you want to delete this tag? This will remove it from all media files.')) {
      deleteTagMutation.mutate(tagId);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tag: UserTag) => {
    setDraggedTag(tag);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent, mediaId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverMedia(mediaId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverMedia(null);
  };

  const handleDrop = (e: React.DragEvent, mediaId: number) => {
    e.preventDefault();
    setDragOverMedia(null);
    
    if (draggedTag) {
      // Check if tag is already on this media file
      const mediaFile = mediaFiles.find(m => m.id === mediaId);
      const hasTag = mediaFile?.tags?.some(t => t.id === draggedTag.id);
      
      if (!hasTag) {
        addTagToMediaMutation.mutate({ mediaId, tagId: draggedTag.id });
      }
    }
    
    setDraggedTag(null);
  };

  const handleRemoveTagFromMedia = (mediaId: number, tagId: number) => {
    removeTagFromMediaMutation.mutate({ mediaId, tagId });
  };

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tag Management Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Tag Management</h3>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTag(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tagName">Tag Name</Label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name..."
                />
              </div>
              <div>
                <Label htmlFor="tagColor">Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    id="tagColor"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1">
                    {COLOR_PRESETS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={cn(
                          "w-6 h-6 rounded cursor-pointer border-2",
                          newTagColor === color ? "border-gray-900" : "border-gray-300"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="tagDescription">Description (optional)</Label>
                <Input
                  id="tagDescription"
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  placeholder="Enter tag description..."
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={editingTag ? handleUpdateTag : handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  {editingTag ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tag Filter */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter tags..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tags List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Your Tags ({filteredTags.length})
        </h4>
        
        {isLoadingTags ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter ? 'No tags match your filter.' : 'No tags created yet. Create your first tag to get started!'}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => (
              <div
                key={tag.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tag)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-move",
                  "border-2 border-dashed border-gray-300 hover:border-gray-400",
                  "transition-all duration-200 hover:shadow-md"
                )}
                style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}
              >
                <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                  {tag.name}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditTag(tag)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Files with Tag Drop Zones */}
      {mediaFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Drag tags onto media files to organize them
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaFiles.map(mediaFile => (
              <div
                key={mediaFile.id}
                className={cn(
                  "relative p-4 border-2 border-dashed rounded-lg transition-all duration-200",
                  dragOverMedia === mediaFile.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
                onDragOver={(e) => handleDragOver(e, mediaFile.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, mediaFile.id)}
              >
                {/* Media Preview */}
                <div className="flex items-center gap-3 mb-3">
                  {mediaFile.thumbnailUrl ? (
                    <img
                      src={mediaFile.thumbnailUrl}
                      alt={mediaFile.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <TagIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{mediaFile.title}</p>
                    <p className="text-sm text-gray-500">{mediaFile.mediaType}</p>
                  </div>
                </div>

                {/* Tags on this media */}
                {mediaFile.tags && mediaFile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mediaFile.tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: tag.color, color: 'white' }}
                      >
                        {tag.name}
                        <button
                          onClick={() => handleRemoveTagFromMedia(mediaFile.id, tag.id)}
                          className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Drop zone indicator */}
                {dragOverMedia === mediaFile.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 rounded-lg">
                    <div className="text-blue-600 font-medium">Drop tag here</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}