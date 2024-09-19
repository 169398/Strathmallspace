import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";
import { user as userTable } from "../db/schema";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";

export const config: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        // Check if the user exists in the database
        const dbUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, token.email!))
          .limit(1);

        // If the user doesn't exist, create a new user in the database
        if (!dbUser.length) {
          const newUser = await db
            .insert(userTable)
            .values({
              email: token.email ?? '',
              name: token.name ?? '',
              image: token.picture ?? '',
              username: nanoid(10), // or any username logic you want
            })
            .returning();

          // Set the new user's ID in the token
          token.id = newUser[0].id;
          return token;
        }

        // If the user exists but has no username, update the record
        if (!dbUser[0].username) {
          await db
            .update(userTable)
            .set({ username: nanoid(10) })
            .where(eq(userTable.id, dbUser[0].id));
        }

        // Return user data in the token
        return {
          id: dbUser[0].id,
          name: dbUser[0].name,
          email: dbUser[0].email,
          picture: dbUser[0].image,
          username: dbUser[0].username,
        };
      }

      return token;
    },
    redirect() {
      return "/";
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
