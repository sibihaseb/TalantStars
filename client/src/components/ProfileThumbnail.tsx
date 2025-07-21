import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileThumbnailProps {
  imageUrl?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-xl'
};

export default function ProfileThumbnail({ 
  imageUrl, 
  displayName, 
  firstName, 
  lastName, 
  size = 'md',
  className = ''
}: ProfileThumbnailProps) {
  const sizeClass = sizeClasses[size];
  
  // Generate initials
  const initials = [
    firstName?.[0], 
    lastName?.[0], 
    displayName?.[0]
  ].filter(Boolean).join('').substring(0, 2) || 'T';
  
  console.log('🖼️ ProfileThumbnail render:', { imageUrl, displayName, firstName, lastName, initials });
  
  return (
    <Avatar className={`${sizeClass} ${className}`}>
      <AvatarImage 
        src={imageUrl} 
        alt={`${displayName || firstName || 'User'} profile`}
        onError={(e) => {
          console.log('❌ Image failed to load:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
        onLoad={() => {
          console.log('✅ Image loaded successfully:', imageUrl);
        }}
      />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}