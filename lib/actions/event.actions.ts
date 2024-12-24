"use server";

import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";

const utapi = new UTApi();

export async function getEvents() {
  try {
    const allEvents = await db.query.events.findMany({
      where: eq(events.status, "approved"),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      with: {
        author: true,
      },
    });

    console.log("Fetched events:", allEvents);
    return allEvents;
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
}

export async function getEventsForAdmin() {
  try {
    const allEvents = await db.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      with: {
        author: true,
      },
    });

    return allEvents;
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
}

export async function createEvent(formData: FormData) {
  try {
    // Validate user session
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in to create an event");
    }

    // Get and validate required fields
    const title = formData.get("title");
    const description = formData.get("description");
    const content = formData.get("content");
    const location = formData.get("location");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const authorId = formData.get("authorId");
    const file = formData.get("poster") as File;

    // Detailed validation with specific error messages
    if (!title) throw new Error("Event title is required");
    if (!description) throw new Error("Event description is required");
    if (!content) throw new Error("Event content is required");
    if (!location) throw new Error("Event location is required");
    if (!startDate) throw new Error("Start date is required");
    if (!endDate) throw new Error("End date is required");
    if (!authorId) throw new Error("User ID is required");
    if (!file) throw new Error("Event poster is required");

    // Upload poster
    const response = await utapi.uploadFiles(file);
    if (!response.data?.url) {
      throw new Error("Failed to upload poster");
    }

    // Insert event
    await db.insert(events).values({
      title: title as string,
      description: description as string,
      content: content as string,
      posterUrl: response.data.url,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      location: location as string,
      authorId: authorId as string,
      status: "pending",
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");
  } catch (error) {
    console.error("Error creating event:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create event. Please try again.");
  }
}

export async function updateEventStatus(
  eventId: string,
  status: "approved" | "rejected"
) {
  try {
    await db.update(events).set({ status }).where(eq(events.id, eventId));

    revalidatePath("/events");
    revalidatePath("/admin/events");
  } catch (error) {
    console.error("Error updating event status:", error);
    throw error;
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const file = formData.get("poster") as File;
    let posterUrl;

    if (file.size > 0) {
      const response = await utapi.uploadFiles(file);
      posterUrl = response.data?.url;
    }

    await db
      .update(events)
      .set({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        content: formData.get("content") as string,
        ...(posterUrl && { posterUrl }),
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        location: formData.get("location") as string,
      })
      .where(eq(events.id, eventId));

    revalidatePath("/events");
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await db.delete(events).where(eq(events.id, eventId));
    revalidatePath("/events");
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}
