import NextAuth, { NextAuthConfig, } from "next-auth";
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
        session.user.email = token.email! ;
        session.user.image = token.picture;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        // User is signed in
        const dbUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, token.email!))
          .limit(1);

        if (!dbUser.length) {
          token.id = user.id;
          return token;
        }

        if (!dbUser[0].username) {
          await db
            .update(userTable)
            .set({ username: nanoid(10) })
            .where(eq(userTable.id, dbUser[0].id));
        }

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

// Correct usage of getServerSession with authOptions
export const { handlers, auth, signIn, signOut } = NextAuth(config);
