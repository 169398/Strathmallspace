"use client";
import { Icons } from "./Icons";
import { ButtonHTMLAttributes } from "react";

interface MessageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: keyof typeof Icons;

  currentUserId?: string;
  recipientId: string;
  label?: string;
  className?: string;
  size?: "sm" | "default";
}

const MessageButton = ({
  currentUserId,
  recipientId,
  className,
  icon,
  label,
  ...props
}: MessageButtonProps) => {
  const Icon = Icons[icon];

  if (!currentUserId || currentUserId === recipientId) return null;

  return (
    <button
      className={`inline-flex items-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-500 ${className}`}
      {...props}
    >
      <Icon className="size-3" />
      <span>{label}</span>
    </button>
  );
};

export default MessageButton;
