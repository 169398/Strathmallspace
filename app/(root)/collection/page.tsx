import { auth } from "@/lib/auth";
import QuestionCard from "@/components/cards/QuestionCard";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import Filter from "@/components/shared/filter";
import LocalSearchBar from "@/components/shared/search/LocalSearchBar";
import { QuestionFilters } from "@/constants/filters";
import { getSavedQuestions } from "@/lib/actions/user.action";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StrathSpace | collection",
  description: "Explore all questions you saved on StrathSpace.",
};

export default async function Home({ searchParams }: any) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const result = (await getSavedQuestions({
    userId,
    searchQuery: searchParams?.q,
    filter: searchParams?.filter,
    page: searchParams?.page ? +searchParams.page : 1,
  })) as { question: any[]; isNext: boolean };

  // Add console.log to check if questions are fetched correctly
  console.log(result.question);

  return (
    <main>
      <h1 className="sm:h1-bold h2-bold text-invert w-full">Saved Questions</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/collection"
          imgSrc="/assets/icons/search.svg"
          iconPosition="left"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={QuestionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result?.question && result.question.length > 0 ? (
          result.question.map((question: any) => (
            <QuestionCard
              key={question.id}
              id={question.id}
              title={question.title}
              tags={
                question.tags?.map((tag: any) => ({
                  id: tag.id,
                  name: tag.name,
                })) || []
              }
              author={{
                id: question.author.id,
                name: question.author.name,
                picture: question.author.image ?? "",
                userId: question.author.id,
              }}
              upvotes={Array.isArray(question.upvotes) ? question.upvotes : []}
              views={question.views ?? 0}
              answers={question.answersCount || 0}
              createdAt={question.createdAt ?? new Date()}
            />
          ))
        ) : (
          <NoResult
            title="You haven't saved any questions yet."
            description="You haven't saved any questions yet. Save Questions you would want to visit later 💡"
            hasButton={false}
          />
        )}
      </div>
      <div className="mt-10 w-full items-center">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </main>
  );
}
