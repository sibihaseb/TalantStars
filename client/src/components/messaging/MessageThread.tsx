import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Phone, Video, Paperclip } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Message } from "@shared/schema";

interface MessageThreadProps {
  conversationUserId: string;
  conversationUserName: string;
  onClose?: () => void;
}

export function MessageThread({ 
  conversationUserId, 
  conversationUserName, 
  onClose 
}: MessageThreadProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages", conversationUserId],
    enabled: !!conversationUserId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: string; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessage("");
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // WebSocket connection for real-time messages
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      try {
        // Try to connect to WebSocket
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log("WebSocket connected");
          setIsWebSocketConnected(true);
          socket?.send(JSON.stringify({
            type: "auth",
            userId: user?.id
          }));
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "message") {
            queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationUserId] });
          }
        };

        socket.onclose = () => {
          console.log("WebSocket disconnected");
          setIsWebSocketConnected(false);
          // Don't try to reconnect immediately to avoid spam
        };

        socket.onerror = (error) => {
          console.log("WebSocket error (this is normal in Replit deployments):", error);
          // Silently handle WebSocket errors since they're common in Replit
        };

      } catch (error) {
        console.log("WebSocket connection failed (falling back to polling):", error);
        setIsWebSocketConnected(false);
        // Fall back to polling by refreshing messages periodically
        reconnectTimeout = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationUserId] });
        }, 5000);
      }
    };

    // Only try to connect if user is authenticated
    if (user?.id) {
      connectWebSocket();
    }

    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [user?.id, conversationUserId, queryClient]);

  // Fallback polling mechanism when WebSocket is not connected
  useEffect(() => {
    if (!isWebSocketConnected && conversationUserId) {
      const pollingInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationUserId] });
      }, 10000); // Poll every 10 seconds

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [isWebSocketConnected, conversationUserId, queryClient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      receiverId: conversationUserId,
      content: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {conversationUserName[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {conversationUserName}
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isWebSocketConnected ? 'Real-time' : 'Polling mode'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: Message) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span
                  className={`text-xs mt-1 block ${
                    isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
