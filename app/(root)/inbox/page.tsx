import { auth } from "@/lib/auth";
import {
  getConversations,
  getMessagesBetweenUsers,
  getUnreadCount,
} from "@/lib/actions/message.action";
import { redirect } from "next/navigation";
import MessageList from "@/components/shared/MessageList";
import NoResult from "@/components/shared/NoResult";
import { Metadata } from "next";
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: "Inbox | Strathmore Space",
  description: "View and manage your messages",
};

export default async function InboxPage(
  props: {
    searchParams: Promise<{ 
      user?: string 
    }>
  }
) {
  const searchParams = await props.searchParams;
  // Ensure headers are accessed before auth
  const headersList = await headers();

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const selectedUser = searchParams?.user;

  try {
    // Fetch conversations and unread count
    const [conversations, unreadCount] = await Promise.all([
      getConversations(session.user.id!),
      getUnreadCount(session.user.id!),
    ]);

    // If a specific user is selected, get their messages
    let selectedUserMessages: any[] = [];
    if (selectedUser) {
      selectedUserMessages = await getMessagesBetweenUsers(
        session.user.id!,
        selectedUser
      );
    }

    // Group conversations by date and unique users
    const groupedConversations = conversations.reduce((acc: any, conv: any) => {
      const date = new Date(conv.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }

      const otherUser =
        conv.sender.id === session.user!.id ? conv.receiver : conv.sender;
      const existingConv = acc[date].find((c: any) => {
        const cOtherUser =
          c.sender.id === session.user!.id ? c.receiver : c.sender;
        return cOtherUser.id === otherUser.id;
      });

      if (!existingConv) {
        acc[date].push({
          ...conv,
          createdAt: new Date(conv.createdAt),
        });
      }
      return acc;
    }, {});

    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-80px)] flex-col gap-4 py-4 md:gap-8 md:py-8">
          {/* Header Section */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
              <h1 className="h2-bold sm:h1-bold text-invert w-full">Inbox</h1>
              {unreadCount > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Messages Section */}
          <div className="mt-4 h-full rounded-lg bg-white shadow-sm dark:bg-gray-900 sm:mt-0 sm:min-h-[600px]">
            {Object.keys(groupedConversations).length > 0 ||
            selectedUserMessages.length > 0 ? (
              <MessageList
                conversations={groupedConversations}
                currentUserId={session.user.id!}
                initialSelectedUser={searchParams.user || ""}
                initialMessages={selectedUserMessages}
                unreadCount={unreadCount}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4">
                <NoResult
                  title="No messages yet"
                  description="When you start conversations with other users, they'll appear here."
                  hasButton={false}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error in InboxPage:", error);
    return (
      <div className="flex h-full items-center justify-center p-4">
        <NoResult
          title="Something went wrong"
          description="Please try again later."
          hasButton={false}
        />
      </div>
    );
  }
}
