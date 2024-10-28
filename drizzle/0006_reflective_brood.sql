ALTER TABLE "questions" ALTER COLUMN "upvotes" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "upvotes" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "downvotes" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "downvotes" DROP DEFAULT;