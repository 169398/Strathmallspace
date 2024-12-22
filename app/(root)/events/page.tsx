import { auth } from "@/lib/auth";
import { getEvents } from "@/lib/actions/event.actions";
import EventCard from "@/components/cards/EventCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarIcon } from "@radix-ui/react-icons";
import NoEvents from "@/components/shared/NoEvents";

export default async function EventsPage() {
  const session = await auth();
  const events = await getEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            School Events
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Discover upcoming events at Strathmore
          </p>
        </div>

        {session?.user && (
          <Link href="/events/create">
            <Button className="event-gradient group">
              <CalendarIcon className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Post Event
            </Button>
          </Link>
        )}
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={{
                ...event,
                posterUrl: event.posterUrl ?? "",
              }}
            />
          ))}
        </div>
      ) : (
        <NoEvents isLoggedIn={!!session?.user} />
      )}
    </div>
  );
}
