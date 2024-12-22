import { sql } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

export async function up(db: any) {
  // First, set a default authorId for existing rows
  await sql`
    UPDATE "jobs"
    SET "authorId" = (SELECT id FROM "user" LIMIT 1)
    WHERE "authorId" IS NULL
  `;

  // Then add the NOT NULL constraint
  await sql`
    ALTER TABLE "jobs"
    ALTER COLUMN "authorId" SET NOT NULL
  `;
}

export async function down(db: any) {
  await sql`
    ALTER TABLE "jobs"
    ALTER COLUMN "authorId" DROP NOT NULL
  `;
}
