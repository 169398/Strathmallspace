/* eslint-disable no-unused-vars */
import db from "@/db/drizzle";
import { questions, savedQuestions, users, answers } from "@/db/schema";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  UpdateUserParams,
  ToggleSaveQuestionParams,
  GetSavedQuestionsParams,
  GetUserInfoParams,
  GetUserStatsParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import { eq, or, desc, asc, and, sql } from "drizzle-orm";
import { assignBadges, formatError } from "../utils";
import { auth, signIn, signOut } from "@/auth";
import { hashSync } from "bcrypt-ts-edge";
import { sendResetPasswordEmail } from "@/app/emailreset-password";
import { addMinutes } from "date-fns";
import { z } from "zod";
import { signInFormSchema, signUpFormSchema } from "../validation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { sendVerificationEmail } from "@/app/emailverify";


export async function getUserById(userId: string) {
  try {
    // Query the user along with their saved questions
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, userId),
      with: {
        savedQuestions: true, // Assuming savedQuestions is the table name
      },
    });

    if (!user) throw new Error("User not found");

    return {
      ...user,
      saved: user.savedQuestions.map((sq) => sq.questionId), 
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}



export async function createUser(userData: CreateUserParams) {
  try {
    // Log the incoming user data to ensure it's correct
    console.log('Creating user with data:', userData);
    
    // Insert the user data into the users table
    const newUser = await db
      .insert(users)
      .values(userData)
      .returning(); // This returns the newly created record
    
    // Log the created user
    console.log('New user created:', newUser);

    return newUser;
  } catch (error) {
    // Detailed error logging
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}
export async function updateUser(params: UpdateUserParams) {
  const { clerkId, updateData, path } = params;

  try {
    await db.update(users).set(updateData).where(eq(users.clerkId, clerkId));
    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  const { clerkId } = params;

  try {
    // Find the user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkId),
    });

    if (!user) throw new Error("User not found");

    // Delete the user
    await db.delete(users).where(eq(users.clerkId, clerkId));

    // Optionally, delete related questions, answers, etc.
    await db.delete(questions).where(eq(questions.authorId, user.id));

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  const { searchQuery, filter, page = 1, pageSize = 100 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const query = db.select().from(users);

    if (searchQuery) {
      query.where(
        or(
          eq(users.name, `%${searchQuery}%`),
          eq(users.username, `%${searchQuery}%`)
        )
      );
    }

    const sortOptions = {};
    switch (filter) {
      case "new_users":
        query.orderBy(desc(users.joinedAt));
        break;
      case "old_users":
        query.orderBy(asc(users.joinedAt));
        break;
      case "top_contributors":
        query.orderBy(desc(users.reputation));
        break;
    }

    const usersList = await query.offset(offset).limit(pageSize);
    return { users: usersList };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  const { userId, questionId, path } = params;

  try {
    const existing = await db.query.savedQuestions.findFirst({
      where: (savedQuestions, { eq, and }) =>
        and(
          eq(savedQuestions.userId, Number(userId)),
          eq(savedQuestions.questionId, Number(questionId))
        ),
    });

    if (existing) {
      await db
        .delete(savedQuestions)
        .where(
          and(
            eq(savedQuestions.userId, Number(userId)),
            eq(savedQuestions.questionId, Number(questionId))
          )
        );
    } else {
      await db
        .insert(savedQuestions)
        .values([{ userId: Number(userId), questionId: Number(questionId) }]);
    }

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  const { clerkId, searchQuery, filter, page = 1, pageSize = 15 } = params;
  const offset = (page - 1) * pageSize;

  try {
    // Fetch the user based on clerkId
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkId),
    });

    if (!user) {
      return { question: [] };
    }

    const filters: any = { authorId: user.id };

    if (searchQuery) {
      filters.title = { $ilike: `%${searchQuery}%` };
    }

    let orderBy: any;
    switch (filter) {
      case "most_recent":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "most_voted":
        orderBy = { upvotes: "desc" };
        break;
      case "most_viewed":
        orderBy = { views: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const savedQuestions = await db.query.questions.findMany({
      where: filters,
      orderBy,
      limit: pageSize,
      offset,
    });

    return { question: savedQuestions };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserInfoParams) {
  const { userId } = params;

  try {
    // Find the user by clerkId
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, userId),
    });

    if (!user) throw new Error("User not found");

    // Count total questions authored by the user
    const totalQuestionsResult = await db
      .select({
        count: sql<number>`count(${questions.authorId})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, user.id));

    const totalQuestions = totalQuestionsResult[0]?.count ?? 0;

    // Count total answers authored by the user
    const totalAnswersResult = await db
      .select({
        count: sql<number>`count(${answers.authorId})`.mapWith(Number),
      })
      .from(answers)
      .where(eq(answers.authorId, user.id));

    const totalAnswers = totalAnswersResult[0]?.count ?? 0;

    // Sum upvotes for questions authored by the user
    const questionUpvotesResult = await db
      .select({
        sum: sql<number>`sum(${questions.upvotes})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, user.id));

    const questionUpvotes = questionUpvotesResult[0]?.sum ?? 0;

    // Sum upvotes for answers authored by the user
    const answerUpvotesResult = await db
      .select({
        sum: sql<number>`sum(${answers.upvotes})`.mapWith(Number),
      })
      .from(answers)
      .where(eq(answers.authorId, user.id));

    const answerUpvotes = answerUpvotesResult[0]?.sum ?? 0;

    // Sum views for questions authored by the user
    const questionViewsResult = await db
      .select({
        sum: sql<number>`sum(${questions.views})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, user.id));

    const questionViews = questionViewsResult[0]?.sum ?? 0;

    // Badge assignment logic (based on your existing function)
    const badgeCounts = assignBadges({
      criteria: [
        { type: "QUESTION_COUNT", count: totalQuestions },
        { type: "ANSWER_COUNT", count: totalAnswers },
        { type: "QUESTION_UPVOTES", count: questionUpvotes },
        { type: "ANSWER_UPVOTES", count: answerUpvotes },
        { type: "TOTAL_VIEWS", count: questionViews },
      ],
    });

    return {
      user,
      totalAnswers,
      totalQuestions,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function getUserQuestions(params: GetUserStatsParams) {
  const { userId, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const totalQuestionsResult = await db
      .select({
        count: sql<number>`count(${questions.id})`.mapWith(Number),
      })
      .from(questions)
      .where(eq(questions.authorId, Number(userId)));

    const totalQuestions = totalQuestionsResult[0]?.count ?? 0;

    // Fetch questions and join with author data
    const questionsList = await db
      .query.questions.findMany({
        where: (questions, { eq }) => eq(questions.authorId, Number(userId)),
        offset,
        limit: pageSize,
        with: { author: true }, 
      });

    const isNextQuestions = questionsList.length === pageSize;

    return { totalQuestions, questions: questionsList, isNextQuestions };
  } catch (error) {
    console.error(error);
    throw error;
  }
}




export async function getUserAnswers(params: GetUserStatsParams) {
  const { userId, page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  try {
    const totalAnswersResult = await db
      .select({
        count: sql<number>`count(${answers.id})`.mapWith(Number),
      })
      .from(answers)
      .where(eq(answers.authorId, Number(userId)));

    const totalAnswers = totalAnswersResult[0]?.count ?? 0;

    // Fetch answers with related question and author
    const answersList = await db
      .select({
        id: answers.id,
        content: answers.content,
        createdAt: answers.createdAt,
        upvotes: answers.upvotes,
        downvotes: answers.downvotes,
        question: {
          id: questions.id,
          title: questions.title,
        },
        author: {
          id: users.id,
          name: users.name,
          picture: users.picture,
        },
      })
      .from(answers)
      .leftJoin(questions, eq(questions.id, answers.questionId))
      .leftJoin(users, eq(users.id, answers.authorId))
      .where(eq(answers.authorId, Number(userId)))
      .offset(offset)
      .limit(pageSize)
      .execute();

    // Check if there are more answers beyond the current page
    const isNextAnswer = totalAnswers > page * pageSize;

    return { totalAnswers, answers: answersList, isNextAnswer };
  } catch (error) {
    console.error(error);
    throw error;
  }
}




export async function signUp(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      confirmPassword: formData.get("confirmPassword"),
      password: formData.get("password"),
    });
    const values = {
      id: crypto.randomUUID(),
      ...user,
      username: formData.get("username") as string, 
      password: hashSync(user.password, 10),
    };

    await db.insert(users).values(values);

    await sendVerificationEmail({
      name: "",
      resetToken: "",
      resetTokenExpires: null,
      email: user.email ?? "",
      password: null,
      id: "",
      role: "",
      emailVerified: null,
      image: null,
      createdAt: null,
      course: null,
      year: null,
      username: "",
      bio: null,
      location: null,
      portfolioWebsite: null,
      reputation: null,
      joinedAt: null
    });

    return {
      success: true,
      message:
        "User created successfully. Please check your email for verification.",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error).includes(
        'duplicate key value violates unique constraint "user_email_idx"'
      )
        ? "Email already exists"
        : formatError(error),
    };
  }
}
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signIn("credentials", user);
    return { success: true, message: "Sign in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}

export const SignInWithEmail = async (formData: any) => {
  await signIn("email", formData);
};

export const SignInWithGoogle = async () => {
  await signIn("google");
};

export const SignOut = async () => {
  await signOut();
};

// RESET PASSWORD
const requestResetSchema = z.object({
  email: z.string().email(),
});

// Reset Password Schema
const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export const requestPasswordReset = async (formData: FormData) => {
  try {
    const data = requestResetSchema.parse({
      email: formData.get("email"),
    });

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email),
    });

    if (!user) {
      throw new Error("No user found with this email address.");
    }

    // Generate a reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = addMinutes(new Date(), 60);
    console.log(resetToken);
    await db
      .update(users)
      .set({ resetToken, resetTokenExpires: expiresAt })
      .where(eq(users.id, user.id));

    // Send reset email
    await sendResetPasswordEmail(user, resetToken);

    return {
      success: true,
      message: "Password reset email sent successfully.",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const resetPassword = async (formData: FormData) => {
  try {
    const token = formData.get("token") as string;
    const newPassword = formData.get("newPassword") as string;

    const data = resetPasswordSchema.parse({
      token,
      newPassword,
    });

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.resetToken, data.token),
    });

    if (!user) {
      throw new Error("Invalid or expired reset token.");
    }

    if (
      user.resetTokenExpires &&
      new Date() > new Date(user.resetTokenExpires)
    ) {
      throw new Error("Reset token has expired.");
    }

    const hashedPassword = hashSync(data.newPassword, 10);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, user.id));

    revalidatePath("/sign-in");

    return { success: true, message: "Password reset successfully." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};









export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session?.user.id!),
    });
    if (!currentUser) throw new Error("User not found");
    await db
      .update(users)
      .set({
        name: user.name,
      })
      .where(eq(users.id, currentUser.id));

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

