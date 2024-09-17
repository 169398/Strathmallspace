/* eslint-disable no-unused-vars */
"use server";

import { tags, questions, users, interactions } from "@/db/schema";
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

    // Find interactions by the user
    const userInteractions = await db
      .select({
        interactionId: interactions.id,
        tagId: interactions.tagId,
      })
      .from(interactions)
      .where(eq(interactions.userId, userId));

    if (!userInteractions.length) throw new Error("User not found");

    // Count interactions for each tag
    const tagCounts: { [tagId: string]: number } = {};
    userInteractions.forEach((interaction) => {
      if (interaction.tagId !== null) {
        if (tagCounts[interaction.tagId]) {
          tagCounts[interaction.tagId]++;
        } else {
          tagCounts[interaction.tagId] = 1;
        }
      }
    });

    // Sort tags by interaction count
    const sortedTags = Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA) 
      .slice(0, limit) 
      .map(([tagId]) => tagId);

    // Get tag details from tags table
    const topTags = await db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(tags)
      .where(inArray(tags.id, sortedTags as string[]));

    return topTags;
  } catch (error) {
    console.error(error);
    throw error;
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
        sortOptions = desc(tags.questionCount);
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

    const query = searchQuery
      ? db
          .select()
          .from(tags)
          .where(like(tags.name, `%${searchQuery}%`))
      : db.select().from(tags);

    const tagsList = await query
      .orderBy(sortOptions)
      .offset(skipCount)
      .limit(pageSize)
      .execute();

    // Explicitly define the type for totalTagsResult
    const totalTagsResult = await db.execute<{ count: number }>(sql`SELECT COUNT(*) as count FROM ${tags}`);
    const totalTags = (totalTagsResult as unknown as { count: number }[])[0]?.count || 0; 
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

    const query = searchQuery
      ? db
        .select()
        .from(questions)
        .where(like(questions.title, `%${searchQuery}%`))
      : db.select().from(questions);

    const tagQuestions = await db
      .select({
        questionId: questions.id,
        title: questions.title,
        authorId: questions.authorId,
      })
      .from(questions)
      .innerJoin(tags, eq(tags.id, questions.tagId))
      .where(eq(questions.tagId, tagId))
      .offset(skipCount)
      .limit(pageSize + 1);

    const isNext = tagQuestions.length > pageSize;
    const questionsList = tagQuestions.slice(0, pageSize);

    return { tagTitle: tagId, questions: questionsList, isNext };
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
        totalQuestions: tags.questionCount,
      })
      .from(tags)
      .orderBy(desc(tags.questionCount))
      .limit(5);

    return popularTags;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
