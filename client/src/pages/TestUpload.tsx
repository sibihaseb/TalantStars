import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

export default function TestUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, refetch } = useAuth();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      
      const response = await apiRequest('POST', '/api/login', {
        username,
        password
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        refetch(); // Refresh user data
      } else {
        const errorData = await response.json();
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const fileInput = event.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadResult('');
    
    try {
      console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.get('title') as string || 'Test Upload');
      uploadFormData.append('description', formData.get('description') as string || 'Test description');
      uploadFormData.append('category', 'portfolio');
      
      const response = await fetch('/api/media', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        setUploadResult(`Upload failed: ${response.status} - ${errorText}`);
        toast({
          title: "Upload Failed",
          description: `${response.status}: ${errorText}`,
          variant: "destructive",
        });
        return;
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      setUploadResult(`Upload successful: ${JSON.stringify(result, null, 2)}`);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult(`Upload error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading authentication status...</div>
              ) : isAuthenticated ? (
                <div className="text-green-600">
                  ✓ Authenticated as: {user?.firstName} {user?.lastName} ({user?.username})
                </div>
              ) : (
                <div className="text-red-600">
                  ✗ Not authenticated - please login below
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login Form */}
          {!isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      defaultValue="martyTEST"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      defaultValue="123456"
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* File Upload Form */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Test File Upload</CardTitle>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    defaultValue="Test Upload"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    defaultValue="Test description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept="image/*,video/*,audio/*"
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </form>
              
              {uploadResult && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <h3 className="font-semibold mb-2">Upload Result:</h3>
                  <pre className="text-sm overflow-auto">{uploadResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}