import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Search, 
  Globe, 
  Image, 
  FileText, 
  Tag, 
  Eye, 
  Edit, 
  Save, 
  Upload, 
  Link,
  BarChart3,
  Target,
  Zap,
  Settings,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SEOSettings {
  id: string;
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  favicon: string;
  robots: string;
  canonicalUrl: string;
  schemaMarkup: string;
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
  isActive: boolean;
  pagePath: string;
  createdAt: string;
  updatedAt: string;
}

const defaultSEOPages = [
  { path: '/', name: 'Home Page', description: 'Main landing page' },
  { path: '/featured-talents', name: 'Featured Talents', description: 'Showcase of featured talents' },
  { path: '/browse-talents', name: 'Browse Talents', description: 'Talent discovery page' },
  { path: '/jobs', name: 'Jobs', description: 'Job listings and opportunities' },
  { path: '/about', name: 'About Us', description: 'Company information' },
  { path: '/contact', name: 'Contact', description: 'Contact information' },
  { path: '/pricing', name: 'Pricing', description: 'Pricing plans and tiers' },
  { path: '/auth', name: 'Authentication', description: 'Login and registration' }
];

export default function SEOManager() {
  const [selectedPage, setSelectedPage] = useState('/');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    pageTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    favicon: '',
    robots: 'index, follow',
    canonicalUrl: '',
    schemaMarkup: '',
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    isActive: true,
    pagePath: '/'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seoSettings = [], isLoading } = useQuery<SEOSettings[]>({
    queryKey: ['/api/admin/seo-settings'],
  });

  const { data: seoAnalytics } = useQuery({
    queryKey: ['/api/admin/seo-analytics'],
  });

  const updateSEOMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/seo-settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo-settings'] });
      toast({
        title: "Success",
        description: "SEO settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update SEO settings",
        variant: "destructive",
      });
    }
  });

  const generateSEOMutation = useMutation({
    mutationFn: async (pagePath: string) => {
      const response = await apiRequest('POST', '/api/admin/generate-seo', { pagePath });
      return response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        ...data
      }));
      toast({
        title: "Success",
        description: "SEO content generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate SEO content",
        variant: "destructive",
      });
    }
  });

  const currentPageSettings = seoSettings.find(s => s.pagePath === selectedPage);

  const handlePageSelect = (pagePath: string) => {
    setSelectedPage(pagePath);
    const pageSettings = seoSettings.find(s => s.pagePath === pagePath);
    if (pageSettings) {
      setFormData({
        pageTitle: pageSettings.pageTitle,
        metaDescription: pageSettings.metaDescription,
        metaKeywords: pageSettings.metaKeywords.join(', '),
        ogTitle: pageSettings.ogTitle,
        ogDescription: pageSettings.ogDescription,
        ogImage: pageSettings.ogImage,
        twitterTitle: pageSettings.twitterTitle,
        twitterDescription: pageSettings.twitterDescription,
        twitterImage: pageSettings.twitterImage,
        favicon: pageSettings.favicon,
        robots: pageSettings.robots,
        canonicalUrl: pageSettings.canonicalUrl,
        schemaMarkup: pageSettings.schemaMarkup,
        googleAnalyticsId: pageSettings.googleAnalyticsId,
        googleSearchConsoleId: pageSettings.googleSearchConsoleId,
        isActive: pageSettings.isActive,
        pagePath: pagePath
      });
    } else {
      // Generate default SEO for this page
      generateDefaultSEO(pagePath);
    }
  };

  const generateDefaultSEO = (pagePath: string) => {
    const pageInfo = defaultSEOPages.find(p => p.path === pagePath);
    const siteName = "Talents & Stars";
    const baseDescription = "Discover exceptional talent in the entertainment industry. Connect with actors, musicians, voice artists, models, and more on our AI-powered platform.";
    
    setFormData({
      pageTitle: pageInfo ? `${pageInfo.name} | ${siteName}` : `${siteName} - Entertainment Talent Platform`,
      metaDescription: pageInfo ? `${pageInfo.description} - ${baseDescription}` : baseDescription,
      metaKeywords: 'talent, entertainment, actors, musicians, voice artists, models, casting, auditions, jobs, portfolio',
      ogTitle: pageInfo ? `${pageInfo.name} | ${siteName}` : `${siteName} - Entertainment Talent Platform`,
      ogDescription: pageInfo ? `${pageInfo.description} - ${baseDescription}` : baseDescription,
      ogImage: '/og-image.jpg',
      twitterTitle: pageInfo ? `${pageInfo.name} | ${siteName}` : `${siteName} - Entertainment Talent Platform`,
      twitterDescription: pageInfo ? `${pageInfo.description} - ${baseDescription}` : baseDescription,
      twitterImage: '/twitter-image.jpg',
      favicon: '/favicon.ico',
      robots: 'index, follow',
      canonicalUrl: `https://talents-stars.com${pagePath}`,
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": `https://talents-stars.com${pagePath}`,
        "description": baseDescription
      }, null, 2),
      googleAnalyticsId: '',
      googleSearchConsoleId: '',
      isActive: true,
      pagePath: pagePath
    });
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      metaKeywords: formData.metaKeywords.split(',').map(k => k.trim()).filter(k => k)
    };
    updateSEOMutation.mutate(submitData);
  };

  const handleGenerateAI = () => {
    generateSEOMutation.mutate(selectedPage);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Analytics Overview */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            SEO Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Search Ranking</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">15.2</div>
              <div className="text-sm text-blue-600">Average Position</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Organic Traffic</span>
              </div>
              <div className="text-2xl font-bold text-green-700">1,234</div>
              <div className="text-sm text-green-600">Monthly Visitors</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Keywords</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">89</div>
              <div className="text-sm text-purple-600">Ranking Keywords</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Page Speed</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">92</div>
              <div className="text-sm text-orange-600">Performance Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings Manager */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              SEO Content Management
            </span>
            <Button 
              variant="secondary" 
              onClick={handleGenerateAI}
              disabled={generateSEOMutation.isPending}
            >
              <Zap className="w-4 h-4 mr-2" />
              {generateSEOMutation.isPending ? 'Generating...' : 'AI Generate'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Page Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Page</Label>
              <div className="space-y-1">
                {defaultSEOPages.map((page) => {
                  const hasSettings = seoSettings.some(s => s.pagePath === page.path);
                  return (
                    <button
                      key={page.path}
                      onClick={() => handlePageSelect(page.path)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPage === page.path 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{page.name}</div>
                          <div className="text-sm text-gray-500">{page.path}</div>
                        </div>
                        {hasSettings ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEO Form */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic SEO</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="pageTitle">Page Title</Label>
                      <Input
                        id="pageTitle"
                        value={formData.pageTitle}
                        onChange={(e) => setFormData({...formData, pageTitle: e.target.value})}
                        placeholder="Page Title - Brand Name"
                        maxLength={60}
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {formData.pageTitle.length}/60 characters
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                        placeholder="Compelling description of the page content..."
                        rows={3}
                        maxLength={160}
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {formData.metaDescription.length}/160 characters
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <Input
                        id="metaKeywords"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({...formData, metaKeywords: e.target.value})}
                        placeholder="keyword1, keyword2, keyword3..."
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="social" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Open Graph (Facebook)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="ogTitle">OG Title</Label>
                        <Input
                          id="ogTitle"
                          value={formData.ogTitle}
                          onChange={(e) => setFormData({...formData, ogTitle: e.target.value})}
                          placeholder="Facebook share title"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="ogDescription">OG Description</Label>
                        <Textarea
                          id="ogDescription"
                          value={formData.ogDescription}
                          onChange={(e) => setFormData({...formData, ogDescription: e.target.value})}
                          placeholder="Facebook share description"
                          rows={3}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="ogImage">OG Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="ogImage"
                            value={formData.ogImage}
                            onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-lg">Twitter Card</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="twitterTitle">Twitter Title</Label>
                        <Input
                          id="twitterTitle"
                          value={formData.twitterTitle}
                          onChange={(e) => setFormData({...formData, twitterTitle: e.target.value})}
                          placeholder="Twitter share title"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="twitterDescription">Twitter Description</Label>
                        <Textarea
                          id="twitterDescription"
                          value={formData.twitterDescription}
                          onChange={(e) => setFormData({...formData, twitterDescription: e.target.value})}
                          placeholder="Twitter share description"
                          rows={3}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="twitterImage">Twitter Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="twitterImage"
                            value={formData.twitterImage}
                            onChange={(e) => setFormData({...formData, twitterImage: e.target.value})}
                            placeholder="https://example.com/twitter-image.jpg"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="technical" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="robots">Robots Meta Tag</Label>
                        <Input
                          id="robots"
                          value={formData.robots}
                          onChange={(e) => setFormData({...formData, robots: e.target.value})}
                          placeholder="index, follow"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="canonicalUrl">Canonical URL</Label>
                        <Input
                          id="canonicalUrl"
                          value={formData.canonicalUrl}
                          onChange={(e) => setFormData({...formData, canonicalUrl: e.target.value})}
                          placeholder="https://example.com/page"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="favicon">Favicon URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="favicon"
                            value={formData.favicon}
                            onChange={(e) => setFormData({...formData, favicon: e.target.value})}
                            placeholder="/favicon.ico"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="schemaMarkup">Schema Markup (JSON-LD)</Label>
                      <Textarea
                        id="schemaMarkup"
                        value={formData.schemaMarkup}
                        onChange={(e) => setFormData({...formData, schemaMarkup: e.target.value})}
                        placeholder="JSON-LD structured data"
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                        <Input
                          id="googleAnalyticsId"
                          value={formData.googleAnalyticsId}
                          onChange={(e) => setFormData({...formData, googleAnalyticsId: e.target.value})}
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="googleSearchConsoleId">Google Search Console ID</Label>
                        <Input
                          id="googleSearchConsoleId"
                          value={formData.googleSearchConsoleId}
                          onChange={(e) => setFormData({...formData, googleSearchConsoleId: e.target.value})}
                          placeholder="Search Console verification ID"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => generateDefaultSEO(selectedPage)}
                >
                  Reset to Default
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={updateSEOMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSEOMutation.isPending ? 'Saving...' : 'Save SEO Settings'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}