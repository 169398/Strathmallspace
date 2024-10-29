/* eslint-disable no-unused-vars */
"use server";

import { tags, questions, interactions, questionTags, user } from "@/db/schema";
import { eq, inArray, like, desc, asc, sql } from "drizzle-orm";
import {
  GetAllTagsParams,
  GetTopInteractedTagsParams,
  GetQuestionByTagIdParams,
} from "./shared.types";
import db from "@/db/drizzle";

// Get Top Interacted Tags
export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    const { userId, limit = 10 } = params;

    const topTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        interactionCount: sql<number>`
          COUNT(DISTINCT ${questionTags.questionId})::integer
        `.mapWith(Number).as('interaction_count')
      })
      .from(tags)
      .innerJoin(questionTags, eq(questionTags.tagId, tags.id))
      .innerJoin(questions, eq(questions.id, questionTags.questionId))
      .where(eq(questions.authorId, userId))
      .groupBy(tags.id, tags.name)
      .orderBy(desc(sql`interaction_count`))
      .limit(limit);

    return topTags;
  } catch (error) {
    console.error("Error in getTopInteractedTags:", error);
    return [];
  }
}

// Get All Tags with filtering, sorting, and pagination



export async function getAllTags(params: GetAllTagsParams) {
  try {
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const skipCount = (page - 1) * pageSize;

    let sortOptions;
    switch (filter) {
      case 'popular':
        sortOptions = desc(sql`question_count`);
        break;
      case 'recent':
        sortOptions = desc(tags.createdAt);
        break;
      case 'name':
        sortOptions = asc(tags.name);
        break;
      case 'old':
        sortOptions = asc(tags.createdAt);
        break;
      default:
        sortOptions = desc(tags.createdAt); 
        break;
    }

    // Base query with question count
    const baseQuery = db
      .select({
        id: tags.id,
        name: tags.name,
        description: tags.description,
        createdAt: tags.createdAt,
        questionCount: sql<number>`
          COUNT(DISTINCT ${questionTags.questionId})::integer
        `.mapWith(Number).as('question_count')
      })
      .from(tags)
      .leftJoin(questionTags, eq(tags.id, questionTags.tagId))
      .groupBy(tags.id);

    // Apply search filter if provided
    const query = searchQuery
      ? baseQuery.where(like(tags.name, `%${searchQuery}%`))
      : baseQuery;

    const tagsList = await query
      .orderBy(sortOptions)
      .offset(skipCount)
      .limit(pageSize);

    const totalTagsResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tags.id})::integer`.mapWith(Number),
      })
      .from(tags)
      .where(searchQuery ? like(tags.name, `%${searchQuery}%`) : undefined);

    const totalTags = totalTagsResult[0]?.count || 0;
    const isNext = totalTags > skipCount + tagsList.length;

    return { tags: tagsList, isNext };
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// Get Questions by Tag ID
export async function getQuestionByTagId(params: GetQuestionByTagIdParams) {
  try {
    const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const skipCount = (page - 1) * pageSize;

    // First, get the tag name
    const tagInfo = await db
      .select({
        id: tags.id,
        name: tags.name,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    const tagQuestions = await db
      .select({
        question: {
          id: questions.id,
          title: questions.title,
          createdAt: questions.createdAt,
          views: questions.views,
          upvotes: questions.upvotes,
          downvotes: questions.downvotes,
          answersCount: questions.answersCount,
        },
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        tag: {
          id: tags.id,
          name: tags.name,
        }
      })
      .from(questionTags)
      .innerJoin(questions, eq(questions.id, questionTags.questionId))
      .innerJoin(tags, eq(tags.id, questionTags.tagId))
      .innerJoin(user, eq(user.id, questions.authorId)) // Add this join
      .where(eq(questionTags.tagId, tagId))
      .offset(skipCount)
      .limit(pageSize + 1);

    const isNext = tagQuestions.length > pageSize;
    const questionsList = tagQuestions.slice(0, pageSize);

    return { 
      tagTitle: tagInfo[0]?.name || 'Unknown Tag',
      tagId: tagInfo[0]?.id || tagId,
      questions: questionsList.map(q => ({
        ...q.question,
        author: q.author,
        tag: q.tag,
      })), 
      isNext 
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get Popular Tags
export async function getPopularTags() {
  try {
    const popularTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        totalQuestions: sql<number>`
          COUNT(DISTINCT ${questionTags.questionId})::integer
        `.mapWith(Number).as('total_questions')
      })
      .from(tags)
      .leftJoin(questionTags, eq(tags.id, questionTags.tagId))
      .groupBy(tags.id)
      .orderBy(desc(sql`total_questions`))
      .limit(5);

    return popularTags;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
