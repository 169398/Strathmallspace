ALTER TABLE "answers" ALTER COLUMN "content" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tags" uuid[] DEFAULT '{}';