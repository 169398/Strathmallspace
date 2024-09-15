import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  primaryKey,
  
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerkId", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Nullable if user doesn't have a password
  bio: text("bio"),
  picture: varchar("picture", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  portfolioWebsite: varchar("portfolioWebsite", { length: 255 }),
  reputation: integer("reputation").default(0),
  joinedAt: timestamp("joinedAt").defaultNow(),
  savedQuestions: text("savedQuestions"), 
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  views: integer("views").default(0),
  author: integer("author").references(() => users.id), // Foreign key referencing users
  createdAt: timestamp("createdAt").defaultNow(),
});

// Many-to-Many relationship (tags)
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Join table for question tags (many-to-many)
export const questionTags = pgTable(
  "question_tags",
  {
    questionId: integer("questionId").references(() => questions.id),
    tagId: integer("tagId").references(() => tags.id),
  },
  (table) => ({
    pk: primaryKey(table.questionId, table.tagId),
  })
);

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  author: integer("author")
    .references(() => users.id)
    .notNull(),
  question: integer("question")
    .references(() => questions.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Many-to-Many relationship (upvotes & downvotes for answers)
export const answerUpvotes = pgTable(
  "answer_upvotes",
  {
    answerId: integer("answerId").references(() => answers.id),
    userId: integer("userId").references(() => users.id),
  },
  (table) => ({
    pk: primaryKey(table.answerId, table.userId),
  })
);

export const answerDownvotes = pgTable(
  "answer_downvotes",
  {
    answerId: integer("answerId").references(() => answers.id),
    userId: integer("userId").references(() => users.id),
  },
  (table) => ({
    pk: primaryKey(table.answerId, table.userId),
  })
);

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  user: integer("user")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  question: integer("question").references(() => questions.id),
  answer: integer("answer").references(() => answers.id),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Many-to-Many relationship (tags for interactions)
export const interactionTags = pgTable(
  "interaction_tags",
  {
    interactionId: integer("interactionId").references(() => interactions.id),
    tagId: integer("tagId").references(() => tags.id),
  },
  (table) => ({
    pk: primaryKey(table.interactionId, table.tagId),
  })
);

// Define relationships
export const userRelations = relations(users, ({ one, many }) => ({
  questions: many(questions, { relationName: "author" }),
  answers: many(answers, { relationName: "author" }),
  answerUpvotes: many(answerUpvotes, { relationName: "user" }),
  answerDownvotes: many(answerDownvotes, { relationName: "user" }),
  interactions: many(interactions, { relationName: "user" }),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  author: one(users, {
    relationName: "author",
    fields: [questions.author],
    references: [users.id],
  }),
  answers: many(answers, { relationName: "question" }),
  tags: many(questionTags, { relationName: "question" }),
}));

export const answerRelations = relations(answers, ({ one, many }) => ({
  author: one(users, {
    relationName: "author",
    fields: [answers.author],
    references: [users.id],
  }),
  question: one(questions, {
    relationName: "question",
    fields: [answers.question],
    references: [questions.id],
  }),
  upvotes: many(answerUpvotes, { relationName: "answer" }),
  downvotes: many(answerDownvotes, { relationName: "answer" }),
}));

export const interactionRelations = relations(
  interactions,
  ({ one, many }) => ({
    user: one(users, {
      relationName: "user",
      fields: [interactions.user],
      references: [users.id],
    }),
    question: one(questions, {
      relationName: "question",
      fields: [interactions.question],
      references: [questions.id],
    }),
    answer: one(answers, {
      relationName: "answer",
      fields: [interactions.answer],
      references: [answers.id],
    }),
    tags: many(interactionTags, { relationName: "interaction" }),
  })
);

export const tagRelations = relations(tags, ({ many }) => ({
  questions: many(questionTags, { relationName: "tag" }),
  interactions: many(interactionTags, { relationName: "tag" }),
}));
