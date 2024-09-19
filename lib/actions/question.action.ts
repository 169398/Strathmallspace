"use server";

import {
  questions,
  tags,
  user,
  interactions,
  answers,
  questionTags,
} from "@/db/schema"; // Your schema
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  GetQuestionByIdParams,
  GetQuestionParams,
  QuestionVoteParams,
  RecommendedParams,
  UpdateQuestionParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import { eq, inArray, and, or, like, not, sql } from "drizzle-orm";
import db from "@/db/drizzle";

// Fetch questions with search, filter, and pagination
export async function getQuestions(params: GetQuestionParams) {
  try {
    const { searchQuery, filter, page = 1, pageSize = 15 } = params;
    const skipCount = (page - 1) * pageSize;

    const query = db
      .select()
      .from(questions)
      .leftJoin(questionTags, eq(questionTags.questionId, questions.id)) // Make sure to join the questionTags table
      .leftJoin(tags, eq(tags.id, questionTags.tagId)) // Reference questionTags in this join
      .leftJoin(user, eq(user.id, questions.authorId));

    // If there's a search query, filter by question title or content
    if (searchQuery) {
      query.where(
        or(
          like(questions.title, `%${searchQuery}%`),
          like(questions.content, `%${searchQuery}%`)
        )
      );
    }

    // Apply the filter conditions
    switch (filter) {
      case "newest":
        query.orderBy(sql`${questions}.created_at DESC`);
        break;
      case "frequent":
        query.orderBy(sql`${questions}.views DESC`);
        break;
      case "unanswered":
        query.where(eq(questions.answersCount, 0));
        break;
    }

    // Execute the query to get the paginated question list
    const questionList = await query
      .limit(pageSize)
      .offset(skipCount)
      .execute();

    // Count total number of questions that match the search query
    const whereClause = searchQuery
      ? or(
          like(questions.title, `%${searchQuery}%`),
          like(questions.content, `%${searchQuery}%`)
        )
      : sql`true`;

    const totalQuestions = (await db
      .select({ count: sql`count(*)` })
      .from(questions)
      .where(whereClause)
      .execute()) as { count: number }[];

    // Check if there's a next page
    const isNext = totalQuestions[0].count > skipCount + questionList.length;

    return { question: questionList, isNext };
  } catch (error) {
    console.error(`getQuestions : ${error}`);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    const { title, content, tags: tagNames, author, path } = params;
        console.log("Creating question with params:", params);

// Insert the question into the "questions" table
const [question] = await db
  .insert(questions)
  .values({
    title,
    content,
    authorId: author, 
  })
      .returning(); // Return the inserted question
        console.log("Question inserted:", question);


    // Handle tags by inserting into the questionTags join table
    const tagIds = await Promise.all(
      tagNames.map(async (tagName) => {
        console.log(`Checking if tag exists: ${tagName}`);

        const [existingTag] = await db
          .select()
          .from(tags)
          .where(like(tags.name, `%${tagName}%`))
          .limit(1) // Retrieve the first matching tag
          .execute();

        if (existingTag) {
                    console.log(`Existing tag found: ${existingTag.id}`);

          return existingTag.id; // Return existing tag's ID
        }
        console.log(`Tag not found, creating new tag: ${tagName}`);

        // Insert new tag if it doesn't exist
        const [newTag] = await db
          .insert(tags)
          .values({ name: tagName, description: "Tag Description" })
          .returning();

        return newTag.id; // Return the new tag ID
      })
    );
    console.log("Tag IDs associated with the question:", tagIds);

    // Insert into the questionTags table to associate the question with tags
    await Promise.all(
      tagIds.map(async (tagId) => {
        await db
          .insert(questionTags)
          .values({
            questionId: question.id, // Reference to the question
            tagId, // Reference to the tag
          })
          .execute();
      })
    );

    // Record the action in the interactions table (optional)
    await db
      .insert(interactions)
      .values({
        userId: author,
        action: "ask_question",
        questionId: question.id,
      })
      .execute();

    // Optionally, update the user's reputation
    await db
      .update(user)
      .set({ reputation: sql`${user.reputation} + 5` }) // Increment reputation by 5
      .where(eq(user.id, author))
      .execute();
    console.log(`User ${author}'s reputation updated.`);

    // Revalidate the path to ensure fresh data (optional)
    revalidatePath(path);
  } catch (error) {
    console.error(`createQuestion: ${error}`);
    throw error;
  }
}

// Fetch a question by ID
export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    const { questionId } = params;

    // Fetch the question, along with the author, tags, and answer-related fields
    const question = await db
      .select({
        id: questions.id,
        title: questions.title,
        content: questions.content,
        createdAt: questions.createdAt,
        views: questions.views,
        upvotes: questions.upvotes, 
        downvotes: questions.downvotes, 
        author: {
          id: user.id,
          userId: user.id,
          name: user.name,
          picture: user.image,
        },
        tags: {
          id: tags.id,
          name: tags.name,
        },
        answers: {
          id: answers.id,
          content: answers.content,
          createdAt: answers.createdAt,
          upvotes: answers.upvotes,
          downvotes: answers.downvotes,
        },
      })
      .from(questions)
      .leftJoin(tags, eq(tags.id, questionTags.tagId))
      .leftJoin(user, eq(user.id, questions.authorId))
      .leftJoin(answers, eq(answers.questionId, questions.id))
      .where(eq(questions.id, questionId))
      .execute();

    return question[0]; 
  } catch (error) {
    console.error(`getQuestionById : ${error}`);
    throw error;
  }
}


