import { getUserQuestions } from "@/lib/actions/user.action";
import QuestionCard from "../cards/QuestionCard";
import NoResult from "./NoResult";
import Pagination from "./Pagination";

interface Props {
  searchParams: any;
  userId: string;
  userSessionId?: string|null;
}
const QuestionTab = async ({ searchParams, userId,  }: Props) => {
  const result = await getUserQuestions({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <div className="mt-10 flex w-full flex-col gap-6">
      {result.questions.length > 0 ? (
        result.questions.map((question) => (
          <QuestionCard
            key={question.id}
            id={question.id}
            title={question.title}
            tags={question.tags.map(tag => ({ id: tag.tagId, name: tag.tagId }))}
            author={{
              id: question.author.id,
              name: question.author.name,
              picture: question.author.image?? "",
              userId: question.author.id,
            }}
            upvotes={Array.isArray(question.upvotes) ? question.upvotes.map(upvote => ({ id: upvote.toString() })) : []}
            views={question.views ?? 0}
            answers={question.answers ?? []}
            createdAt={question.createdAt ?? new Date()}
          />
        ))
      ) : (
        <NoResult
          title="You didn&apos;t ask any questions yet."
          description="You haven&apos;t asked any questions yet. Ask a Question and kickstart the discussion. Your query could be the next big thing others learn from. Get involved! 💡"
          hasButton={true}
          btnText="Ask a Question"
          btnLink="/ask-question"
        />
      )}

      <div className="mt-10 w-full items-center">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNextQuestions}
        />
      </div>
    </div>
  );
};

export default QuestionTab;
