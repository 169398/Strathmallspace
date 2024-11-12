"use server";

import db from "@/db/drizzle";
import { jobs, user } from "@/db/schema";
import { eq, desc, and,  gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateJobParams } from "./shared.types";


export async function createJob(params: CreateJobParams) {
  try {
    const { title, description, price, startDate, deadline, authorId } = params;

    const [newJob] = await db
      .insert(jobs)
      .values({
        title,
        description,
        price,
        start_date: startDate,
        deadline,
        author_id: authorId,
      })
      .returning();

    revalidatePath("/jobs");
    return newJob;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

export async function getJobs() {
  try {
    const allJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        price: jobs.price,
        startDate: jobs.start_date,
        deadline: jobs.deadline,
        done: jobs.done,
        createdAt: jobs.created_at,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(jobs)
      .innerJoin(user, eq(jobs.author_id, user.id))
      .where(and(eq(jobs.done, false), gte(jobs.deadline, new Date())))
      .orderBy(desc(jobs.created_at));

    return allJobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

export async function assignJob(jobId: string, userId: string) {
  try {
    const [updatedJob] = await db
      .update(jobs)
      .set({
        assigned_to: userId,
      })
      .where(eq(jobs.id, jobId))
      .returning();

    revalidatePath("/jobs");
    return updatedJob;
  } catch (error) {
    console.error("Error assigning job:", error);
    throw error;
  }
}

export async function getJobById(jobId: string) {
  try {
    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        price: jobs.price,
        startDate: jobs.start_date,
        deadline: jobs.deadline,
        done: jobs.done,
        createdAt: jobs.created_at,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(jobs)
      .innerJoin(user, eq(jobs.author_id, user.id))
      .where(eq(jobs.id, jobId));

    return job;
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
}
