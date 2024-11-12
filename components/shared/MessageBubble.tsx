"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import MessageButton from "./MessageButton";
import { useState, useEffect } from "react";
import { Loader2, Trash } from "lucide-react";
import { Button } from "../ui/button";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string;
      image: string;
    };
    receiver: {
      id: string;
      name: string;
      image: string;
    };
    replyTo?: {
      id: string;
      content: string;
    };
  };
  isCurrentUser: boolean;
  onReply: () => void;
  onDelete: (messageId: string) => void;
}

const MessageBubble = ({
  message,
  isCurrentUser,
  onReply,
  onDelete,
}: MessageBubbleProps) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [deleteTimeout, setDeleteTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimeout) {
        clearTimeout(deleteTimeout);
      }
    };
  }, [deleteTimeout]);

  if (!message?.sender || !message?.receiver) {
    return null;
  }

  const profileUser = isCurrentUser ? message.sender : message.receiver;

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const startDeletion = () => {
    setShowConfirmModal(false);
    setShowCountdownModal(true);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdownModal(false);
          onDelete(message.id);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    setDeleteTimeout(countdownInterval);
  };

  const cancelDeletion = () => {
    if (deleteTimeout) {
      clearTimeout(deleteTimeout);
    }
    setCountdown(5);
    setShowCountdownModal(false);
  };

  return (
    <>
      <div
        className={`mb-3 flex gap-2  ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Link
          href={`/profile/${profileUser.id}`}
          className="transition-opacity hover:opacity-75"
        >
          <Image
            src={profileUser.image}
            alt={`${profileUser.name}'s profile`}
            width={28}
            height={28}
            className="size-8 rounded-full"
          />
        </Link>
        <div
          className={`flex max-w-[70%] flex-col  ${
            isCurrentUser ? "items-end" : "items-start"
          }`}
        >
          {message.replyTo && (
            <div
              className={`mb-2 flex items-center gap-1 text-xs text-gray-500 
              ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="h-4 w-0.5 bg-gray-300 dark:bg-gray-700" />
              <span>Replying to</span>
            </div>
          )}
          {message.replyTo && (
            <div
              className={`mb-2 rounded-lg p-2 ${
                isCurrentUser
                  ? "bg-gray-100 dark:bg-gray-800/50"
                  : "bg-gray-100/50 dark:bg-gray-800/30"
              }`}
            >
              <p className="text-xs text-gray-500">{message.replyTo.content}</p>
            </div>
          )}
          <div
            className={`group relative flex items-center gap-2 ${
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`rounded-lg p-2.5 ${
                isCurrentUser
                  ? "primary-gradient text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">{message.content}</p>
            </div>
          </div>
          <div className="mt-1 flex gap-2 text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>
            <MessageButton
              icon="commentReply"
              label="Reply"
              currentUserId={message.sender.id}
              recipientId={message.receiver.id}
              onClick={onReply}
            />
            {isCurrentUser && (
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-1 text-sm text-red-400 transition-colors hover:text-red-500"
                title="Delete message"
              >
                <Trash className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-2 text-lg text-gray-900 dark:text-white font-semibold">
              Delete Message
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={startDeletion} className="bg-red-500 text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCountdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="relative">
                <Loader2 className="size-8 animate-spin text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{countdown}</span>
                </div>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                Deleting message in {countdown} seconds...
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelDeletion}
                className="text-blue-500 hover:text-blue-600"
              >
                Cancel Deletion
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;
