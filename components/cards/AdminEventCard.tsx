"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { updateEventStatus } from "@/lib/actions/event.actions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";

interface AdminEventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    posterUrl: string;
    startDate: Date;
    endDate: Date;
    location: string;
    status: string;
    author: {
      name: string;
      email: string;
    };
  };
}

const AdminEventCard = ({ event }: AdminEventCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (newStatus: "approved" | "rejected") => {
    setLoading(true);
    try {
      await updateEventStatus(event.id, newStatus);
      toast({
        title: "Success",
        description: `Event ${newStatus} successfully`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
    >
      <div className="flex">
        <div className="relative w-48 h-48">
          <Image
            src={event.posterUrl || "/assets/images/event-placeholder.jpg"}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {event.description}
              </p>
            </div>

            {event.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Posted by: {event.author.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact: {event.author.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Status: <span className="capitalize">{event.status}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminEventCard; 