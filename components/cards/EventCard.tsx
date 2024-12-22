"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    posterUrl: string;
    startDate: Date;
    endDate: Date;
    location: string;
    status: string;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-48">
        <Image
          src={event.posterUrl || "/assets/images/event-placeholder.jpg"}
          alt={event.title}
          fill
          className="object-cover"
        />
        {event.status === "pending" && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Pending Approval
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {event.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {format(new Date(event.startDate), "MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {format(new Date(event.startDate), "h:mm a")}
            </span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>

        <Link href={`/events/${event.id}`}>
          <button className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">
            View Details
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard; 