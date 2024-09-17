"use server";

import { answers, questions, interactions, users } from "@/db/schema"; 
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import { eq, sql} from "drizzle-orm";
import db from "@/db/drizzle";



// Create an answer
export async function createAnswer(params: CreateAnswerParams) {
  try {
    const { content, author, question, path } = params;

    // Insert new answer
    const newAnswer = await db
      .insert(answers)
      .values({
        content,
        authorId: author,
        questionId: question,
     })
      .returning()
      .execute();

    // Update question's answer array
    const questionObject = await db
      .update(questions)
      .set({
        answers: sql`array_append(answers, ${newAnswer[0].id})`, 
      })
      .where(eq(questions.id, question.toString()))
      .returning()
      .execute();

    // Create interaction record
    await db
      .insert(interactions)
      .values({
        userId: author, 
        action: "answer", 
        questionId: question, 
        answerId: newAnswer[0].id, 
        tags: questionObject[0]?.tags?.map(String) || [],
      })
      .execute();

    // Update user's reputation
    await db
      .update(users)
      .set({
        reputation: sql`${users.reputation} + 10`, 
      })
      .where(eq(users.id, author.toString()))
      .execute();

    // Revalidate the path
    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// Get answers for a question
export async function getAnswers(params: GetAnswersParams) {
  try {
    const { questionId, sortBy, page = 1, pageSize = 5 } = params;
    const skipCount = (page - 1) * pageSize;

    // Determine sorting options
    let sortColumn: any = answers.createdAt;
    let sortOrder = "desc";
    
    switch (sortBy) {
      case "highestUpvotes":
        sortColumn = answers.upvotes;
        sortOrder = "desc";
        break;
      case "lowestUpvotes":
        sortColumn = answers.upvotes;
        sortOrder = "asc";
        break;
      case "recent":
        sortColumn = answers.createdAt;
        sortOrder = "desc";
        break;
      case "old":
        sortColumn = answers.createdAt;
        sortOrder = "asc";
        break;
    }

    // Fetch answers with pagination and author details (join with users)
    const answerList = await db
      .select({
        id: answers.id,
        content: answers.content,
        createdAt: answers.createdAt,
        upvotes: answers.upvotes,
        downvotes: answers.downvotes,
        author: {
          userId: users.id,
          name: users.name,
          picture: users.image,
        },
      })
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .limit(pageSize)
      .offset(skipCount)
      .orderBy(sortColumn, sql`${sortOrder}`)
      .leftJoin(users, eq(answers.authorId, users.id))
      .execute();

    // Fetch the total count of answers
    const totalAnswers = await db
      .select({ count: sql`count(*)` })
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .execute() as { count: number }[];

    const isNextAnswer = totalAnswers[0].count > skipCount + answerList.length;

    return { answers: answerList, isNextAnswer };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Upvote an answer
export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    const { answerId, userId, hasDownvoted, hasUpvoted, path } = params;

    // Update votes based on the current status
    if (hasUpvoted) {
      await db
        .update(answers)
        .set({ upvotes: sql`array_remove(upvotes, ${userId})` })
        .where(eq(answers.id, answerId))
        .execute();
    } else if (hasDownvoted) {
      await db
        .update(answers)
        .set({
          downvotes: sql`array_remove(downvotes, ${userId})`,
          upvotes: sql`array_append(upvotes, ${userId})`,
        })
        .where(eq(answers.id, answerId))
        .execute();
    } else {
      await db
        .update(answers)
        .set({ upvotes: sql`array_append(upvotes, ${userId})` })
        .where(eq(answers.id,answerId))
        .execute();
    }

    // Update user's reputation
    await db
      .update(users)
      .set({ reputation: sql`${users.reputation} + ${hasUpvoted ? -2 : 2}` })
      .where(eq(users.id, userId))
      .execute();

    // Update answer author's reputation
    const answer = await db
      .select()
      .from(answers)
      .where(eq(answers.id, answerId))
      .execute();
    await db
      .update(users)
      .set({ reputation: sql`${users.reputation} + ${hasUpvoted ? -10 : 10}` })
      .where(eq(users.id, answer[0].authorId))
      .execute();

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Downvote an answer
export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    const { answerId, userId, hasDownvoted, hasUpvoted, path } = params;

    // Update votes based on the current status
    if (hasDownvoted) {
      await db
        .update(answers)
        .set({ downvotes: sql`array_remove(downvotes, ${userId})` })
        .where(eq(answers.id, answerId))
        .execute();
    } else if (hasUpvoted) {
      await db
        .update(answers)
        .set({
          upvotes: sql`array_remove(upvotes, ${userId})`,
          downvotes: sql`array_append(downvotes, ${userId})`,
        })
        .where(eq(answers.id, answerId))
        .execute();
    } else {
      await db
        .update(answers)
        .set({ downvotes: sql`array_append(downvotes, ${userId})` })
        .where(eq(answers.id, answerId))
        .execute();
    }

    // Update user's reputation
    await db
      .update(users)
      .set({ reputation: sql`${users.reputation} + ${hasDownvoted ? -2 : 2}` })
      .where(eq(users.id, userId))
      .execute();

    // Update answer author's reputation
    const answer = await db
      .select()
      .from(answers)
      .where(eq(answers.id, answerId))
      .execute();
    await db
      .update(users)
      .set({
        reputation: sql`${users.reputation} + ${hasDownvoted ? -10 : 10}`,
      })
      .where(eq(users.id, answer[0].authorId))
      .execute();

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Delete an answer
export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    const { answerId, path } = params;

    // Find the answer
    const answer = await db
      .select()
      .from(answers)
      .where(eq(answers.id,answerId))
      .execute();

    if (!answer.length) throw new Error("Answer not found");

    // Delete answer and related data
    await db.delete(answers).where(eq(answers.id, answerId)).execute();
    await db
      .update(questions)
      .set({ answers: sql`array_remove(answers, ${answerId})` })
      .where(eq(questions.id, answer[0].questionId))
      .execute();
    await db
      .delete(interactions)
      .where(eq(interactions.answerId, answerId))
      .execute();

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
