import { getJobById } from "@/lib/actions/job.action";
import { auth } from "@/lib/auth";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import  ParseHtml  from "@/components/shared/ParseHtml";

export default async function JobDetail({ params }: { params: { id: string } }) {
  const session = await auth();
  const job = await getJobById(params.id);
  const isAuthor = session?.user?.id === job.author.id;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-12">
      <div className="flex flex-col gap-4 bg-white rounded-lg p-8 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="h1-bold text-dark-100">{job.title}</h1>
          <p className="text-primary-500 text-2xl font-bold">
            KSH {job.price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 text-dark-500">
          <span className="font-medium">{job.author.name}</span> •
          <span>
            Posted {formatDistance(job.createdAt ? new Date(job.createdAt) : new Date(), new Date(), { addSuffix: true })}
          </span>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <div className="prose max-w-none">
            <ParseHtml content={job.description} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-dark-500">Start Date</p>
              <p className="font-medium">{new Date(job.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-dark-500">Deadline</p>
              <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {!isAuthor && session?.user && (
          <div className="mt-6">
            <Link href={`/inbox?user=${job.author.id}`}>
              <Button className="primary-gradient w-full">
                Contact Employer
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 