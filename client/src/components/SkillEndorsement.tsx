import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ThumbsUp, Users } from 'lucide-react';
import { Link } from 'wouter';

interface SkillEndorsementProps {
  skill: string;
  userId: number;
  currentUser?: any;
  endorsements?: Array<{
    id: number;
    endorserId: number;
    endorserName: string;
    endorserImage?: string;
    message?: string;
    createdAt: string;
  }>;
}

export default function SkillEndorsement({ 
  skill, 
  userId, 
  currentUser, 
  endorsements = [] 
}: SkillEndorsementProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current user has already endorsed this skill
  const hasEndorsed = currentUser && endorsements.some(e => e.endorserId === currentUser.id);
  
  const endorseMutation = useMutation({
    mutationFn: async (message?: string) => {
      return await apiRequest('POST', `/api/users/${userId}/skills/${skill}/endorse`, {
        message: message || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      toast({
        title: "Success",
        description: "Skill endorsed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to endorse skill. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEndorseClick = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }

    if (hasEndorsed) {
      toast({
        title: "Already Endorsed",
        description: "You have already endorsed this skill.",
      });
      return;
    }

    endorseMutation.mutate();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={hasEndorsed ? "default" : "outline"}
        size="sm"
        onClick={handleEndorseClick}
        disabled={endorseMutation.isPending}
        className="flex items-center gap-1"
      >
        <ThumbsUp className="w-3 h-3" />
        {endorsements.length}
      </Button>

      {endorsements.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Endorsements for "{skill}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {endorsements.map((endorsement) => (
                <Card key={endorsement.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <Link 
                      href={`/profile/${endorsement.endorserId}`}
                      className="flex-shrink-0"
                    >
                      <Avatar className="w-8 h-8 cursor-pointer hover:opacity-80">
                        <AvatarImage src={endorsement.endorserImage} />
                        <AvatarFallback className="text-xs">
                          {endorsement.endorserName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/profile/${endorsement.endorserId}`}
                        className="font-medium text-sm hover:underline cursor-pointer"
                      >
                        {endorsement.endorserName}
                      </Link>
                      {endorsement.message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          "{endorsement.message}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(endorsement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You need to be logged in to endorse skills. Please login to continue.
            </p>
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <Button className="w-full">Login</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="outline" className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}