"use server";

import { questions, users, answers, tags } from "@/db/schema"; 
import {  ilike } from "drizzle-orm"; 
import { SearchParams } from "./shared.types";
import db from "@/db/drizzle";

export async function globalSearch(params: SearchParams) {
  const searchAbleTypes = ["question", "user", "answer", "tag"];

  try {
    const { query, type } = params;

    const searchQuery = `%${query}%`;

    let results: any[] = [];

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
          .select({ id: table.id, title: searchField })
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
                  ? item.id
                  : item.title,
          }))
        );
      }
    } else {
      // Search in specific type
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);

      if (!modelInfo) {
        throw new Error("Invalid search type");
      }

      const queryResults = await db
        .select({ id: modelInfo.table.id, title: modelInfo.searchField })
        .from(modelInfo.table)
        .where(ilike(modelInfo.searchField, searchQuery))
        .limit(10);

      results = queryResults.map((item) => ({
        title: type === "answer" ? `Answers containing ${query}` : item.title,
        type,
        id:
          type === "user"
            ? item.id
            : type === "answer"
              ? item.title
              : item.id,
      }));
    }

    return JSON.stringify(results);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch global result");
  }
}
