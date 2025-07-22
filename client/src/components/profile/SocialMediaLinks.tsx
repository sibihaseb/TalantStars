import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye } from 'lucide-react';
import { 
  SiFacebook,
  SiX,
  SiInstagram,
  SiLinkedin,
  SiYoutube,
  SiTiktok,
  SiTelegram,
  SiSnapchat,
  SiWhatsapp,
  SiReddit,
  SiDiscord,
  SiPinterest
} from 'react-icons/si';

const SOCIAL_PLATFORMS = {
  facebook: { name: 'Facebook', icon: SiFacebook, color: '#1877F2' },
  instagram: { name: 'Instagram', icon: SiInstagram, color: '#E4405F' },
  twitter: { name: 'X (Twitter)', icon: SiX, color: '#000000' },
  linkedin: { name: 'LinkedIn', icon: SiLinkedin, color: '#0A66C2' },
  youtube: { name: 'YouTube', icon: SiYoutube, color: '#FF0000' },
  tiktok: { name: 'TikTok', icon: SiTiktok, color: '#000000' },
  telegram: { name: 'Telegram', icon: SiTelegram, color: '#26A5E4' },
  snapchat: { name: 'Snapchat', icon: SiSnapchat, color: '#FFFC00' },
  whatsapp: { name: 'WhatsApp', icon: SiWhatsapp, color: '#25D366' },
  reddit: { name: 'Reddit', icon: SiReddit, color: '#FF4500' },
  discord: { name: 'Discord', icon: SiDiscord, color: '#5865F2' },
  pinterest: { name: 'Pinterest', icon: SiPinterest, color: '#BD081C' }
};

interface SocialMediaLink {
  id: number;
  platform: string;
  username: string;
  url: string;
  displayName?: string;
  isVisible: boolean;
  iconColor?: string;
  clickCount: number;
}

interface SocialMediaLinksProps {
  socialLinks: SocialMediaLink[];
  userId: number;
  variant?: 'classic' | 'modern' | 'artistic' | 'minimal' | 'cinematic';
  onLinkClick?: (linkId: number) => void;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ 
  socialLinks = [], 
  userId, 
  variant = 'classic',
  onLinkClick 
}) => {
  // Filter visible links and sort by sortOrder
  const visibleLinks = socialLinks
    .filter(link => link.isVisible)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (!visibleLinks.length) {
    return null;
  }

  const handleLinkClick = async (link: SocialMediaLink) => {
    // Track click analytics if callback provided
    if (onLinkClick) {
      onLinkClick(link.id);
    }

    // Open link in new tab
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const getPlatformConfig = (platformId: string) => {
    return SOCIAL_PLATFORMS[platformId as keyof typeof SOCIAL_PLATFORMS] || SOCIAL_PLATFORMS.facebook;
  };

  // Different styles based on template variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'modern':
        return {
          container: 'flex flex-wrap gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl',
          button: 'flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md',
          icon: 'h-5 w-5',
          text: 'text-sm font-medium text-gray-700 dark:text-gray-300'
        };
      case 'artistic':
        return {
          container: 'grid grid-cols-2 gap-2 p-3 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-yellow-900/30 rounded-2xl',
          button: 'flex items-center justify-center gap-1 px-3 py-2 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105',
          icon: 'h-4 w-4',
          text: 'text-xs font-semibold text-gray-800 dark:text-gray-200'
        };
      case 'minimal':
        return {
          container: 'flex items-center gap-4 py-2',
          button: 'p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors',
          icon: 'h-6 w-6',
          text: 'sr-only'
        };
      case 'cinematic':
        return {
          container: 'flex flex-wrap gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-gray-200/30 dark:border-gray-700/30',
          button: 'flex items-center gap-2 px-3 py-1.5 bg-black/10 dark:bg-white/10 backdrop-blur-sm border border-gray-300/30 dark:border-gray-600/30 rounded-md hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-200',
          icon: 'h-4 w-4',
          text: 'text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-200'
        };
      default: // classic
        return {
          container: 'flex flex-wrap gap-2 py-3',
          button: 'flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors',
          icon: 'h-4 w-4',
          text: 'text-sm font-medium text-gray-700 dark:text-gray-300'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Social Media
        </h3>
        <Badge variant="secondary" className="text-xs">
          {visibleLinks.length}
        </Badge>
      </div>
      
      <div className={styles.container}>
        {visibleLinks.map((link) => {
          const platform = getPlatformConfig(link.platform);
          const Icon = platform.icon;
          const displayName = link.displayName || link.username || platform.name;
          
          return (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className={styles.button}
              title={`Visit ${displayName} on ${platform.name}`}
            >
              <Icon 
                className={styles.icon} 
                style={{ color: link.iconColor || platform.color }} 
              />
              
              {variant !== 'minimal' && (
                <span className={styles.text}>
                  {variant === 'artistic' || variant === 'cinematic' 
                    ? platform.name 
                    : displayName
                  }
                </span>
              )}
              
              {variant === 'modern' && (
                <ExternalLink className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        })}
      </div>
      
      {variant === 'classic' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {visibleLinks.reduce((total, link) => total + link.clickCount, 0)} total clicks
        </p>
      )}
    </div>
  );
};

export default SocialMediaLinks;