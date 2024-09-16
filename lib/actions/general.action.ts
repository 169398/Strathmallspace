"use server";

import { questions, users, answers, tags } from "@/db/schema"; // Assuming these are your table schemas
import {  ilike  } from "drizzle-orm";
import { SearchParams } from "./shared.types";
import db from "@/db/drizzle";

export async function globalSearch(params: SearchParams) {
  const searchAbleTypes = ["question", "user", "answer", "tag"];

  try {
    const { query, type } = params;
    const searchQuery = `%${query}%`; // SQL LIKE pattern for partial matching
    let results = [];

    // Define models and their corresponding fields for search
    const modelsAndTypes = [
      {
        table: questions,
        searchField: questions.title,
        type: "question",
      },
      {
        table: users,
        searchField: users.name,
        type: "user",
      },
      {
        table: answers,
        searchField: answers.content,
        type: "answer",
      },
      {
        table: tags,
        searchField: tags.name,
        type: "tag",
      },
    ];

    const typeLower = type?.toLowerCase();

    if (!typeLower || !searchAbleTypes.includes(typeLower)) {
      // Search all types
      for (const { table, searchField, type } of modelsAndTypes) {
        const queryResults = await db
          .select({
            title: searchField,
            id: type === "user" ? users.clerkId : questions.id,
            question: answers.questionId, 
          })
          .from(table)
          .where(ilike(searchField, searchQuery))
          .limit(3);

        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer" ? `Answers containing ${query}` : item.title,
            type,
            id:
              type === "user"
                ? item.id
                : type === "answer"
                  ? item.question
                  : item.id,
          }))
        );
      }
    } else {
      // Search specific type
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);

      if (!modelInfo) {
        throw new Error("Invalid search type");
      }

      const queryResults = await db
        .select({
          title: modelInfo.searchField,
          id: typeLower === "user" ? modelInfo.searchField : typeLower === "answer" ? answers.questionId : modelInfo.searchField, 
          question: answers.questionId, 
        })
        .from(modelInfo.table)
        .where(ilike(modelInfo.searchField, searchQuery))
        .limit(10);

      results = queryResults.map((item) => ({
        title:
          typeLower === "answer" ? `Answers containing ${query}` : item.title,
        type: typeLower,
        id:
          typeLower === "user"
            ? item.id
            : typeLower === "answer"
              ? item.question
              : item.id,
      }));
    }

    return JSON.stringify(results);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch global result");
  }
}
