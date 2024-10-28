import Answer from "@/components/forms/Answer";
import AllAnswers from "@/components/shared/AllAnswers";
import Metric from "@/components/shared/Metric";
import ParseHtml from "@/components/shared/ParseHtml";
import RenderTags from "@/components/shared/RenderTags";
import Voting from "@/components/shared/Voting";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { formatNumber, getTimeStamps } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "StrathSpace | Question",
  description: "View a question, and answer it.",
};

interface Props {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const Page = async ({ params, searchParams }: Props) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let user;
    if (userId) {
      user = await getUserById(userId);
    }

    // Validate and clean the question ID
    if (!params.id || typeof params.id !== 'string') {
      throw new Error('Invalid question ID');
    }

    const questionId = params.id.trim(); // Clean any whitespace

    // Get question details
    const result = await getQuestionById({ questionId });

    if (!result) {
      throw new Error('Question not found');
    }

    console.log("Params:", params);

    return (
      <>
        <div className="flex-start w-full flex-col">
          <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
            <Link
              className="flex items-center justify-start gap-1"
              href={`/profile/${result.author?.userId}`}
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
                userId={user ? JSON.stringify(user.id) : ""}
                upvotes={
                  Array.isArray(result.upvotes) ? result.upvotes.length : 0
                }
                hasUpvoted={
                  Array.isArray(result.upvotes) && user
                    ? result.upvotes.includes(user.id)
                    : false
                }
                downvotes={
                  Array.isArray(result.downvotes) ? result.downvotes.length : 0
                }
                hasDownvoted={
                  Array.isArray(result.downvotes) && user
                    ? result.downvotes.includes(user.id)
                    : false
                }
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
            value={`Asked ${
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
          questionId={result.id}
          authorId={result.author?.userId||""}
        />

        <AllAnswers
          questionId={result.id.toString()}
          userId={user ? user.id.toString() : ""}
          totalAnswers={Array.isArray(result.answers) ? result.answers.length : 0}
          page={Number(searchParams?.page) || 1}
          filter={searchParams?.filter?.toString() || ""}
        />
      </>
    );
  } catch (error) {
    console.error('Error in question page:', error);
    throw error; // Or handle the error appropriately
  }
};

export default Page;
