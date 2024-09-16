import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "StrathSpace | Sign In",
  description: "Sign in to your account",
};

export default function Page() {
  return <SignIn />;
}
