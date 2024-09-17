import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compareSync } from "bcrypt-ts-edge";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";

import db from "./db/drizzle";
import {  users } from "./db/schema";
import { NextResponse } from "next/server";
import { APP_NAME, SENDER_EMAIL } from "./constants";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          type: "email",
        },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
    Resend({
      name: "Email",
      from: `${APP_NAME} <${SENDER_EMAIL}>`,
      id: "email",
    }),
    Google({
      allowDangerousEmailAccountLinking: true,
      clientId: "",
      clientSecret: "",
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }: any) => {
      if (user) {
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          await db
            .update(users)
            .set({
              name: token.name,
            })
            .where(eq(users.id, user.id));
        }

        token.role = user.role;
      }

      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
    session: async ({ session, user, trigger, token }: any) => {
      session.user.id = token.sub;
      session.user.role = token.role;
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    authorized({ request, auth }: any) {
      const protectedPaths = [/\/profile/, /\/user\/(.*)/, /\/admin/];
      const { pathname } = request.nextUrl;
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;
      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID();
        const newRequestHeaders = new Headers(request.headers);
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;
export const { handlers, auth, signIn, signOut } = NextAuth(config);
