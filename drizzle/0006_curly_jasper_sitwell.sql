ALTER TABLE "jobs" DROP CONSTRAINT "jobs_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "authorId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_authorId_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "author_id";