"use server";

import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { UTApi } from "uploadthing/server";

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
    const file = formData.get("poster") as File;
    const response = await utapi.uploadFiles(file);
    const posterUrl = response.data?.url;

    await db.insert(events).values({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      content: formData.get("content") as string,
      posterUrl,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      location: formData.get("location") as string,
      authorId: formData.get("userId") as string,
      status: "pending",
    });

    revalidatePath("/events");
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
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
