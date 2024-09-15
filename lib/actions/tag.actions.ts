"use server";

import {
  tags,
  questions,
  interactions,
  users,
  questionTags,
} from "@/db/schema";
import {
  GetAllTagsParams,
  GetTopInteractedTagsParams,
  GetQuestionByTagIdParams,
} from "./shared.types";
import { eq, and, ilike, desc, asc, sql, inArray } from "drizzle-orm";
import db from "@/db/drizzle";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    const { userId, limit = 10 } = params;

    // Ensure userId is a number
    const numericUserId = parseInt(userId, 10);

    // Find user interactions
    const userInteractions = await db
      .select({ interactionTags: interactions.action })
      .from(interactions)
      .where(eq(interactions.user, numericUserId));

    if (!userInteractions.length) {
      throw new Error("No interactions found for this user");
    }

    // Aggregate tag counts from interactions
    const tagCounts: { [tagId: string]: number } = {};
    userInteractions.forEach(({ interactionTags }) => {
      JSON.parse(interactionTags).forEach((tagId: number) => {
        if (tagCounts[tagId]) {
          tagCounts[tagId]++;
        } else {
          tagCounts[tagId] = 1;
        }
      });
    });

    // Sort and limit tags by interaction count
    const sortedTagIds = Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([tagId]) => parseInt(tagId));

    // Fetch tag details
    const topTags = await db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(inArray(tags.id, sortedTagIds));

    return topTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const offset = (page - 1) * pageSize;

    let sortOptions;
    switch (filter) {
      case "popular":
        sortOptions = desc(sql`COUNT(questions.id)`);
        break;
      case "recent":
        sortOptions = desc(tags.createdAt);
        break;
      case "name":
        sortOptions = asc(tags.name);
        break;
      case "old":
        sortOptions = asc(tags.createdAt);
        break;
      default:
        sortOptions = asc(tags.name);
        break;
    }

    // Build search query
    let whereClause;
    if (searchQuery) {
      whereClause = ilike(tags.name, `%${searchQuery}%`);
    }

    // Fetch tags with pagination and sorting
    const tagsListQuery = db
      .select({
        id: tags.id,
        name: tags.name,
        description: tags.description,
      })
      .from(tags)
      .leftJoin(questionTags, eq(tags.id, questionTags.tagId))
      .groupBy(tags.id)
      .orderBy(sortOptions)
      .offset(offset)
      .limit(pageSize);

    if (whereClause) {
      tagsListQuery.where(whereClause);
    }

    const tagsList = await tagsListQuery;

    const totalTagsQuery = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tags);

    if (whereClause) {
      totalTagsQuery.where(whereClause);
    }

    const totalTags = await totalTagsQuery;

    const isNext = totalTags[0].count > offset + tagsList.length;

    return { tags: tagsList, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionByTagId(params: GetQuestionByTagIdParams) {
  try {
    const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const offset = (page - 1) * pageSize;

    // Fetch questions related to the tag
    const tagWithQuestions = await db
      .select({
        questionId: questions.id,
        title: questions.title,
        createdAt: questions.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorUsername: users.username,
        name: tags.name, 
      })
      .from(tags)
      .where(
        and(
          eq(tags.id, parseInt(tagId, 10)),
          searchQuery ? ilike(questions.title, `%${searchQuery}%`) : undefined
        )
      )
      .leftJoin(questionTags, eq(tags.id, questionTags.tagId))
      .leftJoin(questions, eq(questionTags.questionId, questions.id))
      .leftJoin(users, eq(questions.author, users.id))
      .orderBy(desc(questions.createdAt))
      .offset(offset)
      .limit(pageSize + 1);

    const isNext = tagWithQuestions.length > pageSize;
    const questionsList = tagWithQuestions.slice(0, pageSize);

    return {
      tagTitle: tagWithQuestions[0]?.name || "",
      questions: questionsList,
      isNext,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPopularTags() {
  try {
    // Query popular tags based on number of associated questions
    const popularTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        totalQuestions: sql<number>`COUNT(questions.id)`,
      })
      .from(tags)
      .leftJoin(questionTags, eq(tags.id, questionTags.tagId))
      .groupBy(tags.id)
      .orderBy(desc(sql`COUNT(questions.id)`))
      .limit(5);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
