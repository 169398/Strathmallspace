import { auth } from "@/lib/auth";
import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StrathSpace | Edit Profile",
  description: "Edit your profile.",
};

const Page = async ({ params }: any) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const mongoUser = await getUserById(userId);
  // const result = await getQuestionById({ questionId: params.id });
  return (
    <div>
      <h1 className="text-invert h1-bold">Edit Profile</h1>
      <div className="mt-9">
        <Profile userId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </div>
  );
};

export default Page;
