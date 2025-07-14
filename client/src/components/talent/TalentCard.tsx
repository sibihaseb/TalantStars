import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, CheckCircle, MessageCircle } from "lucide-react";
import { UserProfile } from "@shared/schema";

interface TalentCardProps {
  profile: UserProfile;
  showActions?: boolean;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function TalentCard({ 
  profile, 
  showActions = true, 
  onMessage, 
  onViewProfile 
}: TalentCardProps) {
  const getTalentTypeIcon = (type: string) => {
    switch (type) {
      case "actor":
        return "🎭";
      case "musician":
        return "🎵";
      case "model":
        return "📸";
      case "voice_artist":
        return "🎙️";
      default:
        return "⭐";
    }
  };

  const formatTalentType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.displayName?.[0] || "T"}
            </div>
            {profile.isVerified && (
              <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-green-500 fill-current" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {profile.displayName || "Anonymous Talent"}
              </h3>
              <span className="text-lg">{getTalentTypeIcon(profile.talentType || "")}</span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {formatTalentType(profile.talentType || "")}
            </p>

            {profile.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center space-x-4 mb-3">
              {profile.location && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span>4.9 (127 reviews)</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={profile.availabilityStatus === "available" ? "default" : "secondary"}
                  className={
                    profile.availabilityStatus === "available"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }
                >
                  {profile.availabilityStatus === "available" ? "Available" : "Busy"}
                </Badge>
              </div>

              {showActions && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage?.(profile.userId)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onViewProfile?.(profile.userId)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
