import { formatDistance } from "date-fns/formatDistance";
import Link from "next/link";
import { Button } from "../ui/button";

interface JobCardProps {
    job: {
      id: string;
    title: string;
    description: string;
    price: number;
    deadline: Date | string;
    createdAt?: Date | string;
    author: {
      id: string;
      name: string;
    };
  };
  currentUser?: {
    id: string;
  } | null;
}

export default function JobCard({ job, currentUser }: JobCardProps) {
  const isAuthor = currentUser?.id === job.author.id;

  // Parse the JSON description
  const parseDescription = (description: string) => {
    try {
      const parsed = JSON.parse(description);
      return parsed.blocks?.[0]?.data?.text || description;
    } catch {
      return description;
    }
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="card-wrapper flex h-full flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow-md transition-all hover:shadow-lg lg:min-w-[450px]">
        <div>
          <h3 className="h3-bold text-gray-900 dark:text-white mb-2 text-xl font-bold line-clamp-1">{job.title}</h3>
          <p className="text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
            <span className="font-medium">{job.author.name}</span> •
            <span className="text-gray-900 dark:text-gray-100">
              {job.createdAt
                ? formatDistance(new Date(job.createdAt), new Date(), {
                    addSuffix: true,
                  })
                : "recently"}
            </span>
          </p>
        </div>

        <p className="text-gray-900 dark:text-gray-100 min-h-[60px] text-base line-clamp-3">
          {parseDescription(job.description)}
        </p>

        <div className="mt-auto flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-primary-500 text-lg font-bold">KSH {job.price.toLocaleString()}</p>
            <p className="text-gray-900 dark:text-gray-100 text-sm">
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </p>
          </div>

          {!isAuthor && currentUser && (
            <Button className="primary-gradient min-w-[120px] transform   transition-transform hover:scale-105">
              View Details
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
