"use server";

import { questions, interactions } from "@/db/schema"; 
import { eq, and } from "drizzle-orm";
import { ViewQuestionParams } from "./shared.types";
import db from "@/db/drizzle";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    const { questionId, userId } = params;

    // 1. Fetch the question
    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question.length) {
      return { success: false, message: "Question not found" };
    }

    // 2. Increment the views count for the question
    await db
      .update(questions)
      .set({ views: (question[0]?.views ?? 0) + 1 })
      .where(eq(questions.id, questionId));

    // 3. If a user is viewing the question, check for an existing interaction
    if (userId) {
      const existingInteraction = await db
        .select()
        .from(interactions)
        .where(
          and(
            eq(interactions.userId, userId),
            eq(interactions.action, "view"),
            eq(interactions.questionId,questionId)
          )
        )
        .limit(1);

      // 4. If the interaction exists, skip creating a new one
      if (existingInteraction.length) {
        return console.log("interaction already exists");
      }

      // 5. Create a new interaction record for the view action
      await db.insert(interactions).values({
        userId,
        action: "view",
        questionId: questionId.toString(),
        
      });
    }
    
    return { success: true, message: "View recorded successfully" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
