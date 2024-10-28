ALTER TABLE "tags" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "answers" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "author" uuid;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "upvotes" uuid[];--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "downvotes" uuid[];--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tags" ADD CONSTRAINT "tags_author_user_id_fk" FOREIGN KEY ("author") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
