ALTER TABLE "interactions" ADD COLUMN "tag_id" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "upvotes" integer[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "downvotes" integer[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "answers_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tags" integer[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "answers" integer[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tag_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "question_count" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interactions" ADD CONSTRAINT "interactions_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
