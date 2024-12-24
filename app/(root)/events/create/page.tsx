import EventForm from "@/components/forms/Event";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateEventPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Create New Event</h1>
      <EventForm userId={userId} />
    </div>
  );
}
