import { auth } from "@/lib/auth";
import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StrathSpace | Edit Question",
  description: "Edit a question.",
};

const page = async ({ params }: any) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const User = await getUserById(userId);
  const result = await getQuestionById({ questionId: params.id });
  return (
    <div>
      <h1 className="text-invert h1-bold">Edit Question</h1>
      <div className="mt-9">
        <Question
          type="Edit"
          userId={User.id.toString()}
          questionDetails={JSON.stringify(result)}
        />
      </div>
    </div>
  );
};

export default page;
