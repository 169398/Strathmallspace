import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { primaryKey } from "drizzle-orm/pg-core/primary-keys";

import { AdapterAccount } from "next-auth/adapters";

// Users Table
export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  role: text("role").notNull().default("user"),
  course: text("course"),
  resetTokenExpires: timestamp("resetTokenExpires"),
  resetToken: text("resetToken"),
  createdAt: timestamp("createdAt").defaultNow(),
  year: text("year"),

  email: varchar("email", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  image: text("image"),
  location: varchar("location", { length: 255 }),
  portfolioWebsite: varchar("portfolio_website", { length: 255 }),
  reputation: integer("reputation").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  password: varchar("password", { length: 255 }),
});

// ACCOUNTS
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// SESSIONS
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// VERIFICATION TOKENS
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
// Tags Table
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  questionCount: integer("question_count").default(0),
  questions: integer("questions").array().default([]),
  views: integer("views").default(0),
  answers: integer("answers").default(0),
  author: uuid("author").references(() => user.id),
  upvotes: uuid('upvotes').array(),
  downvotes: uuid('downvotes').array(),
});

// Questions Table
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  views: integer("views").default(0),
  upvotes: uuid("upvotes").array(),
  downvotes: uuid("downvotes").array(),
  answersCount: integer("answers_count").default(0),
  authorId: uuid("author_id")
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  tags: uuid("tags").array().default([]),
  answers: uuid("answers").array().default([]),
});

// Associative table for tags to enable many-to-many relationship
export const questionTags = pgTable("question_tags", {
  questionId: uuid("question_id")
    .references(() => questions.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id)
    .notNull(),
});
// Answers Table
export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .references(() => user.id)
    .notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id)
    .notNull(),
  content: text("content").notNull(),
  upvotes: uuid("upvotes").array(),
  downvotes: uuid("downvotes").array(),
  createdAt: timestamp("created_at").defaultNow(),
  
});

// Interactions Table
export const interactions = pgTable("interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  tagId: uuid("tag_id").references(() => tags.id),
  questionId: uuid("question_id").references(() => questions.id),
  answerId: uuid("answer_id").references(() => answers.id),
  createdAt: timestamp("created_at").defaultNow(),
  tags: uuid("tags").array().default([]),
});


export const savedQuestions = pgTable(
  "saved_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .references(() => user.id)
      .notNull(),
    questionId: uuid("questionId")
      .references(() => questions.id)
      .notNull(),
  },
  (table) => ({
    primaryKey: [table.userId, table.questionId],
  })
);


// Relations
export const userRelations = relations(user, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  interactions: many(interactions),
  savedQuestions: many(savedQuestions),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  author: one(user, {
    fields: [questions.authorId],
    references: [user.id],
  }),
  answers: many(answers),
  tags: many(questionTags),
}));

export const questionTagRelations = relations(questionTags, ({ one }) => ({
  question: one(questions, {
    fields: [questionTags.questionId],
    references: [questions.id],
  }),
  tag: one(tags, {
    fields: [questionTags.tagId],
    references: [tags.id],
  }),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  author: one(user, {
    fields: [answers.authorId],
    references: [user.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const interactionRelations = relations(interactions, ({ one }) => ({
  user: one(user, {
    fields: [interactions.userId],
    references: [user.id],
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

export const savedQuestionRelations = relations(savedQuestions, ({ one }) => ({
  user: one(user, {
    fields: [savedQuestions.userId],
    references: [user.id],
  }),
  question: one(questions, {
    fields: [savedQuestions.questionId],
    references: [questions.id],
  }),
}));

// Infer types
export type User = InferSelectModel<typeof user>;
export type Question = InferSelectModel<typeof questions>;
export type Answer = InferSelectModel<typeof answers>;
export type Tag = InferSelectModel<typeof tags>;
export type Interaction = InferSelectModel<typeof interactions>;
export type SavedQuestion = InferSelectModel<typeof savedQuestions>;
