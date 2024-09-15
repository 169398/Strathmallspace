CREATE TABLE IF NOT EXISTS "answer_downvotes" (
	"answerId" integer,
	"userId" integer,
	CONSTRAINT "answer_downvotes_answerId_userId_pk" PRIMARY KEY("answerId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "answer_upvotes" (
	"answerId" integer,
	"userId" integer,
	CONSTRAINT "answer_upvotes_answerId_userId_pk" PRIMARY KEY("answerId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" integer NOT NULL,
	"question" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interaction_tags" (
	"interactionId" integer,
	"tagId" integer,
	CONSTRAINT "interaction_tags_interactionId_tagId_pk" PRIMARY KEY("interactionId","tagId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer NOT NULL,
	"action" varchar(255) NOT NULL,
	"question" integer,
	"answer" integer,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_tags" (
	"questionId" integer,
	"tagId" integer,
	CONSTRAINT "question_tags_questionId_tagId_pk" PRIMARY KEY("questionId","tagId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"views" integer DEFAULT 0,
	"author" integer,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerkId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"bio" text,
	"picture" varchar(255) NOT NULL,
	"location" varchar(255),
	"portfolioWebsite" varchar(255),
	"reputation" integer DEFAULT 0,
	"joinedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer_downvotes" ADD CONSTRAINT "answer_downvotes_answerId_answers_id_fk" FOREIGN KEY ("answerId") REFERENCES "public"."answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer_downvotes" ADD CONSTRAINT "answer_downvotes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer_upvotes" ADD CONSTRAINT "answer_upvotes_answerId_answers_id_fk" FOREIGN KEY ("answerId") REFERENCES "public"."answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer_upvotes" ADD CONSTRAINT "answer_upvotes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answers" ADD CONSTRAINT "answers_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answers" ADD CONSTRAINT "answers_question_questions_id_fk" FOREIGN KEY ("question") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interaction_tags" ADD CONSTRAINT "interaction_tags_interactionId_interactions_id_fk" FOREIGN KEY ("interactionId") REFERENCES "public"."interactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interaction_tags" ADD CONSTRAINT "interaction_tags_tagId_tags_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interactions" ADD CONSTRAINT "interactions_question_questions_id_fk" FOREIGN KEY ("question") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interactions" ADD CONSTRAINT "interactions_answer_answers_id_fk" FOREIGN KEY ("answer") REFERENCES "public"."answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_tags" ADD CONSTRAINT "question_tags_questionId_questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_tags" ADD CONSTRAINT "question_tags_tagId_tags_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
