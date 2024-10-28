ALTER TABLE "saved_questions" DROP CONSTRAINT "saved_questions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_questions" DROP CONSTRAINT "saved_questions_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_questions" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_questions" ADD COLUMN "questionId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_questionId_questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "saved_questions" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "saved_questions" DROP COLUMN IF EXISTS "question_id";