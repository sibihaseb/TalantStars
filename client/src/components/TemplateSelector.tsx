import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Palette, Sparkles, Layout, User, Image, Zap } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  tier: 'free' | 'premium' | 'professional' | 'enterprise';
  features: string[];
}

const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Professional and timeless',
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    tier: 'free',
    features: ['Clean layout', 'Basic customization', 'Mobile responsive']
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with bold elements',
    preview: 'bg-gradient-to-br from-purple-50 to-pink-100',
    tier: 'premium',
    features: ['Advanced layouts', 'Custom colors', 'Portfolio showcase']
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic and visually stunning',
    preview: 'bg-gradient-to-br from-orange-50 to-red-100',
    tier: 'premium',
    features: ['Artistic design', 'Media focus', 'Creative portfolio']
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Executive-level presentation',
    preview: 'bg-gradient-to-br from-gray-50 to-slate-100',
    tier: 'professional',
    features: ['Corporate design', 'Achievement focus', 'Professional network']
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'Perfect for performers and entertainers',
    preview: 'bg-gradient-to-br from-yellow-50 to-amber-100',
    tier: 'professional',
    features: ['Performance focus', 'Media galleries', 'Show reels']
  }
];

const tierInfo = {
  free: { name: 'Free', icon: User, color: 'text-gray-600' },
  premium: { name: 'Premium', icon: Crown, color: 'text-yellow-600' },
  professional: { name: 'Professional', icon: Sparkles, color: 'text-purple-600' },
  enterprise: { name: 'Enterprise', icon: Zap, color: 'text-blue-600' }
};

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  userTier: string;
  onUpgrade: () => void;
}

export default function TemplateSelector({ 
  selectedTemplate, 
  onTemplateChange, 
  userTier, 
  onUpgrade 
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const canAccessTemplate = (templateTier: string) => {
    const tierLevels = { free: 0, premium: 1, professional: 2, enterprise: 3 };
    return tierLevels[userTier as keyof typeof tierLevels] >= tierLevels[templateTier as keyof typeof tierLevels];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Palette className="h-6 w-6 text-purple-600" />
          Choose Your Profile Style
        </div>
        <p className="text-gray-600">Select a template that matches your professional image</p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const canAccess = canAccessTemplate(template.tier);
          const TierIcon = tierInfo[template.tier].icon;
          const isSelected = selectedTemplate === template.id;
          const isHovered = hoveredTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-purple-500 shadow-xl' 
                  : 'hover:shadow-lg'
              } ${!canAccess ? 'opacity-60' : ''}`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => canAccess ? onTemplateChange(template.id) : onUpgrade()}
            >
              {/* Template Preview */}
              <div className={`h-32 rounded-t-lg ${template.preview} relative overflow-hidden`}>
                {/* Preview Content */}
                <div className="absolute inset-0 p-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 h-full flex flex-col justify-between">
                    <div>
                      <div className="h-2 bg-gray-300 rounded mb-2"></div>
                      <div className="h-1 bg-gray-200 rounded mb-1"></div>
                      <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Tier Badge */}
                <Badge 
                  className={`absolute top-2 right-2 ${
                    template.tier === 'free' ? 'bg-gray-100 text-gray-700' :
                    template.tier === 'premium' ? 'bg-yellow-100 text-yellow-700' :
                    template.tier === 'professional' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}
                  variant="secondary"
                >
                  <TierIcon className="w-3 h-3 mr-1" />
                  {tierInfo[template.tier].name}
                </Badge>

                {/* Lock Overlay for Inaccessible Templates */}
                {!canAccess && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Lock className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-purple-500 rounded-full p-1">
                      <Layout className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {template.name}
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {canAccess ? (
                    <Button 
                      variant={isSelected ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateChange(template.id);
                      }}
                    >
                      {isSelected ? 'Selected' : 'Select Template'}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgrade();
                      }}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Access
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Selection Info */}
      {selectedTemplate && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Layout className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">
                  Currently using: <span className="text-purple-600">
                    {templates.find(t => t.id === selectedTemplate)?.name || 'Classic'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Your profile will be displayed using this template design
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}