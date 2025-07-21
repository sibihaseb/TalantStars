import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PlusIcon, StarIcon, CheckIcon, XIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
interface UserProfile {
  userId: number;
  displayName?: string;
  [key: string]: any;
}
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SkillEndorsement {
  id: number;
  endorserId: string;
  endorsedUserId: string;
  skill: string;
  message?: string;
  createdAt: string;
}

interface SkillEndorsementsProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export function SkillEndorsements({ profile, isOwnProfile }: SkillEndorsementsProps) {
  const [endorseSkill, setEndorseSkill] = useState('');
  const [endorseMessage, setEndorseMessage] = useState('');
  const [isEndorseDialogOpen, setIsEndorseDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: endorsements = [] } = useQuery<SkillEndorsement[]>({
    queryKey: ['/api/skill-endorsements', profile.userId],
    enabled: !!profile.userId,
  });

  const endorseMutation = useMutation({
    mutationFn: async (data: { skill: string; message: string }) => {
      const response = await apiRequest('POST', '/api/skill-endorsements', {
        endorsedUserId: profile.userId,
        skill: data.skill,
        message: data.message,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skill-endorsements', profile.userId] });
      setIsEndorseDialogOpen(false);
      setEndorseSkill('');
      setEndorseMessage('');
      toast({
        title: 'Skill endorsed successfully',
        description: 'Your endorsement has been added to their profile.',
      });
    },
    onError: (error: any) => {
      console.error('Error endorsing skill:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to endorse skill. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const removeEndorsementMutation = useMutation({
    mutationFn: async (endorsementId: number) => {
      const response = await apiRequest('DELETE', `/api/skill-endorsements/${endorsementId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skill-endorsements', profile.userId] });
      toast({
        title: 'Endorsement removed',
        description: 'The skill endorsement has been removed.',
      });
    },
    onError: (error: any) => {
      console.error('Error removing endorsement:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove endorsement. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEndorse = () => {
    if (!endorseSkill.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a skill to endorse.',
        variant: 'destructive',
      });
      return;
    }

    endorseMutation.mutate({
      skill: endorseSkill.trim(),
      message: endorseMessage.trim(),
    });
  };

  const handleRemoveEndorsement = (endorsementId: number) => {
    removeEndorsementMutation.mutate(endorsementId);
  };

  // Group endorsements by skill
  const groupedEndorsements = endorsements.reduce((acc: Record<string, SkillEndorsement[]>, endorsement: SkillEndorsement) => {
    if (!acc[endorsement.skill]) {
      acc[endorsement.skill] = [];
    }
    acc[endorsement.skill].push(endorsement);
    return acc;
  }, {});

  // Get profile skills for quick endorsement
  const profileSkills = profile.skills || [];
  const endorsedSkills = Object.keys(groupedEndorsements);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-500" />
              Skill Endorsements
            </CardTitle>
            <CardDescription>
              {isOwnProfile 
                ? "Skills endorsed by your network"
                : `Skills endorsed by ${profile.displayName}'s network`
              }
            </CardDescription>
          </div>
          {!isOwnProfile && user && (
            <Dialog open={isEndorseDialogOpen} onOpenChange={setIsEndorseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Endorse Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Endorse a Skill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="skill">Skill</Label>
                    <Input
                      id="skill"
                      value={endorseSkill}
                      onChange={(e) => setEndorseSkill(e.target.value)}
                      placeholder="Enter skill to endorse"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message (optional)</Label>
                    <Textarea
                      id="message"
                      value={endorseMessage}
                      onChange={(e) => setEndorseMessage(e.target.value)}
                      placeholder="Add a personal message about their skill"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEndorseDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEndorse} disabled={endorseMutation.isPending}>
                      {endorseMutation.isPending ? 'Endorsing...' : 'Endorse'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedEndorsements).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <StarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skill endorsements yet</p>
            {!isOwnProfile && (
              <p className="text-sm">Be the first to endorse their skills!</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEndorsements).map(([skill, skillEndorsements]) => (
              <div key={skill} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {skillEndorsements.length} endorsement{skillEndorsements.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {skillEndorsements.map((endorsement) => (
                    <div
                      key={endorsement.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {endorsement.endorserId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {endorsement.endorserId}
                          </span>
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        </div>
                        {endorsement.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            "{endorsement.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(endorsement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {user && user.id === endorsement.endorserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEndorsement(endorsement.id)}
                          disabled={removeEndorsementMutation.isPending}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {skillEndorsements.length > 0 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick endorse profile skills */}
        {!isOwnProfile && user && profileSkills.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium mb-3">Quick Endorse</h4>
            <div className="flex flex-wrap gap-2">
              {profileSkills.map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEndorseSkill(skill);
                    setIsEndorseDialogOpen(true);
                  }}
                  disabled={endorsedSkills.includes(skill)}
                >
                  {endorsedSkills.includes(skill) ? (
                    <CheckIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <PlusIcon className="h-4 w-4 mr-1" />
                  )}
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}