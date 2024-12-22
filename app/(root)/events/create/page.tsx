import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import EventForm from "@/components/forms/Event";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "StrathSpace | Create Event",
  description: "Create a new event for the community.",
};

export default async function CreateEventPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/sign-in");

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create New Event
        </h1>

        <EventForm userId={userId} />
      </motion.div>
    </div>
  );
}
