"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";
import Lottie from "lottie-react";
import emptyAnimation from "@/public/animations/empty-calendar.json";

interface NoEventsProps {
  isLoggedIn: boolean;
  message?: string;
}

const NoEvents = ({ isLoggedIn, message }: NoEventsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <div className="w-64 h-64 mb-6">
        <Lottie animationData={emptyAnimation} loop={true} />
      </div>
      <h2 className="text-2xl font-bold mb-2">No Events Yet</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message || "Be the first to add an exciting event to our calendar!"}
      </p>
      {isLoggedIn && (
        <Link href="/events/create">
          <Button className="event-gradient group">
            <CalendarIcon className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Post Event
          </Button>
        </Link>
      )}
    </motion.div>
  );
};

export default NoEvents;
