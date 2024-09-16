import Question from "@/components/forms/Question";
import { getUserById } from "@/lib/actions/user.action"; // Assuming this fetches data from NeonDB now
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StrathSpace | Ask a question",
  description: "Ask a question and get answers from the community.",
};

const AskQuestion = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  // Fetch user from NeonDB using the Clerk userId
  const user = await getUserById(userId);

  if (!user) {
    // Handle case where user is not found, redirect or show error
    redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="h1-bold text-invert flex-center w-full">Ask a Question</h1>
      <div className="mt-9">
        {/* Pass the correct user ID to the Question component */}
        <Question userId={user.id.toString()} />
      </div>
    </div>
  );
};

export default AskQuestion;
