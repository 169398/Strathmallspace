import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Job from "@/components/forms/Job";

export default async function CreateJob() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:px-12">
      <div>
        <h1 className="h1-bold text-dark-100">Post a Job</h1>
        <p className="text-dark-500 mt-2">
          Create a new job for others to help you with your assignment
        </p>
      </div>

      <Job userId={session.user.id!} />
    </div>
  );
}
