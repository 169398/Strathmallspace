import Question from "@/components/forms/Question";
import { getUserById } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "StrathSpace | Ask a question",
  description: "Ask a question and get answers from the community.",
};

const AskQuestion = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="h1-bold text-invert flex-center w-full">Ask a Question</h1>
      <div className="mt-9">
        <Question userId={user.id.toString()} />
      </div>
    </div>
  );
};

export default AskQuestion;
