"use server";

import { questions, interactions } from "@/db/schema"; // Import the schema for your tables
import { eq, and, sql } from "drizzle-orm"; // Drizzle query operators
import { ViewQuestionParams } from "./shared.types";
import db from "@/db/drizzle";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    const { questionId, userId } = params as unknown as { questionId: number; userId?: number };

    // Increment the view count for the question
    await db
      .update(questions)
      .set({ views: sql`views + 1` })
      .where(eq(questions.id, questionId));

    // If a userId is provided, log the view interaction
    if (userId) {
      // Check if the interaction already exists
      const existingInteraction = await db
        .select()
        .from(interactions)
        .where(
          and(
            eq(interactions.user, Number(userId)),
            eq(interactions.question, questionId),
            eq(interactions.action, "view")
          )
        )
        .limit(1);

      if (existingInteraction.length > 0) {
        console.log("Interaction already exists");
        return;
      }

      

      // Create a new interaction if none exists
      await db.insert(interactions).values({
        user: userId,
        action: "view",
        question: questionId,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
