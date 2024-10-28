import { AnswerFilters } from "@/constants/filters";
import Filter from "@/components/shared/filter";
import { getAnswers } from "@/lib/actions/answer.action";
import Link from "next/link";
import Image from "next/image";
import { getTimeStamps } from "@/lib/utils";
import ParseHtml from "./ParseHtml";
import Voting from "./Voting";
import Pagination from "./Pagination";

interface AllAnswerProps {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: string;

}

const AllAnswers = async ({
  questionId,
  userId,
  totalAnswers,
  page,
  filter,
}: AllAnswerProps) => {
  const result = await getAnswers({
    questionId,
    page: page ? +page : 1,
    sortBy: filter,
  });

  return (
    <div className="mt-11 ">
      <div className="flex items-center justify-between ">
        <h3 className="primary-text-gradient h3-semibold">
          {totalAnswers > 1
            ? `${totalAnswers} Answers`
            : `${totalAnswers} Answer`}
        </h3>

        <Filter
          filters={AnswerFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <div className="">
        {result &&
          result.answers &&
          result.answers.map((answer) => (
            <div key={answer.id} className="py-10">
              <div className="w-full">
                <div className="flex-between mb-10">
                  {answer.author && (
                    <Link
                      href={`/profile/${answer.author.userId}`}
                      className="flex flex-1 items-start gap-1 sm:items-center"
                    >
                      <Image
                        src={answer.author.picture || "/default-profile.png"}
                        alt="profile"
                        width={18}
                        height={18}
                        className="rounded-full object-cover max-sm:mt-0.5"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <p className="body-semibold text-invert-2">
                          {answer.author.name}{" "}
                        </p>
                        <p className="small-regular text-invert-3 mt-0.5 line-clamp-1">
                          <span className="max-sm:hidden">&nbsp; - </span>
                          &nbsp;Answered {answer.createdAt ? getTimeStamps(answer.createdAt) : "Unknown time"}
                        </p>
                      </div>
                    </Link>
                  )}
                  <div className="flex justify-end">
                    <Voting
                      type="Answer"
                      itemId={JSON.stringify(answer.id)}
                      userId={JSON.stringify(userId)}
                      upvotes={answer.upvotes?.length || 0}
                      hasUpvoted={answer.upvotes?.includes((userId)) || false}
                      downvotes={answer.downvotes?.length || 0}
                      hasDownvoted={answer.downvotes?.includes(userId) ?? false}
                    />
                  </div>
                </div>
              </div>
              <ParseHtml content={answer.content} />
            </div>
          ))}
      </div>
      <div className="mt-10 w-full items-center">
        <Pagination
          pageNumber={page ? +page : 1}
          isNext={result.isNextAnswer}
        />
      </div>
    </div>
  );
};

export default AllAnswers;
