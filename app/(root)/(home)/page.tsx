import {
  getQuestions,
  getRecommendedQuestions,
} from "../../../lib/actions/question.action";
import Link from "next/link";
import Pagination from "../../../components/shared/Pagination";
import type { Metadata } from "next";
import { auth } from "../../../lib/auth";
import { Button } from "../../../components/ui/button";
import LocalSearchBar from "../../../components/shared/search/LocalSearchBar";
import Filter from "../../../components/shared/filter";
import { HomePageFilters } from "../../../constants/filters";
import HomeFilters from "../../../components/Home/HomeFilters";
import QuestionCard from "../../../components/cards/QuestionCard";
import NoResult from "../../../components/shared/NoResult";

export const metadata: Metadata = {
  title: "StrathSpace | Home",
  description:
    "Explore all questions on StrathSpace. Ask a question and get answers from the community.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: {
    f?: string;
    q?: string;
    page?: string;
  };
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page ? +resolvedSearchParams.page : 1;
  const filter = resolvedSearchParams?.f;
  const query = resolvedSearchParams?.q;

  let result: any;

  if (filter === "recommended") {
    if (userId) {
      result = await getRecommendedQuestions({
        userId,
        searchQuery: query,
        page,
      });
    } else {
      result = {
        question: [],
        isNext: false,
      };
    }
  } else {
    result = await getQuestions({
      searchQuery: query,
      filter,
      page,
    });
  }

  return (
    <main>
      {session?.user?.name && (
        <div className="mb-8">
          <h2 className="h3-bold text-invert">
            👋 Welcome back, {session.user.name}
          </h2>
          <p className="text-invert-secondary mt-2">
            Find answers to your technical questions and help others answer
            theirs.
          </p>
        </div>
      )}

      <div className="flex-between gap-4">
        <h1 className="sm:h1-bold h2-bold text-invert w-full">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient !text-grey-100 max-h-[40px] px-4 sm:min-h-[46px] sm:px-4 sm:py-3">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/"
          imgSrc="/assets/icons/search.svg"
          iconPosition="left"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      <HomeFilters />

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.question?.length > 0 ? (
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
            title="There's no Question to show"
            description={`${
              resolvedSearchParams.f === "recommended"
                ? "Please interact with others questions to get recommended questions tailored to you 😉"
                : "Be the first to break the silence 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved"
            }`}
            hasButton={resolvedSearchParams.f !== "recommended"}
            btnText="Ask a Question"
            btnLink="/ask-question"
          />
        )}
      </div>
      <div className="mt-10 w-full items-center">
        <Pagination pageNumber={page} isNext={result.isNext} />
      </div>
    </main>
  );
}
