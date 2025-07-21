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
      {/* Header with Enhanced Styling */}
      <div className="text-center space-y-4 mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          <div className="flex items-center justify-center gap-3 text-3xl font-bold">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl shadow-lg">
              <Palette className="h-8 w-8 text-white" />
            </div>
            Choose Your Profile Style
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a stunning template that showcases your talent and professional brand
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4" />
          Professional designs crafted for entertainers
        </div>
      </div>

      {/* Template Grid with Better Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {templates.map((template) => {
          const canAccess = canAccessTemplate(template.tier);
          const TierIcon = tierInfo[template.tier].icon;
          const isSelected = selectedTemplate === template.id;
          const isHovered = hoveredTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={`relative cursor-pointer transition-all duration-500 transform hover:scale-105 hover:rotate-1 ${
                isSelected 
                  ? 'ring-4 ring-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-blue-50' 
                  : 'hover:shadow-2xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-white'
              } ${!canAccess ? 'opacity-60' : ''} group`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => canAccess ? onTemplateChange(template.id) : onUpgrade()}
            >
              {/* Template Preview - Enhanced */}
              <div className={`h-48 rounded-t-lg ${template.preview} relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                {/* Animated Preview Content */}
                <div className="absolute inset-0 p-6">
                  <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 h-full flex flex-col justify-between shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <div className="space-y-3">
                      {/* Profile Header Mockup */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full animate-pulse"></div>
                        <div className="space-y-1 flex-1">
                          <div className="h-3 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full"></div>
                          <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                        </div>
                      </div>
                      {/* Content Lines */}
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 rounded-full"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-5/6"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    {/* Media Gallery Mockup */}
                    <div className="flex gap-2 justify-between">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg shadow-sm"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-green-300 to-blue-400 rounded-lg shadow-sm"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-300 to-purple-400 rounded-lg shadow-sm"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-lg shadow-sm"></div>
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
                <div className="space-y-2">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                  {template.features.length > 3 && (
                    <div className="text-xs text-gray-400 italic">
                      +{template.features.length - 3} more features
                    </div>
                  )}
                </div>

                {/* Enhanced Action Section */}
                <div className="pt-3 space-y-2">
                  {canAccess ? (
                    <Button 
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                          : 'border-2 border-purple-200 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateChange(template.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Currently Selected
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4 mr-2" />
                          Choose This Style
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-center p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-gray-600 mb-1">Premium Template</p>
                        <div className="flex items-center justify-center gap-1 text-xs font-medium text-yellow-700">
                          <Crown className="w-3 h-3" />
                          {tierInfo[template.tier].name} Plan Required
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpgrade();
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
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