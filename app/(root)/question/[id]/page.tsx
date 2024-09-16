import Answer from '@/components/forms/Answer';
import AllAnswers from '@/components/shared/AllAnswers';
import Metric from '@/components/shared/Metric';
import ParseHtml from '@/components/shared/ParseHtml';
import RenderTags from '@/components/shared/RenderTags';
import Voting from '@/components/shared/Voting';
import { getQuestionById } from '@/lib/actions/question.action';
import { getUserById } from '@/lib/actions/user.action';
import { formatNumber, getTimeStamps } from '@/lib/utils';
import { auth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "StrathSpace | Question",
  description: "View a question, and answer it.",
};

const Page = async ({ params, searchParams }: any) => {
  const { userId: clerkId } = auth();
  let mongoUser;

  if (clerkId) {
    mongoUser = await getUserById(clerkId);
  }

  const result = await getQuestionById({ questionId: params.id });

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            className="flex items-center justify-start gap-1"
            href={`/profile/${result.author?.clerkId}`}
          >
            <Image
              className="rounded-full"
              src={result.author?.picture!}
              alt={result.author?.name!}
              width={20}
              height={20}
            />
            <p className="paragraph-semibold text-invert primary-text-gradient">
              {result.author?.name}
            </p>
          </Link>
          <div className="flex justify-end">
            <Voting
              type="Question"
              itemId={JSON.stringify(result.id)}
              userId={mongoUser ? JSON.stringify(mongoUser.id) : ""}
              upvotes={result.upvotes?.length ?? 0}
              hasUpvoted={
                mongoUser
                  ? result.upvotes?.includes(mongoUser.id) ?? false
                  : false
              }
              downvotes={result.downvotes?.length ?? 0}
              hasDownvoted={
                mongoUser
                  ? result.downvotes?.includes(mongoUser.id) ?? false
                  : false
              }
              hasSaved={mongoUser?.saved?.includes(result.id) ?? false}
            />
          </div>
        </div>
        <h2 className="h2-semibold text-invert mt-3.5 w-full text-left ">
          {result.title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="Clock"
          title=""
          textStyles="small-medium card-text-invert-secondary"
          value={` Asked ${
            result.createdAt ? getTimeStamps(result.createdAt) : "Unknown time"
          }`}
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="message"
          title="Answers"
          textStyles="small-medium card-text-invert-secondary"
          value={formatNumber(
            Array.isArray(result.answers) ? result.answers.length : 0
          )}
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          title="Views"
          textStyles="small-medium card-text-invert-secondary"
          value={formatNumber(result.views ?? 0)}
        />
      </div>

      <ParseHtml content={result.content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {Array.isArray(result.tags) &&
          result.tags.map((tag: any) => (
            <RenderTags
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              showCount={false}
            />
          ))}
      </div>

      <Answer
        question={result.content}
        questionId={JSON.stringify(result.id)}
        authorId={mongoUser ? JSON.stringify(mongoUser.id) : ""}
      />

      <AllAnswers
        questionId={result.id.toString()}
        userId={mongoUser ? mongoUser.id.toString() : ""}
        totalAnswers={Array.isArray(result.answers) ? result.answers.length : 0}
        page={searchParams?.page || 1} 
        filter={searchParams?.filter || ""} 
      />
    </>
  );
};

export default Page;
