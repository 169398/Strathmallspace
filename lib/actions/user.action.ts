/* eslint-disable no-unused-vars */
import db from "@/db/drizzle";
import { questions, savedQuestions, user, answers } from "@/db/schema";
import {
  CreateUserParams,
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
import { signIn, signOut } from "../auth";


export async function getUserById(userId: string) {
  try {
    // Query the user along with their saved questions
    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
      with: {
        savedQuestions: true, // Assuming savedQuestions is the table name
      },
    });

    if (!user) throw new Error("User not found");

    return {
      ...user,
      saved: user.savedQuestions.map((sq) => sq.questionId),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    // Log the incoming user data to ensure it's correct
    console.log("Creating user with data:", userData);

    // Insert the user data into the users table
    const newUser = await db.insert(user).values(userData).returning(); // This returns the newly created record

    // Log the created user
    console.log("New user created:", newUser);

    return newUser;
  } catch (error) {
    // Detailed error logging
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}
export async function updateUser(params: UpdateUserParams) {
  const { userId, updateData, path } = params;

  try {
    // Ensure updateData is not empty
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("No update data provided.");
    }

    // Perform the update and check the result
    const result = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning(); // Optionally return updated rows

    // Log the result to check if any rows were updated
    if (result.length === 0) {
      console.warn(`No user found with ID: ${userId}, or no data was updated.`);
    } else {
      console.log(`User with ID: ${userId} successfully updated.`);
    }

    // Optionally revalidate the path if necessary
     if (path) {
       revalidatePath(path);
    }

    return result; // Return updated user data or affected row info
  } catch (error) {
    console.error(`Failed to update user with ID: ${userId}:`, error);
    throw error;
  }
}




export async function getAllUsers(params: GetAllUsersParams) {
  const { searchQuery, filter, page = 1, pageSize = 100 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const query = db.select().from(user);

    if (searchQuery) {
      query.where(
        or(
          eq(user.name, `%${searchQuery}%`),
          eq(user.username, `%${searchQuery}%`)
        )
      );
    }

    const sortOptions = {};
    switch (filter) {
      case "new_users":
        query.orderBy(desc(user.joinedAt));
        break;
      case "old_users":
        query.orderBy(asc(user.joinedAt));
        break;
      case "top_contributors":
        query.orderBy(desc(user.reputation));
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
          eq(savedQuestions.userId, userId),
          eq(savedQuestions.questionId, questionId)
        ),
    });

    if (existing) {
      await db
        .delete(savedQuestions)
        .where(
          and(
            eq(savedQuestions.userId, userId),
            eq(savedQuestions.questionId, questionId)
          )
        );
    } else {
      await db.insert(savedQuestions).values([{ userId, questionId }]);
    }

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  const { userId, searchQuery, filter, page = 1, pageSize = 15 } = params;
  const offset = (page - 1) * pageSize;

  try {
    console.log("Fetching saved questions for user:", userId);
    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
    });

    if (!user) {
      console.log("User not found:", userId);
      return { question: [], isNext: false };
    }

    const filters: any = { authorId: user.id };

    if (searchQuery) {
      filters.title = { $ilike: `%${searchQuery}%` };
      console.log("Applying search query filter:", searchQuery);
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
    console.log("Applying order by filter:", filter);

    const savedQuestions = await db.query.questions.findMany({
      where: filters,
      orderBy,
      limit: pageSize + 1, // Fetch one extra record
      offset,
    });

    const isNext = savedQuestions.length > pageSize;
    console.log("Fetched saved questions:", savedQuestions);

    return {
      question: savedQuestions.slice(0, pageSize),
      isNext,
    };
  } catch (error) {
    console.error("Error fetching saved questions:", error);
    return { question: [], isNext: false };
  }
}

export async function getUserInfo(params: GetUserInfoParams) {
  const { userId } = params;

  try {
    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
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
       sum: sql<number>`sum(u)`.mapWith(Number),
     })
     .from(
       sql`(
      SELECT unnest(${questions.upvotes}) AS u
      FROM ${questions}
      WHERE ${eq(questions.authorId, user.id)}
    )`
     );

    const questionUpvotes = questionUpvotesResult[0]?.sum ?? 0;

    // Sum upvotes for answers authored by the user
   const answerUpvotesResult = await db
     .select({
       sum: sql<number>`sum(u)`.mapWith(Number),
     })
     .from(
       sql`(
      SELECT unnest(${answers.upvotes}) AS u
      FROM ${answers}
      WHERE ${eq(answers.authorId, user.id)}
    )`
     );

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
      .where(eq(questions.authorId, userId));

    const totalQuestions = totalQuestionsResult[0]?.count ?? 0;

    // Fetch questions and join with author data
    const questionsList = await db.query.questions.findMany({
      where: (questions, { eq }) => eq(questions.authorId, userId),
      offset,
      limit: pageSize,
      with: { author: true, tags: true ,answers: true},
    });

    const isNextQuestions = questionsList.length === pageSize;

    return { totalQuestions, questions: questionsList, isNextQuestions };
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
      .where(eq(answers.authorId, userId));

    const totalAnswers = totalAnswersResult[0]?.count ?? 0;

    // Fetch answers with related question and author
    const answersList = await db
      .select({
        id: answers.id,
        content: answers.content,
        createdAt: answers.createdAt,
        upvotes: answers.upvotes,
        downvotes: answers.downvotes,
        question: {
          id: questions.id,
          title: questions.title,
        },
        author: {
          id: user.id,
          name: user.name,
          picture: user.image,
        },
      })
      .from(answers)
      .leftJoin(questions, eq(questions.id, answers.questionId))
      .leftJoin(user, eq(user.id, answers.authorId))
      .where(eq(answers.authorId, userId))
      .offset(offset)
      .limit(pageSize)
      .execute();

    // Check if there are more answers beyond the current page
    const isNextAnswer = totalAnswers > page * pageSize;

    return { totalAnswers, answers: answersList, isNextAnswer };
  } catch (error) {
    console.error(error);
    throw error;
  }
}



export const SignInWithGoogle = async () => {
  await signIn("google");
};

export const SignOut = async () => {
  await signOut();
};



