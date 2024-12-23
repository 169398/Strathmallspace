import { auth } from "@/lib/auth";
import { getEventsForAdmin } from "@/lib/actions/event.actions";
import { redirect } from "next/navigation";
import AdminEventCard from "@/components/cards/AdminEventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAdmin } from "@/lib/utils";

export default async function AdminEventsPage() {
  const session = await auth();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect("/");
  }

  const events = await getEventsForAdmin();

  const pendingEvents = events.filter((event) => event.status === "pending");
  const approvedEvents = events.filter((event) => event.status === "approved");
  const rejectedEvents = events.filter((event) => event.status === "rejected");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Events Dashboard
      </h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:event-gradient"
          >
            Pending ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:event-gradient"
          >
            Approved ({approvedEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:event-gradient"
          >
            Rejected ({rejectedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {pendingEvents.map((event) => (
            <AdminEventCard key={event.id} event={event } />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          {approvedEvents.map((event) => (
            <AdminEventCard key={event.id} event={event} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          {rejectedEvents.map((event) => (
            <AdminEventCard key={event.id} event={event} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
