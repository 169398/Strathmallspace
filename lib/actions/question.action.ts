"use server";

import {
  questions,
  tags,
  users,
  interactions,
  answers,
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
      .leftJoin(tags, eq(tags.id, questions.tagId))
      .leftJoin(users, eq(users.id, questions.authorId));

    if (searchQuery) {
      query.where(
        or(
          like(questions.title, `%${searchQuery}%`),
          like(questions.content, `%${searchQuery}%`)
        )
      );
    }

    switch (filter) {
      case "newest":
        query.orderBy(sql`createdAt DESC`);
        break;
      case "frequent":
        query.orderBy(sql`views DESC`);
        break;
      case "unanswered":
        query.where(eq(questions.answersCount, 0));
        break;
    }

    const questionList = await query
      .limit(pageSize)
      .offset(skipCount)
      .execute();
    
    const whereClause = searchQuery ? or( like(questions.title, `%${searchQuery}%`), like(questions.content, `%${searchQuery}%`)) : sql`true`;
    const totalQuestions = await db
      .select({ count: sql`count(*)` })
      .from(questions)
      .where(whereClause)
      .execute() as { count: number }[];

    const isNext = totalQuestions[0].count > skipCount + questionList.length;
    return { question: questionList, isNext };
  } catch (error) {
    console.error(`getQuestions : ${error}`);
    throw error;
  }
}

// Create a new question
export async function createQuestion(params: CreateQuestionParams) {
  try {
    const { title, content, tags: tagNames, author,tagId, path } = params;
    const authorId = Number(author);

    const question = await db
      .insert(questions)
      .values({ title, content, authorId, tagId: Number(tagId) })
      .returning()
      .execute();

    const tagIds = await Promise.all(
      tagNames.map(async (tagName) => {
        const existingTag = await db
          .select()
          .from(tags)
          .where(like(tags.name, `%${tagName}%`))
          .execute();

        if (existingTag.length > 0) {
          return existingTag[0].id;
        }

        const newTag = await db
          .insert(tags)
          .values({ name: tagName,description: "Tag Description" })
          .returning()
          .execute();

        return newTag[0].id;
      })
    );

    await db
      .update(questions)
      .set({ tags: tagIds })
      .where(eq(questions.id, question[0].id))
      .execute();

    await db
      .insert(interactions)
      .values({
        userId: authorId,
        action: "ask_question",
        questionId: question[0].id
      })
      .execute();

    await db
      .update(users)
      .set({ reputation: sql`${users.reputation} + 5` })
      .where(eq(users.id, Number( author)))
      .execute();

    revalidatePath(path);
  } catch (error) {
    console.error(`createQuestion : ${error}`);
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
          id: users.id,
          clerkId: users.clerkId,
          name: users.name,
          picture: users.picture,
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
      .leftJoin(tags, eq(tags.id, questions.tagId))
      .leftJoin(users, eq(users.id, questions.authorId))
      .leftJoin(answers, eq(answers.questionId, questions.id))
      .where(eq(questions.id, Number(questionId)))
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
        .where(eq(questions.id, Number(questionId)))
        .execute();
    } else if (hasDownvoted) {
      await db
        .update(questions)
        .set({
          downvotes: sql`${questions.downvotes} - 1`,
          upvotes: sql`${questions.upvotes} + 1`,
        })
        .where(eq(questions.id, Number(questionId)))
        .execute();
    } else {
      await db
        .update(questions)
        .set({ upvotes: sql`${questions.upvotes} + 1` })
        .where(eq(questions.id, Number(questionId)))
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
        .where(eq(questions.id, Number(questionId)))
        .execute();
    } else if (hasUpvoted) {
      await db
        .update(questions)
        .set({
          upvotes: sql`${questions.upvotes} - 1`,
          downvotes: sql`${questions.downvotes} + 1`,
        })
        .where(eq(questions.id, Number(questionId)))
        .execute();
    } else {
      await db
        .update(questions)
        .set({ downvotes: sql`${questions.downvotes} + 1` })
        .where(eq(questions.id, Number(questionId)))
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

    await db.delete(questions).where(eq(questions.id, Number(questionId))).execute();
    await db
      .delete(answers)
      .where(eq(answers.questionId, Number(questionId)))
      .execute();
    await db
      .delete(interactions)
      .where(eq(interactions.questionId, Number(questionId)))
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
      .where(eq(questions.id, Number(questionId)))
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

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .execute();
    if (!user.length) throw new Error("User not found");

    const userInteractions = await db
      .select()
      .from(interactions)
      .leftJoin(tags, eq(tags.id, interactions.tagId))
      .where(eq(interactions.userId, user[0].id))
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
      inArray(questions.tagId, distinctUserTagIds),
      not(eq(questions.authorId, user[0].id))
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
