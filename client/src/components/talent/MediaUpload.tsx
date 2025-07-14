import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, File, X, Check, Play, Image as ImageIcon, Music, Link, Youtube, Video, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MediaUploadProps {
  onUploadComplete?: (media: any) => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
  id?: string;
}

interface ExternalVideoLink {
  url: string;
  platform: string;
  title: string;
  description?: string;
}

export function MediaUpload({ onUploadComplete }: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showExternalDialog, setShowExternalDialog] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("images");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing media files
  const { data: existingMedia = [], isLoading: isLoadingMedia } = useQuery({
    queryKey: ["/api/media"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/media");
      return response.json();
    },
  });

  // Categorize media by type
  const categorizedMedia = {
    images: existingMedia.filter((media: any) => media.mediaType === "image"),
    videos: existingMedia.filter((media: any) => media.mediaType === "video"),
    audio: existingMedia.filter((media: any) => media.mediaType === "audio"),
  };

  const uploadMutation = useMutation({
    mutationFn: async (fileData: any) => {
      const response = await apiRequest("POST", "/api/media", fileData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      onUploadComplete?.(data);
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addExternalVideoMutation = useMutation({
    mutationFn: async (videoData: ExternalVideoLink) => {
      const response = await apiRequest("POST", "/api/media/external", {
        external_url: videoData.url,
        external_platform: videoData.platform,
        title: videoData.title,
        description: videoData.description,
        media_type: "video",
        is_external: true,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      onUploadComplete?.(data);
      setShowExternalDialog(false);
      toast({
        title: "External video added",
        description: "Your external video link has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add external video",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      await apiRequest("DELETE", `/api/media/${mediaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Media deleted",
        description: "Media file has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/quicktime",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== fileList.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only images, videos, or audio files.",
        variant: "destructive",
      });
    }

    const newFiles: UploadFile[] = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading",
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress and upload files
    newFiles.forEach((uploadFile, index) => {
      simulateUpload(uploadFile, files.length + index);
    });
  };

  const simulateUpload = async (uploadFile: UploadFile, index: number) => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setFiles((prev) => {
        const updated = [...prev];
        if (updated[index] && updated[index].progress < 90) {
          updated[index].progress += Math.random() * 20;
        }
        return updated;
      });
    }, 200);

    try {
      // In a real implementation, you would upload to a cloud storage service
      // For now, we'll create a mock media record
      const mediaData = {
        filename: `${Date.now()}_${uploadFile.file.name}`,
        originalName: uploadFile.file.name,
        mimeType: uploadFile.file.type,
        size: uploadFile.file.size,
        url: URL.createObjectURL(uploadFile.file), // Mock URL
        thumbnailUrl: uploadFile.file.type.startsWith("image/") 
          ? URL.createObjectURL(uploadFile.file) 
          : null,
        mediaType: uploadFile.file.type.startsWith("image/") 
          ? "image" 
          : uploadFile.file.type.startsWith("video/") 
          ? "video" 
          : "audio",
        tags: [],
        description: "",
        isPublic: true,
      };

      await uploadMutation.mutateAsync(mediaData);

      clearInterval(progressInterval);
      setFiles((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].progress = 100;
          updated[index].status = "complete";
        }
        return updated;
      });
    } catch (error) {
      clearInterval(progressInterval);
      setFiles((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].status = "error";
        }
        return updated;
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type.startsWith("video/")) return Play;
    if (file.type.startsWith("audio/")) return Music;
    return File;
  };

  const detectVideoPlatform = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    } else if (url.includes("vimeo.com")) {
      return "vimeo";
    } else if (url.includes("instagram.com")) {
      return "instagram";
    } else if (url.includes("tiktok.com")) {
      return "tiktok";
    } else {
      return "other";
    }
  };

  const handleExternalVideoSubmit = (formData: FormData) => {
    const url = formData.get("url") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    if (!url || !title) {
      toast({
        title: "Missing information",
        description: "Please provide both URL and title for the video.",
        variant: "destructive",
      });
      return;
    }

    const platform = detectVideoPlatform(url);
    
    addExternalVideoMutation.mutate({
      url,
      platform,
      title,
      description,
    });
  };

  const renderMediaCard = (media: any) => (
    <Card key={media.id} className="group relative overflow-hidden">
      <CardContent className="p-4">
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
          {media.mediaType === "image" ? (
            <img 
              src={media.url} 
              alt={media.originalName}
              className="w-full h-full object-cover"
            />
          ) : media.mediaType === "video" ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <Play className="h-8 w-8 text-white" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-500">
              <Music className="h-8 w-8 text-white" />
            </div>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => deleteMutation.mutate(media.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {media.originalName}
        </p>
        {media.external_url && (
          <Badge variant="outline" className="mt-2">
            {media.external_platform || 'External'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Media Portfolio</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="external">External Videos</TabsTrigger>
            </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                Drag and drop your media files here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Check className="h-4 w-4 text-green-500" />
                <span>Videos, images, audio files supported</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Check className="h-4 w-4 text-green-500" />
                <span>AI-powered automatic tagging</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cloud storage with CDN delivery</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="external" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Link className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Add External Video</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Add videos from YouTube, Vimeo, Instagram, TikTok, or other platforms to your portfolio
              </p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleExternalVideoSubmit(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="url">Video URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter the video title"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the video content"
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={addExternalVideoMutation.isPending}
                className="w-full"
              >
                {addExternalVideoMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Video...
                  </>
                ) : (
                  <>
                    <Youtube className="h-4 w-4 mr-2" />
                    Add External Video
                  </>
                )}
              </Button>
            </form>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Youtube className="h-4 w-4 text-red-500" />
                <span>YouTube</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4 text-blue-500" />
                <span>Vimeo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ImageIcon className="h-4 w-4 text-pink-500" />
                <span>Instagram</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Music className="h-4 w-4 text-black" />
                <span>TikTok</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Uploading Files
            </h4>
            {files.map((uploadFile, index) => {
              const Icon = getFileIcon(uploadFile.file);
              return (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadFile.status === "uploading" && (
                      <Progress value={uploadFile.progress} className="mt-2" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadFile.status === "complete" && (
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Complete
                      </Badge>
                    )}
                    {uploadFile.status === "error" && (
                      <Badge variant="destructive">Error</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Categorized Media Display */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <File className="h-5 w-5" />
          <span>Your Media Portfolio</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeMediaTab} onValueChange={setActiveMediaTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images ({categorizedMedia.images.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Videos ({categorizedMedia.videos.length})
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Audio ({categorizedMedia.audio.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-6">
            {categorizedMedia.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedMedia.images.map(renderMediaCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No images uploaded yet</p>
                <p className="text-sm">Upload your headshots, portfolio images, and behind-the-scenes photos</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {categorizedMedia.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedMedia.videos.map(renderMediaCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No videos uploaded yet</p>
                <p className="text-sm">Upload demo reels, performance videos, or add external links</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            {categorizedMedia.audio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedMedia.audio.map(renderMediaCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No audio files uploaded yet</p>
                <p className="text-sm">Upload voice samples, music recordings, or audio demos</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
  );
}
