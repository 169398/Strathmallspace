import { getUserQuestions } from '@/lib/actions/user.action';
import QuestionCard from '../cards/QuestionCard';
import NoResult from './NoResult';
import Pagination from './Pagination';

interface Props {
  searchParams: any;
  userId: string;
  clerkId?: string | null;
}
const QuestionTab = async ({ searchParams, userId, clerkId }: Props) => {
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
            id={question.id.toString()}
            clerkId={clerkId}
            title={question.title}
            tags={question.tags?.map(tag => ({ id: tag.toString(), name: `Tag ${tag}` })) ?? []}
            author={
              question.author
                ? {
                    ...question.author,
                    id: question.author.id.toString(),
                  }
                : {
                    id: "",
                    name: "Unknown",
                    picture: "",
                    clerkId: "",
                  }
            } 
            upvotes={question.upvotes?.map(upvote => ({ id: upvote.toString() })) ?? []}
            views={question.views ?? 0}
            answers={question.answers?.map(answer => ({ id: answer.toString() })) ?? []}
            createdAt={question.createdAt ?? new Date()}
          />
        ))
      ) : (
        <NoResult
          title="You didn’t ask any questions yet."
          description="You haven’t asked any questions yet. Ask a Question and kickstart the discussion. Your query could be the next big thing others learn from. Get involved! 💡"
          hasButton={true}
          btnText="Ask a Question"
          btnLink="/ask-question"
        />
      )}

      <div className="mt-10 w-full items-center">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNextQuestions} // Ensure isNextQuestions is passed
        />
      </div>
    </div>
  );
};

export default QuestionTab;
