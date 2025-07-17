import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  FileText,
  Database,
  Globe,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataManagementModalProps {
  trigger: React.ReactNode;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ trigger }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'rectify' | 'erase' | 'portability' | 'restrict' | 'object'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [requestForm, setRequestForm] = useState({
    requestType: '',
    description: '',
    email: '',
    phone: ''
  });

  const gdprRights = [
    {
      id: 'access',
      title: 'Right to Access',
      description: 'Get a copy of your personal data',
      icon: <Eye className="h-5 w-5" />,
      color: 'bg-blue-500',
      status: 'Available'
    },
    {
      id: 'rectify',
      title: 'Right to Rectification',
      description: 'Correct inaccurate or incomplete data',
      icon: <Edit className="h-5 w-5" />,
      color: 'bg-green-500',
      status: 'Available'
    },
    {
      id: 'erase',
      title: 'Right to Erasure',
      description: 'Delete your personal data ("right to be forgotten")',
      icon: <Trash2 className="h-5 w-5" />,
      color: 'bg-red-500',
      status: 'Available'
    },
    {
      id: 'portability',
      title: 'Right to Data Portability',
      description: 'Receive your data in a structured format',
      icon: <Download className="h-5 w-5" />,
      color: 'bg-purple-500',
      status: 'Available'
    },
    {
      id: 'restrict',
      title: 'Right to Restrict Processing',
      description: 'Limit how we use your data',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-yellow-500',
      status: 'Available'
    },
    {
      id: 'object',
      title: 'Right to Object',
      description: 'Object to processing based on legitimate interest',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-orange-500',
      status: 'Available'
    }
  ];

  const dataCategories = [
    {
      category: 'Account Information',
      icon: <Settings className="h-4 w-4" />,
      items: ['Name', 'Email', 'Username', 'Phone number', 'Location'],
      retention: '30 days after account deletion'
    },
    {
      category: 'Profile Information',
      icon: <FileText className="h-4 w-4" />,
      items: ['Bio', 'Experience', 'Skills', 'Portfolio content', 'Media files'],
      retention: '90 days after account deletion'
    },
    {
      category: 'Usage Data',
      icon: <Database className="h-4 w-4" />,
      items: ['Login history', 'Platform activity', 'Search queries', 'Application history'],
      retention: '1 year'
    },
    {
      category: 'Communication Data',
      icon: <Mail className="h-4 w-4" />,
      items: ['Messages', 'Support tickets', 'Email communications'],
      retention: '2 years for business records'
    }
  ];

  const handleSubmitRequest = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRequestStatus('success');
      setRequestForm({
        requestType: '',
        description: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      setRequestStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Shield className="h-4 w-4" /> },
    { id: 'access', label: 'Access Data', icon: <Eye className="h-4 w-4" /> },
    { id: 'rectify', label: 'Correct Data', icon: <Edit className="h-4 w-4" /> },
    { id: 'erase', label: 'Delete Data', icon: <Trash2 className="h-4 w-4" /> },
    { id: 'portability', label: 'Export Data', icon: <Download className="h-4 w-4" /> },
    { id: 'restrict', label: 'Restrict Processing', icon: <Shield className="h-4 w-4" /> },
    { id: 'object', label: 'Object to Processing', icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Data Rights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gdprRights.map((right) => (
                  <Card key={right.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${right.color} text-white`}>
                          {right.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{right.title}</CardTitle>
                          <CardDescription className="text-xs">{right.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge variant="secondary" className="text-xs">
                        {right.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Categories & Retention</h3>
              <div className="space-y-4">
                {dataCategories.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{category.category}</CardTitle>
                          <CardDescription className="text-xs">
                            Retention: {category.retention}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'access':
        return (
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Request a copy of all personal data we have about you. This includes your profile, activity history, and communications.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Request Data Export
                </CardTitle>
                <CardDescription>
                  We'll prepare a comprehensive report of your data and send it to your registered email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Additional Information (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Specify any particular data you're looking for..."
                      value={requestForm.description}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitRequest}
                    disabled={isProcessing || !requestForm.email}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Submit Data Access Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'erase':
        return (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Request deletion of your personal data. This action cannot be undone and will result in permanent account closure.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Request Data Deletion
                </CardTitle>
                <CardDescription>
                  All your data will be permanently deleted within 30 days. Some data may be retained for legal compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Confirm Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reason">Reason for Deletion (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please tell us why you're requesting deletion..."
                      value={requestForm.description}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitRequest}
                    disabled={isProcessing || !requestForm.email}
                    variant="destructive"
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Submit Deletion Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Submit a request to exercise your data protection rights. We'll respond within 30 days.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Submit Data Rights Request</CardTitle>
                <CardDescription>
                  Tell us what you'd like us to do with your data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={requestForm.email}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Request Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your request..."
                      value={requestForm.description}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitRequest}
                    disabled={isProcessing || !requestForm.email || !requestForm.description}
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Submit Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Rights & Privacy Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
            
            {/* Status Messages */}
            <AnimatePresence>
              {requestStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4"
                >
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Your request has been submitted successfully. We'll process it within 30 days and contact you via email.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              {requestStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4"
                >
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      There was an error processing your request. Please try again or contact support.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Response time: Up to 30 days | Contact: privacy@talentsandstars.com</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataManagementModal;