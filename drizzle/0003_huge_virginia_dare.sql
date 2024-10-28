ALTER TABLE "answers" ALTER COLUMN "upvotes" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "upvotes" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "downvotes" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "downvotes" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "upvotes" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "upvotes" SET DEFAULT 0;