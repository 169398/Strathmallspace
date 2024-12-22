"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import successAnimation from "@/public/animations/success.json";

export default function EventSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="w-64 h-64 mx-auto mb-8">
          <Lottie animationData={successAnimation} loop={false} />
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Thank You! 🎉
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your event has been submitted successfully and is awaiting approval.
          We'll notify you once it's reviewed.
        </p>

        <div className="space-x-4">
          <Link href="/events">
            <Button variant="outline">View All Events</Button>
          </Link>
          <Link href="/events/create">
            <Button className="event-gradient">Create Another Event</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
