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
  
  if (!userId) {
    console.log("No user session found");
    return null;
  }

  try {
    const user = await getUserById(userId);
    console.log("Retrieved user data:", user);

    if (!user) {
      console.log("User not found");
      return null;
    }

    return (
      <div>
        <h1 className="text-invert h1-bold">Edit Profile</h1>
        <div className="mt-9">
          <Profile userId={userId} user={user} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading profile page:", error);
    return <div>Error loading profile</div>;
  }
};

export default Page;
