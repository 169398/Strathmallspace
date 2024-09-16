import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
 
} from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerkId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  picture: varchar("picture", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  portfolioWebsite: varchar("portfolio_website", { length: 255 }),
  reputation: integer("reputation").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  password: varchar("password", { length: 255 }), // optional
});

// Tags Table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),

  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  questionCount: integer("question_count").default(0), 
});

// Questions Table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  views: integer("views").default(0),
  upvotes: integer("upvotes").array().default([]),
  downvotes: integer("downvotes").array().default([]),
  answersCount: integer("answers_count").default(0),
  tags: integer("tags").array().default([]),
  answers: integer("answers").array().default([]), 
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  tagId: integer("tag_id")
    .references(() => tags.id)
    .notNull(),
});

// Question Tags (Many-to-Many relation between Questions and Tags)
export const questionTags = pgTable("question_tags", {
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  tagId: integer("tag_id")
    .references(() => tags.id)
    .notNull(),
});

// Answers Table
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").array().default([]),
  downvotes: integer("downvotes").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});



// Interactions Table
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  tagId: integer("tag_id").references(() => tags.id),

  questionId: integer("question_id").references(() => questions.id),
  answerId: integer("answer_id").references(() => answers.id),
  createdAt: timestamp("created_at").defaultNow(),
  tags: integer("tags").array().default([]),
});

// Saved Questions Table
export const savedQuestions = pgTable("saved_questions", {
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
}, (table) => {
  return {
    primaryKey: [table.userId, table.questionId]
  };
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  interactions: many(interactions),
  savedQuestions: many(savedQuestions),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  author: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
  answers: many(answers),
  tags: many(questionTags),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  author: one(users, {
    fields: [answers.authorId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const interactionRelations = relations(interactions, ({ one }) => ({
  user: one(users, {
    fields: [interactions.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [interactions.questionId],
    references: [questions.id],
  }),
  answer: one(answers, {
    fields: [interactions.answerId],
    references: [answers.id],
  }),
}));

// Infer types
export type User = InferSelectModel<typeof users>;
export type Question = InferSelectModel<typeof questions>;
export type Answer = InferSelectModel<typeof answers>;
export type Tag = InferSelectModel<typeof tags>;
export type Interaction = InferSelectModel<typeof interactions>;
export type SavedQuestion = InferSelectModel<typeof savedQuestions>;

