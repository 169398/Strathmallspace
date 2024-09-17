ALTER TABLE "users" ADD COLUMN "year" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "picture";