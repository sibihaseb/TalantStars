import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Clock, Check, CheckCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface JobCommunicationProps {
  jobId: number;
  jobTitle: string;
  posterId: number;
  posterName: string;
  allowCommunication: boolean;
}

export function JobCommunication({ jobId, jobTitle, posterId, posterName, allowCommunication }: JobCommunicationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job communications
  const { data: communications = [], isLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}/communications`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/jobs/${jobId}/communications`);
      return response.json();
    },
    enabled: isOpen && allowCommunication,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      const response = await apiRequest('POST', `/api/jobs/${jobId}/communications`, {
        message: messageData.message,
        receiverId: posterId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/communications`] });
      setMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the job poster.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate({ message: message.trim() });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!allowCommunication) {
    return (
      <Button variant="outline" size="sm" disabled>
        <MessageSquare className="w-4 h-4 mr-2" />
        Communication Disabled
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Ask Question
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Discussion - {jobTitle}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Communicate with {posterName} about this job posting
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Messages Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : communications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communications.map((comm: any) => (
                      <div
                        key={comm.id}
                        className={`flex gap-3 ${
                          comm.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {comm.senderId !== user?.id && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comm.senderImage} />
                            <AvatarFallback>
                              {comm.senderName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`flex flex-col ${
                          comm.senderId === user?.id ? 'items-end' : 'items-start'
                        }`}>
                          <div className={`max-w-xs px-3 py-2 rounded-lg ${
                            comm.senderId === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{comm.message}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comm.createdAt)}
                            </span>
                            {comm.senderId === user?.id && (
                              <div className="flex items-center">
                                {comm.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <Check className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {comm.senderId === user?.id && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user?.profileImageUrl} />
                            <AvatarFallback>
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Send Message Area */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}