import ProfileSharing from "@/components/profile/ProfileSharing";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

export default function ProfileSharingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <ProfileSharing />;
}