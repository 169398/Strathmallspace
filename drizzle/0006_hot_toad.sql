ALTER TABLE "tags" ADD COLUMN "questions" integer[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "author";