import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { Key, Settings, Brain, Shield, Database, Mail } from 'lucide-react';

interface AdminSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  encrypted: boolean;
  updatedBy: string;
  updatedAt: string;
}

const SETTING_CATEGORIES = {
  openai: {
    icon: Brain,
    title: 'OpenAI Settings',
    description: 'Configure AI features and API keys',
    color: 'bg-purple-100 dark:bg-purple-900'
  },
  system: {
    icon: Settings,
    title: 'System Settings',
    description: 'Core system configuration',
    color: 'bg-blue-100 dark:bg-blue-900'
  },
  security: {
    icon: Shield,
    title: 'Security Settings',
    description: 'Authentication and security options',
    color: 'bg-green-100 dark:bg-green-900'
  },
  email: {
    icon: Mail,
    title: 'Email Settings',
    description: 'Email service configuration',
    color: 'bg-orange-100 dark:bg-orange-900'
  }
};

const PREDEFINED_SETTINGS = [
  {
    key: 'OPENAI_API_KEY',
    description: 'OpenAI API key for AI features',
    encrypted: true,
    category: 'openai',
    required: true
  },
  {
    key: 'OPENAI_MODEL',
    description: 'Default OpenAI model (e.g., gpt-4o)',
    encrypted: false,
    category: 'openai',
    defaultValue: 'gpt-4o'
  },
  {
    key: 'AI_FEATURES_ENABLED',
    description: 'Enable AI-powered features',
    encrypted: false,
    category: 'openai',
    defaultValue: 'true'
  },
  {
    key: 'SYSTEM_MAINTENANCE_MODE',
    description: 'Enable maintenance mode',
    encrypted: false,
    category: 'system',
    defaultValue: 'false'
  },
  {
    key: 'DEFAULT_LANGUAGE',
    description: 'Default system language',
    encrypted: false,
    category: 'system',
    defaultValue: 'en'
  },
  {
    key: 'EMAIL_SERVICE_ENABLED',
    description: 'Enable email notifications',
    encrypted: false,
    category: 'email',
    defaultValue: 'true'
  }
];

export function AdminSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('openai');
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery<AdminSetting[]>({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/settings');
      return response.json();
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, description, encrypted }: { key: string; value: string; description?: string; encrypted?: boolean }) => {
      const response = await apiRequest('POST', '/api/admin/settings', {
        key,
        value,
        description,
        encrypted
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: t('settingsSaved'),
        description: "Setting updated successfully",
      });
      setEditingSettings({});
    },
    onError: (error) => {
      toast({
        title: t('errorOccurred'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateSetting = (key: string) => {
    const value = editingSettings[key];
    if (value !== undefined) {
      const predefinedSetting = PREDEFINED_SETTINGS.find(s => s.key === key);
      updateSettingMutation.mutate({
        key,
        value,
        description: predefinedSetting?.description,
        encrypted: predefinedSetting?.encrypted || false
      });
    }
  };

  const getSettingsByCategory = (category: string) => {
    const predefinedForCategory = PREDEFINED_SETTINGS.filter(s => s.category === category);
    return predefinedForCategory.map(predefined => {
      const existing = settings.find(s => s.key === predefined.key);
      return {
        ...predefined,
        value: existing?.value || predefined.defaultValue || '',
        id: existing?.id || 0,
        updatedBy: existing?.updatedBy || '',
        updatedAt: existing?.updatedAt || ''
      };
    });
  };

  const renderSettingInput = (setting: any) => {
    const isEditing = editingSettings[setting.key] !== undefined;
    const currentValue = isEditing ? editingSettings[setting.key] : setting.value;

    return (
      <Card key={setting.key} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <CardTitle className="text-sm">{setting.key}</CardTitle>
              {setting.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
              {setting.encrypted && <Badge variant="secondary" className="text-xs">Encrypted</Badge>}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateSetting(setting.key)}
                    disabled={updateSettingMutation.isPending}
                  >
                    {t('save')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSettings(prev => {
                      const newState = { ...prev };
                      delete newState[setting.key];
                      return newState;
                    })}
                  >
                    {t('cancel')}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingSettings(prev => ({
                    ...prev,
                    [setting.key]: setting.value
                  }))}
                >
                  {t('edit')}
                </Button>
              )}
            </div>
          </div>
          <CardDescription className="text-xs">{setting.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            setting.encrypted ? (
              <Input
                type="password"
                value={currentValue}
                onChange={(e) => setEditingSettings(prev => ({
                  ...prev,
                  [setting.key]: e.target.value
                }))}
                placeholder="Enter value..."
              />
            ) : (
              <Textarea
                value={currentValue}
                onChange={(e) => setEditingSettings(prev => ({
                  ...prev,
                  [setting.key]: e.target.value
                }))}
                placeholder="Enter value..."
                rows={2}
              />
            )
          ) : (
            <div className="text-sm text-muted-foreground">
              {setting.encrypted ? (
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  {setting.value ? '••••••••••••••••' : 'Not set'}
                </div>
              ) : (
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {setting.value || 'Not set'}
                </code>
              )}
            </div>
          )}
          {setting.updatedAt && (
            <div className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(setting.updatedAt).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('adminSettings')}</h1>
          <p className="text-muted-foreground">
            Configure system settings and API keys
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(SETTING_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(SETTING_CATEGORIES).map(([key, category]) => {
          const Icon = category.icon;
          const categorySettings = getSettingsByCategory(key);
          
          return (
            <TabsContent key={key} value={key} className="space-y-4">
              <Card className={`${category.color} border-0`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {categorySettings.map(renderSettingInput)}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}