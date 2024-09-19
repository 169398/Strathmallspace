ALTER TABLE "questions" DROP CONSTRAINT "questions_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "upvotes" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "upvotes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "downvotes" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "downvotes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "questions" DROP COLUMN IF EXISTS "tags";--> statement-breakpoint
ALTER TABLE "questions" DROP COLUMN IF EXISTS "answers";--> statement-breakpoint
ALTER TABLE "questions" DROP COLUMN IF EXISTS "tag_id";