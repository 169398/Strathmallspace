/* eslint-disable no-unused-vars */
import db from "@/db/drizzle";
import { questions, savedQuestions, users, answers } from "@/db/schema";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  UpdateUserParams,
  ToggleSaveQuestionParams,
  GetSavedQuestionsParams,
  GetUserInfoParams,
  GetUserStatsParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import { eq, or, desc, asc, and, sql } from "drizzle-orm";
import { assignBadges } from "../utils";

export async function getUserById(userId: string) {
  try {
    // Querying by clerkId instead of id
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, userId),
    });

    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    const newUser = await db.insert(users).values(userData).returning();
    return newUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function updateUser(params: UpdateUserParams) {
  const { clerkId, updateData, path } = params;

  try {
    await db.update(users).set(updateData).where(eq(users.clerkId, clerkId));
    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  const { clerkId } = params;

  try {
    // Find the user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkId),
    });

    if (!user) throw new Error("User not found");

    // Delete the user
    await db.delete(users).where(eq(users.clerkId, clerkId));

    // Optionally, delete related questions, answers, etc.
    await db.delete(questions).where(eq(questions.authorId, user.id));

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  const { searchQuery, filter, page = 1, pageSize = 100 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const query = db.select().from(users);

    if (searchQuery) {
      query.where(
        or(
          eq(users.name, `%${searchQuery}%`),
          eq(users.username, `%${searchQuery}%`)
        )
      );
    }

    const sortOptions = {};
    switch (filter) {
      case "new_users":
        query.orderBy(desc(users.joinedAt));
        break;
      case "old_users":
        query.orderBy(asc(users.joinedAt));
        break;
      case "top_contributors":
        query.orderBy(desc(users.reputation));
        break;
    }

    const usersList = await query.offset(offset).limit(pageSize);
    return { users: usersList };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  const { userId, questionId, path } = params;

  try {
    const existing = await db.query.savedQuestions.findFirst({
      where: (savedQuestions, { eq, and }) =>
        and(
          eq(savedQuestions.userId, Number(userId)),
          eq(savedQuestions.questionId, Number(questionId))
        ),
    });

    if (existing) {
      await db
        .delete(savedQuestions)
        .where(
          and(
            eq(savedQuestions.userId, Number(userId)),
            eq(savedQuestions.questionId, Number(questionId))
          )
        );
    } else {
      await db
        .insert(savedQuestions)
        .values([{ userId: Number(userId), questionId: Number(questionId) }]);
    }

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  const { clerkId, searchQuery, filter, page = 1, pageSize = 15 } = params;
  const offset = (page - 1) * pageSize;

  try {
    // Fetch the user based on clerkId
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkId),
    });

    if (!user) throw new Error("User not found");

    const filters: any = { authorId: user.id };

    if (searchQuery) {
      filters.title = { $ilike: `%${searchQuery}%` };
    }

    let orderBy: any;
    switch (filter) {
      case "most_recent":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "most_voted":
        orderBy = { upvotes: "desc" };
        break;
      case "most_viewed":
        orderBy = { views: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const savedQuestions = await db.query.questions.findMany({
      where: filters,
      orderBy,
      limit: pageSize,
      offset,
    });

    return { question: savedQuestions };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserInfoParams) {
  const { userId } = params;

  try {
    // Find the user by clerkId
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, userId),
    });

    if (!user) throw new Error("User not found");

    // Count total questions authored by the user
    const totalQuestionsResult = await db
      .select({
        count: sql<number>`count(${questions.authorId})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, user.id));

    const totalQuestions = totalQuestionsResult[0]?.count ?? 0;

    // Count total answers authored by the user
    const totalAnswersResult = await db
      .select({
        count: sql<number>`count(${answers.authorId})`.mapWith(Number),
      })
      .from(answers)
      .where(eq(answers.authorId, user.id));

    const totalAnswers = totalAnswersResult[0]?.count ?? 0;

    // Sum upvotes for questions authored by the user
    const questionUpvotesResult = await db
      .select({
        sum: sql<number>`sum(${questions.upvotes})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, user.id));

    const questionUpvotes = questionUpvotesResult[0]?.sum ?? 0;

    // Sum upvotes for answers authored by the user
    const answerUpvotesResult = await db
      .select({
        sum: sql<number>`sum(${answers.upvotes})`.mapWith(Number),
      })
      .from(answers)
      .where(eq(answers.authorId, user.id));

    const answerUpvotes = answerUpvotesResult[0]?.sum ?? 0;

    // Sum views for questions authored by the user
    const questionViewsResult = await db
      .select({
        sum: sql<number>`sum(${questions.views})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, user.id));

    const questionViews = questionViewsResult[0]?.sum ?? 0;

    // Badge assignment logic (based on your existing function)
    const badgeCounts = assignBadges({
      criteria: [
        { type: "QUESTION_COUNT", count: totalQuestions },
        { type: "ANSWER_COUNT", count: totalAnswers },
        { type: "QUESTION_UPVOTES", count: questionUpvotes },
        { type: "ANSWER_UPVOTES", count: answerUpvotes },
        { type: "TOTAL_VIEWS", count: questionViews },
      ],
    });

    return {
      user,
      totalAnswers,
      totalQuestions,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function getUserQuestions(params: GetUserStatsParams) {
  const { userId, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const totalQuestionsResult = await db
      .select({
        count: sql<number>`count(${questions.id})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, Number(userId)));

    const totalQuestions = totalQuestionsResult[0]?.count ?? 0;
    const questionsList = await db.query.questions.findMany({
      where: (questions, { eq }) => eq(questions.authorId, Number(userId)),
      offset,
      limit: pageSize,
    });

    return { totalQuestions, questions: questionsList };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  const { userId, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const totalAnswersResult = await db
      .select({
        count: sql<number>`count(${answers.id})`.mapWith(Number),
      })
      .from(answers)
      .where(eq(answers.authorId, Number(userId)));

    const totalAnswers = totalAnswersResult[0]?.count ?? 0;
    const answersList = await db.query.answers.findMany({
      where: (answers, { eq }) => eq(answers.authorId, Number(userId)),
      offset,
      limit: pageSize,
    });

    return { totalAnswers, answers: answersList };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
