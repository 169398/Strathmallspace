"use client";

import { useState, useEffect, useRef } from "react";
import {
  sendMessage,
  markAsRead,
  getMessagesBetweenUsers,
  deleteMessage,
} from "@/lib/actions/message.action";
import MessageBubble from "./MessageBubble";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { Loader2, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MessageListProps {
  conversations: {
    [date: string]: any[];
  };
  currentUserId: string;
  initialSelectedUser?: string;
  initialMessages: any[];
  unreadCount: number;
}

export default function MessageList({
  conversations,
  currentUserId,
  initialSelectedUser,
  initialMessages,
  unreadCount,
}: MessageListProps) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(
    initialSelectedUser || null
  );
  const [messages, setMessages] = useState(initialMessages);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      const unreadMessages = messages
        .filter((m) => !m.read && m.sender.id === selectedUser)
        .map((m) => m.id);

      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
      }
    }
  }, [selectedUser, messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const messageList = await getMessagesBetweenUsers(
            currentUserId,
            selectedUser
          );
          setMessages(messageList);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const sent = await sendMessage({
        content: newMessage,
        senderId: currentUserId,
        receiverId: selectedUser,
        replyToId: replyTo?.id,
      });

      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
      setReplyTo(null);
      toast({
        title: "Message sent successfully",
        description: "Your message has been delivered",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error sending message",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationClick = async (userId: string) => {
    setSelectedUser(userId);
    // Clear existing messages while loading new ones
    setMessages([]);
    // Reset reply state
    setReplyTo(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
    setReplyTo(null);
  };

  return (
    <div className="flex h-full">
      {/* Conversations sidebar */}
      <div
        className={`flex w-full flex-col border-r border-gray-200 md:w-1/3 dark:border-gray-800 
        ${isMobileView && selectedUser ? "hidden" : "block"}`}
      >
        <div className="border-b border-gray-200 p-4 text-gray-900 dark:border-gray-800 dark:text-white">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {Object.entries(conversations).map(([date, convs]) => (
            <div key={date} className="mb-4">
              <div className="bg-secondary/[0.1] sticky top-0 z-10 px-4 py-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {date}
                </span>
              </div>
              {convs.map((conv) => {
                const otherUser =
                  conv.sender.id === currentUserId
                    ? conv.receiver
                    : conv.sender;
                const isUnread = !conv.read && conv.sender.id !== currentUserId;

                return (
                  <div
                    key={otherUser.id}
                    onClick={() => handleConversationClick(otherUser.id)}
                    className={`relative cursor-pointer p-3 transition-colors
                      hover:bg-gray-100 dark:hover:bg-gray-800 
                      ${
                        selectedUser === otherUser.id
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      }
                      ${isUnread ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Image
                          src={otherUser.image}
                          alt={otherUser.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        {isUnread && (
                          <span className="bg-primary-500 absolute -right-0.5 -top-0.5 size-2.5 rounded-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm  font-semibold text-gray-900 dark:text-white">
                          {otherUser.name}
                        </h3>
                        <p className="truncate text-xs text-gray-900 dark:text-white">
                          {conv.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Message area */}
      <div
        className={`flex flex-1 flex-col 
        ${isMobileView && !selectedUser ? "hidden" : "block"}`}
      >
        {selectedUser ? (
          <>
            {isMobileView && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 p-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to conversations
              </button>
            )}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message: any, index: number) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={message.sender.id === currentUserId}
                  onReply={() => setReplyTo(message)}
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                  <div className="flex-1">
                    <span className="text-sm font-medium">Replying to:</span>
                    <p className="text-muted-foreground truncate text-sm">
                      {replyTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="hover:text-primary-500 text-sm text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 dark:bg-gray-800"
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  className={`primary-gradient text-white transition-transform ${
                    isSending ? "scale-95" : "hover:scale-105"
                  }`}
                  disabled={isSending}
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-muted-foreground text-center">
              Select a conversation to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
