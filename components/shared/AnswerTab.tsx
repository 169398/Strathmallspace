import { getUserAnswers } from "@/lib/actions/user.action";
import AnswerCard from "../cards/AnswerCard";
import NoResult from "./NoResult";
import Pagination from "./Pagination";

interface Props {
  searchParams: any;
  userId: string;
  userSessionId?: string|null;
}

const AnswerTab = async ({ searchParams, userId }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <div className="mt-10 flex w-full flex-col gap-6">
      {result.totalAnswers > 0 ? (
        result.answers.map((item) => (
          <AnswerCard
            key={item.id}
            id={item.id.toString()}
            question={{
              id: item.question?.id?.toString() ?? '0',
              title: item.question?.title ?? 'No title available',
              tags: item.question?.tags ?? [] // Add tags from the question
            }} 
            author={{
              id: item.author?.id?.toString() ?? '0',
              name: item.author?.name ?? '',
              picture: item.author?.picture ?? ''
            }} 
            upvotes={item.upvotes?.length ?? 0}
            createdAt={item.createdAt ?? new Date()}
          />
        ))
      ) : (
        <NoResult
          title="You didn't answer any questions yet."
          description="You haven't answered any questions yet. Answer a Question and kickstart the discussion. Your answer could be the next big thing others learn from. Get involved! 💡"
          hasButton={true}
          btnText="Answer a Question"
          btnLink="/"
        />
      )}
      <div className="mt-10 w-full items-center">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNextAnswer}
        />
      </div>
    </div>
  );
};

export default AnswerTab;
