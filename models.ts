import { PgColumn } from "drizzle-orm/pg-core";

// src/types.ts
export interface RelationConfig {
  relationName: string;
  fields: PgColumn[]; 
}
