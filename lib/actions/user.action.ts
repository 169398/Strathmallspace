/* eslint-disable no-unused-vars */
import db from "@/db/drizzle";
import { questions, savedQuestions, user, answers, interactions, questionTags, tags } from "@/db/schema";
import {
  CreateUserParams,
  GetAllUsersParams,
  ToggleSaveQuestionParams,
  GetSavedQuestionsParams,
  GetUserInfoParams,
  GetUserStatsParams,
  UpdateUserParams,
} from "./shared.types.d";
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
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== '')
    );

    if (Object.keys(cleanedUpdateData).length === 0) {
      return {
        success: false,
        message: "No valid data to update"
      };
    }

    const result = await db
      .update(user)
      .set(cleanedUpdateData)
      .where(eq(user.id, userId))
      .returning();

    if (!result.length) {
      return {
        success: false,
        message: "User not found"
      };
    }

    if (path) {
      revalidatePath(path);
    }

    return {
      success: true,
      message: "Profile updated successfully",
      user: result[0],
    };
  } catch (error) {
    console.error("Error in updateUser:", error);
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : "Failed to update profile"
    };
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
    // Parse IDs if they're strings
    const parsedUserId = typeof userId === 'string' ? JSON.parse(userId) : userId;
    const parsedQuestionId = typeof questionId === 'string' ? JSON.parse(questionId) : questionId;

    // Validate inputs
    if (!parsedUserId || !parsedQuestionId) {
      throw new Error('Invalid user ID or question ID');
    }

    // Check if question exists first
    const questionExists = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, parsedQuestionId))
      .limit(1);

    if (!questionExists.length) {
      throw new Error('Question not found');
    }

    // Check for existing saved question
    const existing = await db
      .select({ id: savedQuestions.id })
      .from(savedQuestions)
      .where(
        and(
          eq(savedQuestions.userId, parsedUserId),
          eq(savedQuestions.questionId, parsedQuestionId)
        )
      )
      .limit(1);

    let result;
    if (existing.length > 0) {
      // Remove from saved questions
      await db
        .delete(savedQuestions)
        .where(eq(savedQuestions.id, existing[0].id));

      result = { 
        success: true, 
        message: "Question removed from saved",
        action: "removed" 
      };
    } else {
      // Add to saved questions
      await db
        .insert(savedQuestions)
        .values({
          userId: parsedUserId,
          questionId: parsedQuestionId,
        });
      
      result = { 
        success: true, 
        message: "Question saved successfully",
        action: "saved" 
      };
    }

    // Wrap revalidatePath in try-catch to handle cases where it's not available
    try {
      if (path) revalidatePath(path);
    } catch (error) {
      console.log('Revalidation not available in this context');
    }
    
    return result;
  } catch (error) {
    console.error("Error in toggleSaveQuestion:", error);
    
    if (error instanceof Error && error.message === 'Question not found') {
      return { 
        success: false, 
        message: "Question not found",
        action: "error"
      };
    }
    
    return { 
      success: false, 
      message: "Failed to toggle save question",
      action: "error"
    };
  }
}
export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  const { userId, searchQuery, filter, page = 1, pageSize = 15 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const baseConditions = [eq(savedQuestions.userId, userId)];
    if (searchQuery) {
      baseConditions.push(sql`${questions.title} ILIKE ${`%${searchQuery}%`}`);
    }

    const query = db
      .select({
        savedQuestionId: savedQuestions.id,
        question: {
          id: questions.id,
          title: questions.title,
          content: questions.content,
          views: questions.views,
          upvotes: questions.upvotes,
          downvotes: questions.downvotes,
          createdAt: questions.createdAt,
          authorId: questions.authorId,
          answersCount: sql<number>`(
            SELECT COUNT(*)::integer 
            FROM ${answers} 
            WHERE ${answers.questionId} = ${questions.id}
          )`.mapWith(Number),
        },
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
        },
        tag: {
          id: tags.id,
          name: tags.name,
        }
      })
      .from(savedQuestions)
      .innerJoin(questions, eq(savedQuestions.questionId, questions.id))
      .innerJoin(user, eq(questions.authorId, user.id))
      .leftJoin(questionTags, eq(questions.id, questionTags.questionId))
      .leftJoin(tags, eq(questionTags.tagId, tags.id))
      .where(and(...baseConditions))
      .limit(pageSize + 1)
      .offset(offset);

    switch (filter) {
      case "most_recent":
        query.orderBy(desc(questions.createdAt));
        break;
      case "oldest":
        query.orderBy(asc(questions.createdAt));
        break;
      case "most_voted":
        query.orderBy(desc(sql`array_length(${questions.upvotes}, 1)`));
        break;
      case "most_viewed":
        query.orderBy(desc(questions.views));
        break;
      default:
        query.orderBy(desc(questions.createdAt));
    }

    const results = await query;
    const isNext = results.length > pageSize;

    // Group the results by question ID to combine tags
    const groupedQuestions = results.reduce((acc: any[], curr: any) => {
      const existingQuestion = acc.find(q => q.id === curr.question.id);
      if (existingQuestion) {
        if (curr.tag?.id) {
          existingQuestion.tags.push({
            id: curr.tag.id,
            name: curr.tag.name,
          });
        }
      } else {
        acc.push({
          ...curr.question,
          author: curr.author,
          tags: curr.tag?.id ? [{
            id: curr.tag.id,
            name: curr.tag.name,
          }] : [],
          answers: curr.question.answersCount || 0
        });
      }
      return acc;
    }, []);

    return {
      question: groupedQuestions.slice(0, pageSize),
      isNext,
    };
  } catch (error) {
    console.error("Error in getSavedQuestions:", error);
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
      with: {
        author: true, tags: true, answers: true, 
        
      },
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

    // Updated query to include tags
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
          tags: questions.tags, // Added tags here
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





