import { questions, users, answers, tags } from "@/db/schema";
import { ilike } from "drizzle-orm";
import { SearchParams } from "./shared.types";
import db from "@/db/drizzle";

export async function globalSearch(params: SearchParams) {
  const searchAbleTypes = ["question", "user", "answer", "tag"];

  try {
    const { query, type } = params;
    const searchQuery = `%${query}%`; // SQL LIKE pattern for partial matching
    let results: Array<{ title: string; type: string; id: string | number }> = [];

    // Define models and their corresponding fields for search
    const modelsAndTypes = [
      {
        table: questions,
        searchField: questions.title,
        type: "question",
        idField: questions.id,
      },
      {
        table: users,
        searchField: users.name,
        type: "user",
        idField: users.clerkId,
      },
      {
        table: answers,
        searchField: answers.content,
        type: "answer",
        idField: answers.questionId,
      },
      {
        table: tags,
        searchField: tags.name,
        type: "tag",
        idField: tags.id,
      },
    ];

    const typeLower = type?.toLowerCase();

    if (!typeLower || !searchAbleTypes.includes(typeLower)) {
      // Search all types
      for (const { table, searchField, type, idField } of modelsAndTypes) {
        const queryResults = await db
          .select({
            title: searchField,
            id: idField,
            question: answers.questionId,
          })
          .from(table)
          .where(ilike(searchField, searchQuery))
          .limit(3)
          .execute();

        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer" ? `Answers containing ${query}` : item.title,
            type,
            id: item.id,
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
          id: modelInfo.idField,
          question: answers.questionId,
        })
        .from(modelInfo.table)
        .where(ilike(modelInfo.searchField, searchQuery))
        .limit(10)
        .execute();

      results = queryResults.map((item) => ({
        title:
          typeLower === "answer" ? `Answers containing ${query}` : item.title,
        type: typeLower,
        id: item.id,
      }));
    }

    return JSON.stringify(results);
  } catch (error) {
    console.error(`Error in globalSearch: ${(error as Error).message}`);
    throw new Error("Failed to fetch global result");
  }
}
