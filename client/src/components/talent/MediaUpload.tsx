import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, Check, Play, Image as ImageIcon, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export function MediaUpload({ onUploadComplete }: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Media</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
  );
}