// Upvote a question
export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    const { questionId,  hasDownvoted, hasUpvoted, path } = params;

    if (hasUpvoted) {
      await db
        .update(questions)
        .set({ upvotes: sql`${questions.upvotes} - 1` })
        .where(eq(questions.id, questionId))
        .execute();
    } else if (hasDownvoted) {
      await db
        .update(questions)
        .set({
          downvotes: sql`${questions.downvotes} - 1`,
          upvotes: sql`${questions.upvotes} + 1`,
        })
        .where(eq(questions.id, questionId))
        .execute();
    } else {
      await db
        .update(questions)
        .set({ upvotes: sql`${questions.upvotes} + 1` })
        .where(eq(questions.id, questionId))
        .execute();
    }

    revalidatePath(path);
  } catch (error) {
    console.error(`upvoteQuestion : ${error}`);
    throw error;
  }
}

// Downvote a question
export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    const { questionId,  hasDownvoted, hasUpvoted, path } = params;

    if (hasDownvoted) {
      await db
        .update(questions)
        .set({ downvotes: sql`${questions.downvotes} - 1` })
        .where(eq(questions.id, questionId))
        .execute();
    } else if (hasUpvoted) {
      await db
        .update(questions)
        .set({
          upvotes: sql`${questions.upvotes} - 1`,
          downvotes: sql`${questions.downvotes} + 1`,
        })
        .where(eq(questions.id, questionId))
        .execute();
    } else {
      await db
        .update(questions)
        .set({ downvotes: sql`${questions.downvotes} + 1` })
        .where(eq(questions.id, questionId))
        .execute();
    }

    revalidatePath(path);
  } catch (error) {
    console.error(`downvoteQuestion : ${error}`);
    throw error;
  }
}

// Delete a question
export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    const { questionId, path } = params;

    await db.delete(questions).where(eq(questions.id, questionId)).execute();
    await db
      .delete(answers)
      .where(eq(answers.questionId, questionId))
      .execute();
    await db
      .delete(interactions)
      .where(eq(interactions.questionId, questionId))
      .execute();

    await db
      .update(tags)
      .set({ questionCount: sql`${tags.questionCount} - 1` })
      .execute();

    revalidatePath(path);
  } catch (error) {
    console.error(`deleteQuestion : ${error}`);
    throw error;
  }
}

// Update a question
export async function updateQuestion(params: UpdateQuestionParams) {
  try {
    const { questionId, title, content, path } = params;

    await db
      .update(questions)
      .set({ title, content })
      .where(eq(questions.id, questionId))
      .execute();

    revalidatePath(path);
  } catch (error) {
    console.error(`updateQuestion : ${error}`);
    throw error;
  }
}

// Fetch hot questions
export async function getHotQuestions() {
  try {
    const hotQuestions = await db
      .select()
      .from(questions)
      .orderBy(sql`views DESC, upvotes DESC`)
      .limit(4)
      .execute();

    return hotQuestions;
  } catch (error) {
    console.error(`getHotQuestions : ${error}`);
    throw error;
  }
}

// Fetch recommended questions for a user
export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    const { userId, page = 1, pageSize = 20, searchQuery } = params;

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .execute();
    if (!users.length) throw new Error("User not found");

    const userInteractions = await db
      .select()
      .from(interactions)
      .leftJoin(tags, eq(tags.id, interactions.tagId))
      .where(eq(interactions.userId, users[0].id))
      .execute();

    const userTags = userInteractions.map((interaction) => interaction.tags);

    const distinctUserTagIds = [
  ...new Set(
    userTags
      .filter((tag): tag is NonNullable<typeof tag> => tag !== null)
      .map((tag) => tag.id)
  ),
];

    const baseWhereClause = and(
      inArray(questionTags.tagId, distinctUserTagIds),
      not(eq(questions.authorId, users[0].id))
    );

    const searchWhereClause = searchQuery
      ? or(
          like(questions.title, `%${searchQuery}%`),
          like(questions.content, `%${searchQuery}%`)
        )
      : sql`true`;

    const query = db
      .select()
      .from(questions)
      .where(and(baseWhereClause, searchWhereClause));

    const totalQuestions = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(and(baseWhereClause, searchWhereClause))
      .execute();

    const recommendedQuestions = await query
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute();

    const isNext = totalQuestions[0].count > pageSize * page;

    return { question: recommendedQuestions, isNext };
  } catch (error) {
    console.error(`getRecommendedQuestions : ${error}`);
    throw error;
  }
}
