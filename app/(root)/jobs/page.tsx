import { getJobs } from "@/lib/actions/job.action";
import Link from "next/link";
import { auth } from "@/lib/auth";
import JobCard from "@/components/cards/JobsCard";
export default async function Jobs() {
  const session = await auth();
  const jobs = await getJobs();

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h1-bold text-gray-900 dark:text-white">
            Available Jobs
          </h1>
          <p className="text-gray-900 dark:text-gray-100 mt-1">Find jobs that match your skills</p>
        </div>

        {session?.user && (
          <Link
            href="/jobs/create"
            className="primary-gradient text-light-900 rounded-lg px-4 py-2 text-center sm:text-left"
          >
            Post a Job
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={{
              id: job.id,
              title: job.title,
              description: job.description,
              price: job.price,
              deadline: job.deadline,
              createdAt: job.createdAt || undefined,
              author: {
                id: job.author.id,
                name: job.author.name
              }
            }}
            currentUser={session?.user ? {id: session.user.id!} : null}
          />
        ))}
      </div>
    </div>
  );
}
