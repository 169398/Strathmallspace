import Link from "next/link";
import React from "react";
import RenderTags from "../shared/RenderTags";
import Metric from "../shared/Metric";
import { formatNumber, getTimeStamps } from "@/lib/utils";
import EditDeleteAction from "../shared/EditDeleteAction";
import { auth } from "@/lib/auth";

interface QuestionCardProps {
  id: string;
  title: string;
  tags: { id: string; name: string }[];
  author: {
    id: string;
    name: string;
    picture: string;
    userId: string; 
  };
  upvotes: { id: string }[];
  views: number;
  answers: { id: string }[] | number; // Modified to accept both array and number
  createdAt: Date;
}

const QuestionCard = async ({
  id,
  title,
  tags = [],
  author = { id: "", name: "", picture: "", userId: "" },
  upvotes = [], // default value is already here, but we still need null checks
  views = 0,
  answers = [],
  createdAt,
}: QuestionCardProps) => {
   

  const session = await auth();
  const showActionButton = session?.user?.id === author.id;

  // Ensure createdAt is properly parsed to a Date object
  const parsedDate = createdAt ? new Date(createdAt) : new Date();


  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-invert line-clamp-1 flex sm:hidden">
            {getTimeStamps(parsedDate)}
          </span>
          <Link href={`/question/${id}`}>
            <h3 className="sm:h3-semibold base-semibold text-invert line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>
        {showActionButton && (
          <div>
            <EditDeleteAction type="Question" itemId={id} />
          </div>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {/* Ensure tags is an array before calling map */}
        {Array.isArray(tags) &&
          tags.map((tag) => (
            <RenderTags key={tag.id} name={tag.name} _id={tag.id} />
          ))}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author?.picture || "/assets/icons/user.svg"} 
          alt="user avatar"
          title={` - asked ${getTimeStamps(parsedDate)}`}
          textStyles="body-medium card-text-invert-secondary"
          href={`/profile/${author.id}`}
          isAuthor
          value={author?.name || "Anonymous"}
        />

        <div className="flex-sm:justify-start flex items-center gap-3 max-sm:flex-wrap">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="upvotes"
            title="Votes"
            textStyles="small-medium card-text-invert-secondary"
            value={!upvotes || upvotes.length === 0 ? "0" : formatNumber(upvotes.length)}
          />
          <Metric
            imgUrl="/assets/icons/message.svg"
            alt="message"
            title="Answers"
            textStyles="small-medium card-text-invert-secondary"
            value={
              !answers ? "0" :
              Array.isArray(answers) 
                ? formatNumber(answers.length)
                : typeof answers === 'number'
                  ? formatNumber(answers)
                  : '0'
            }
            href={`/question/${id}`}
          />
          <Metric
            imgUrl="/assets/icons/eye.svg"
            alt="eye"
            title="Views"
            textStyles="small-medium card-text-invert-secondary"
            value={!views || views === 0 ? "0" : formatNumber(views)}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
