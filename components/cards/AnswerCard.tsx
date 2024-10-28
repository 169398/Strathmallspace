'use client';

import Link from "next/link";
import Metric from "../shared/Metric";
import { formatNumber, getTimeStamps } from "@/lib/utils";
import { useSession } from "next-auth/react";
import EditDeleteAction from "../shared/EditDeleteAction";

interface Props {
  id: string;
  question: {
    id: string;
    title: string;
    tags: string[];
  };
  author: {
    id: string;
    name: string;
    picture: string;
  };
  upvotes: number;
  createdAt: Date;
}

const AnswerCard = ({ id, question, author, upvotes, createdAt }: Props) => {
  const { data: session } = useSession();
  const showActionButton = session?.user?.id === author.id;

  return (
    <Link
      href={`/question/${question.id}/#${id}`}
      className="card-wrapper rounded-[10px] px-11 py-9"
    >
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-invert-secondary line-clamp-1 flex sm:hidden">
            {getTimeStamps(createdAt)}
          </span>
          <h3 className="sm:h3-semibold base-semibold text-invert line-clamp-1 flex-1">
            {question.title}
          </h3>
        </div>

        {showActionButton && (
          <div>
            <EditDeleteAction type="Answer" itemId={JSON.stringify(id)} />
          </div>
        )}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture}
          alt="user avatar"
          value={author.name}
          title={` - answered ${getTimeStamps(createdAt)}`}
          href={`/profile/${author.id}`}
          textStyles="body-medium text-invert-secondary"
          isAuthor
        />

        <div className="flex-center gap-3">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="like icon"
            value={formatNumber(upvotes)}
            title=" Votes"
            textStyles="small-medium text-invert-secondary"
          />
        </div>
      </div>
    </Link>
  );
};

export default AnswerCard;
