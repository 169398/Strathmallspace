"use server";

import { users, questions, answers, tags } from "@/db/schema"; // Import the schema from schema.ts
import { eq, and, or, asc, desc, ilike, inArray, sql } from "drizzle-orm"; // Drizzle query operators
import { revalidatePath } from "next/cache";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserInfoParams,
  UpdateUserParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
} from "./shared.types";
import db from "@/db/drizzle";
import { assignBadges } from "../utils";

export async function getUserById(params: GetUserByIdParams) {
  try {
    const { userId } = params;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    return user[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    const newUser = await db.insert(users).values(userData).returning();
    return newUser[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    const { clerkId, updateData, path } = params;

    await db.update(users).set(updateData).where(eq(users.clerkId, clerkId));

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    const { clerkId } = params;

    // Find the user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    if (user.length === 0) {
      throw new Error("User not found");
    }

    const userId = user[0].id;

    // Delete user's questions, answers, and user itself
    await db.delete(questions).where(eq(questions.author, userId));
    await db.delete(answers).where(eq(answers.author, userId));
    await db.delete(users).where(eq(users.id, userId));

    return user[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    const { searchQuery, filter, page = 1, pageSize = 100 } = params;
    const offset = (page - 1) * pageSize;

    let orderBy = asc(users.joinedAt);
    if (filter === "new_users") orderBy = desc(users.joinedAt);
    if (filter === "top_contributors") orderBy = desc(users.reputation);

    const query = db
      .select()
      .from(users)
      .orderBy(orderBy)
      .offset(offset)
      .limit(pageSize);

    if (searchQuery) {
      query.where(
        or(
          ilike(users.name, `%${searchQuery}%`),
          ilike(users.username, `%${searchQuery}%`)
        )
      );
    }

    const usersList = await query;
    return { users: usersList };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    const { userId, questionId, path } = params;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);
    if (user.length === 0) throw new Error("User not found");

    const savedQuestions: string[] = Array.isArray(user[0].savedQuestions) ? user[0].savedQuestions : [];

    const isSaved = savedQuestions.includes(questionId);

    if (isSaved) {
      await db
        .update(users)
        .set({
          savedQuestions: JSON.stringify(savedQuestions.filter((id) => id !== questionId)),
        })
        .where(eq(users.id, Number(userId)));
    } else {
      await db
        .update(users)
        .set({ savedQuestions: JSON.stringify([...savedQuestions, questionId]) })
        .where(eq(users.id,Number( userId)));
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    const { clerkId, searchQuery, filter, page = 1, pageSize = 15 } = params;
    const offset = (page - 1) * pageSize;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    if (user.length === 0) throw new Error("User not found");

    const savedQuestionIds: number[] = typeof user[0].savedQuestions === 'string' 
      ? JSON.parse(user[0].savedQuestions) 
      : user[0].savedQuestions || [];

    const sortOptions =
      filter === "most_recent"
        ? desc(questions.createdAt)
        : filter === "oldest"
          ? asc(questions.createdAt)
          : filter === "most_voted"
            ? desc(questions.views)
            : desc(questions.views); // Default sorting

    const questionsQuery = db
      .select()
      .from(questions)
      .where(
        and(
          inArray(questions.id, savedQuestionIds as number[]),
          searchQuery ? ilike(questions.title, `%${searchQuery}%`) : undefined
        )
      )
      .orderBy(sortOptions)
      .offset(offset)
      .limit(pageSize + 1);

    const savedQuestions = await questionsQuery;
    const isNext = savedQuestions.length > pageSize;

    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserInfoParams) {
  try {
    const { userId } = params;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
    if (user.length === 0) throw new Error("User not found");

    const totalQuestionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions)
      .where(eq(questions.author, user[0].id));
    const totalQuestions = totalQuestionsResult[0].count;
    const totalAnswers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(answers)
      .where(eq(answers.author, user[0].id));

    const [questionUpvotes] = await db
      .select({
        totalUpvotes: sql<number>`SUM(array_length(upvotes, 1))`,
      })
      .from(questions)
      .where(eq(questions.author, user[0].id));

    const [answerUpvotes] = await db
      .select({
        totalUpvotes: sql<number>`SUM(array_length(upvotes, 1))`,
      })
      .from(answers)
      .where(eq(answers.author, user[0].id));

    const badgeCounts = assignBadges({
      criteria: [
        { type: "QUESTION_COUNT", count: totalQuestions },
        { type: "ANSWER_COUNT", count: totalAnswers[0].count },
        { type: "QUESTION_UPVOTES", count: questionUpvotes.totalUpvotes || 0 },
        { type: "ANSWER_UPVOTES", count: answerUpvotes.totalUpvotes || 0 },
      ],
    });

    return {
      user: user[0],
      totalAnswers,
      totalQuestions,
      badgeCounts,
      reputation: user[0].reputation,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    const { userId, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    const totalQuestionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions)
      .where(eq(questions.author, Number(userId)));
    const totalQuestions = totalQuestionsResult[0].count;

    const userQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.author, Number(userId)))
      .orderBy(desc(questions.createdAt))
      .offset(offset)
      .limit(pageSize)
      .leftJoin(tags, eq(questions.views, tags.id));

    const isNextQuestions = totalQuestions > offset + userQuestions.length;

    return {
      totalQuestions,
      questions: userQuestions,
      isNextQuestions,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    const { userId, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    const totalAnswersResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(answers)
      .where(eq(answers.author, Number( userId)));
    const totalAnswers = totalAnswersResult[0].count;

    const userAnswers = await db
      .select()
      .from(answers)
      .where(eq(answers.author, Number(userId)))
      .orderBy(desc(answers.createdAt))
      .offset(offset)
      .limit(pageSize)
      .leftJoin(questions, eq(answers.question, questions.id));

    const isNextAnswer = totalAnswers > offset + userAnswers.length;

    return {
      totalAnswers,
      answers: userAnswers,
      isNextAnswer,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
