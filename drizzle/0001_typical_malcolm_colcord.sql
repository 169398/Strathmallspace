ALTER TABLE "users" DROP CONSTRAINT "users_clerk_id_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "clerkId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerkId_unique" UNIQUE("clerkId");