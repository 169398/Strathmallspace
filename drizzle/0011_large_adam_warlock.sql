DROP TABLE IF EXISTS "jobs";

CREATE TABLE IF NOT EXISTS "jobs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "price" integer NOT NULL,
    "start_date" timestamp NOT NULL,
    "deadline" timestamp NOT NULL,
    "done" boolean DEFAULT false,
    "author_id" uuid NOT NULL,
    "assigned_to" uuid,
    "created_at" timestamp DEFAULT now()
);

DO $$ BEGIN
    ALTER TABLE "jobs" ADD CONSTRAINT "jobs_author_id_user_id_fk" 
    FOREIGN KEY ("author_id") REFERENCES "user"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assigned_to_user_id_fk" 
    FOREIGN KEY ("assigned_to") REFERENCES "user"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;