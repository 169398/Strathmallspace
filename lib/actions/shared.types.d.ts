import { InferModel } from "drizzle-orm";
import { user, questions, answers } from "@/db/schema"; 
// Define the base types from the Drizzle schema
export type IUser = InferModel<typeof user, "select">;
export type IQuestion = InferModel<typeof questions, "select">;
export type IAnswer = InferModel<typeof answers, "select">;

// Pagination and filtering for users
export interface GetAllUsersParams {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// Creating an answer
export interface CreateAnswerParams {
  content: string;
  author: string; // Should reference a user ID
  question: string; // Should reference a question ID
  path: string;
}

// Getting answers for a question
export interface GetAnswersParams {
  questionId: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

// Get top interacted tags for a user
export interface GetTopInteractedTagsParams {
  userId: string;
  limit?: number;
}

// Getting a user by ID
export interface GetUserByIdParams {
  userId: string;
}

// Getting questions with pagination and filtering
export interface GetQuestionParams {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  filter?: string;
}

// Creating a question
export interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
  author: string; 
  path: string;
}

// Voting on an answer
export interface AnswerVoteParams {
  answerId: string;
  userId: string;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  path: string;
}

// Creating a user
export interface CreateUserParams {
  userId: string;
  name: string;
  username: string;
  email: string;
  picture: string;
}

// Updating a user

export type UpdateUserParams = {
  userId: string;
  updateData: {
    name?: string;
    username?: string;
    portfolioWebsite?: string;
    location?: string;
    bio?: string;
  };
  path: string;
};
// Deleting a user
export interface DeleteUserParams {
  userId: string;
}

// Getting a question by ID
export interface GetQuestionByIdParams {
  questionId: string;
}

// Voting on a question
export type QuestionVoteParams = {
  questionId: string;
  userId: string;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  path: string;
};

// Getting all tags with pagination and filtering
export interface GetAllTagsParams {
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// Toggle saving a question for a user
export interface ToggleSaveQuestionParams {
  userId: string;
  questionId: string;
  path: string;
}

// Getting saved questions for a user
export interface GetSavedQuestionsParams {
  userId: string;
  page?: number;
  pageSize?: number;
  filter?: string;
  searchQuery?: string;
}

// Viewing a question
export interface ViewQuestionParams {
  questionId: string;
  userId: string | undefined;
}

// Getting questions by tag ID
export interface GetQuestionByTagIdParams {
  tagId: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

// Getting user info (e.g., badges, reputation)
export interface GetUserInfoParams {
  userId: string;
}

// Getting user-related stats (e.g., questions, answers)
export interface GetUserStatsParams {
  userId: string;
  page?: number;
  pageSize?: number;
}

// Deleting a question
export interface DeleteQuestionParams {
  questionId: string;
  path: string;
}

// Deleting an answer
export interface DeleteAnswerParams {
  answerId: string;
  path: string;
}

// Updating a question
export interface UpdateQuestionParams {
  questionId: string;
  title: string;
  content: string;
  path: string;
}

// Search query params
export interface SearchParams {
  query?: string | null;
  type?: string | null;
}

// Recommended questions or content for a user
export interface RecommendedParams {
  userId: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}
