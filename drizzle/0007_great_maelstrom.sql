-- First, let's drop the problematic foreign key if it exists
ALTER TABLE IF EXISTS "jobs" DROP CONSTRAINT IF EXISTS "jobs_author_id_user_id_fk";

-- Then modify the column name from author_id to user_id if it exists
ALTER TABLE IF EXISTS "jobs" 
  RENAME COLUMN IF EXISTS "author_id" TO "user_id";

-- Add the correct foreign key
ALTER TABLE "jobs" 
  ADD CONSTRAINT "jobs_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") 
  ON DELETE CASCADE;

-- Do the same for questions table if needed
ALTER TABLE IF EXISTS "questions" DROP CONSTRAINT IF EXISTS "questions_author_id_user_id_fk";

ALTER TABLE IF EXISTS "questions" 
  RENAME COLUMN IF EXISTS "author_id" TO "user_id";

ALTER TABLE "questions" 
  ADD CONSTRAINT "questions_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") 
  ON DELETE CASCADE;