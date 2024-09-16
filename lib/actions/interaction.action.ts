"use server";

import { questions, interactions } from "@/db/schema"; // Import your table schemas
import { eq, and } from "drizzle-orm"; // Drizzle query helpers
import { ViewQuestionParams } from "./shared.types";
import db from "@/db/drizzle";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    const { questionId, userId } = params;

    // 1. Fetch the question
    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, Number(questionId)))
      .limit(1);

    if (!question.length) {
      throw new Error("Question not found");
    }

    // 2. Increment the views count for the question
    await db
      .update(questions)
      .set({ views: (question[0]?.views ?? 0) + 1 })
      .where(eq(questions.id, Number(questionId)));

    // 3. If a user is viewing the question, check for an existing interaction
    if (userId) {
      const existingInteraction = await db
        .select()
        .from(interactions)
        .where(
          and(
            eq(interactions.userId, Number(userId)),
            eq(interactions.action, "view"),
            eq(interactions.questionId, Number(questionId))
          )
        )
        .limit(1);

      // 4. If the interaction exists, skip creating a new one
      if (existingInteraction.length) {
        return console.log("interaction already exists");
      }

      // 5. Create a new interaction record for the view action
      await db.insert(interactions).values({
        userId: Number(userId),
        action: "view",
        questionId: Number(questionId),
        tags: question[0].tags,
        
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
