"use server";

import db from "@/db/drizzle";
import { messages, user } from "@/db/schema";
import { eq, desc, and, or, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

interface SendMessageParams {
  content: string;
  senderId: string;
  receiverId: string;
  replyToId?: string;
}

export async function sendMessage(params: SendMessageParams) {
  try {
    const { content, senderId, receiverId, replyToId } = params;
    
    // First insert the message
    const [newMessage] = await db
      .insert(messages)
      .values({
        content,
        senderId,
        receiverId,
        replyToId,
      })
      .returning();

    // Then fetch the complete message with user details
    const [completeMessage] = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        read: messages.read,
        sender: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        receiver: {
          id: alias(user, "receiver").id,
          name: alias(user, "receiver").name,
          image: alias(user, "receiver").image,
        },
        replyToId: messages.replyToId
      })
      .from(messages)
      .where(eq(messages.id, newMessage.id))
      .innerJoin(user, eq(messages.senderId, user.id))
      .innerJoin(alias(user, "receiver"), eq(messages.receiverId, alias(user, "receiver").id));

    return completeMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function getConversations(userId: string) {
  try {
    const sender = alias(user, "sender");
    const receiver = alias(user, "receiver");
    
    // Get the latest message for each conversation
    const latestMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        read: messages.read,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        sender: {
          id: sender.id,
          name: sender.name,
          image: sender.image,
        },
        receiver: {
          id: receiver.id,
          name: receiver.name,
          image: receiver.image,
        }
      })
      .from(messages)
      .where(or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      ))
      .innerJoin(sender, eq(messages.senderId, sender.id))
      .innerJoin(receiver, eq(messages.receiverId, receiver.id))
      .orderBy(desc(messages.createdAt));

    // Group conversations by unique user pairs
    const uniqueConversations = latestMessages.reduce((acc: any[], message) => {
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      const existingConv = acc.find(conv => 
        (conv.sender.id === otherUser.id || conv.receiver.id === otherUser.id)
      );

      if (!existingConv) {
        acc.push(message);
      }
      return acc;
    }, []);

    return uniqueConversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

// Add a function to get messages between two users
export async function getMessagesBetweenUsers(userId: string, otherUserId: string) {
  try {
    const sender = alias(user, "sender");
    const receiver = alias(user, "receiver");

    const messageList = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        read: messages.read,
        sender: {
          id: sender.id,
          name: sender.name,
          image: sender.image,
        },
        receiver: {
          id: receiver.id,
          name: receiver.name,
          image: receiver.image,
        },
        replyToId: messages.replyToId
      })
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId),
            eq(messages.receiverId, otherUserId)
          ),
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, userId)
          )
        )
      )
      .innerJoin(sender, eq(messages.senderId, sender.id))
      .innerJoin(receiver, eq(messages.receiverId, receiver.id))
      .orderBy(messages.createdAt);

    return messageList;
  } catch (error) {
    console.error('Error getting messages between users:', error);
    throw error;
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(
        eq(messages.receiverId, userId),
        eq(messages.read, false)
      ));
    console.log("count", count);
    return count[0].count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

export async function markAsRead(messageIds: string[]) {
  try {
    await db
      .update(messages)
      .set({ read: true })
      .where(inArray(messages.id, messageIds));
    console.log("markAsRead", markAsRead);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

export async function sendReply(params: SendMessageParams & { replyToId?: string }) {
  try {
    const { content, senderId, receiverId, replyToId } = params;

    const newMessage = await db
      .insert(messages)
      .values({
        content,
        senderId,
        receiverId,
        replyToId,
      })
      .returning({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        replyToId: messages.replyToId,
        read: messages.read,
        createdAt: messages.createdAt
      });

    return newMessage[0];
  } catch (error) {
    console.error("Error sending reply:", error);
    throw error;
  }
}

export async function deleteMessage(messageId: string) {
  try {
    await db
      .delete(messages)
      .where(eq(messages.id, messageId))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}