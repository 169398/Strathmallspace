import db from "@/db/drizzle";
import { auth } from "../auth";
import { formatError } from "../utils";
import { eq } from "drizzle-orm";
import {  user as userTable } from "@/db/schema";
import { DeleteUserParams } from "./shared.types";

export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, session?.user?.id ?? ""),
    });
    if (!currentUser) throw new Error("User not found");
    await db
      .update(userTable)
      .set({
        name: user.name,
      })
      .where(eq(userTable.email, currentUser.email));

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
export async function deleteUser(params: DeleteUserParams) {
  const { userId } = params;

  try {
    // Find the user
    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
    });

    if (!user) throw new Error("User not found");

    // Delete the user
    await db.delete(userTable).where(eq(userTable.id, userId));

    //  delete related questions, answers but not really
    // await db.delete(questions).where(eq(questions.authorId, user.id));

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}