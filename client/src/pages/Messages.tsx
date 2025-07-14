import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { MessageThread } from "@/components/messaging/MessageThread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Users,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function Messages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get user ID from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user");
    if (userId) {
      setSelectedConversation(userId);
    }
  }, [location]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: conversations = [], isLoading: isLoadingConversations, error } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
    retry: false,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const formatMessageTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conversation: any) =>
    conversation.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversationData = conversations.find((c: any) => c.user.id === selectedConversation);

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Messages
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Communicate with talents, managers, and producers
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <div className="lg:col-span-1">
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Conversations</span>
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    {isLoadingConversations ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-3 p-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Failed to load conversations
                        </p>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchQuery ? "No conversations found" : "No conversations yet"}
                        </p>
                        {!searchQuery && (
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Start New Chat
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredConversations.map((conversation: any) => (
                          <div
                            key={conversation.user.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedConversation === conversation.user.id
                                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                            onClick={() => setSelectedConversation(conversation.user.id)}
                          >
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {conversation.user.firstName?.[0] || conversation.user.email?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                  {conversation.user.firstName && conversation.user.lastName
                                    ? `${conversation.user.firstName} ${conversation.user.lastName}`
                                    : conversation.user.email}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatMessageTime(conversation.lastMessage.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {conversation.lastMessage.senderId === user?.id ? "You: " : ""}
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                            {conversation.lastMessage.senderId !== user?.id && 
                             conversation.lastMessage.status !== "read" && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Message Thread */}
              <div className="lg:col-span-3">
                {selectedConversation && selectedConversationData ? (
                  <MessageThread
                    conversationUserId={selectedConversation}
                    conversationUserName={
                      selectedConversationData.user.firstName && selectedConversationData.user.lastName
                        ? `${selectedConversationData.user.firstName} ${selectedConversationData.user.lastName}`
                        : selectedConversationData.user.email
                    }
                    onClose={() => setSelectedConversation(null)}
                  />
                ) : (
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 h-full">
                    <CardContent className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Select a conversation
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Choose a conversation from the list to start messaging
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
