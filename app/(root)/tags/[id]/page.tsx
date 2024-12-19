import QuestionCard from '@/components/cards/QuestionCard';
import Pagination from '@/components/shared/Pagination';
import LocalSearchBar from '@/components/shared/search/LocalSearchBar';

import { getQuestionByTagId } from '@/lib/actions/tag.actions';
import Image from 'next/image';
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "StrathSpace | Tags",
  description: "Questions associated with a tag.",
};



const Page = async (props: any) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const result = await getQuestionByTagId({
    tagId: params.id,
    searchQuery: searchParams.q,
    page: searchParams?.page ? +searchParams.page : 1,
  });

  return (
    <main>
      <h1 className="sm:h1-bold h2-bold text-invert w-full ">
        Questions associated with:{" "}
        <span className="capitalize">{result.tagTitle}</span>
      </h1>

      <div className="mt-11 w-full">
        <LocalSearchBar
          route={`/tags/${params.id}`}
          imgSrc="/assets/icons/search.svg"
          iconPosition="left"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question: any) => (
            <QuestionCard
              key={question.id}
              id={question.id}
              title={question.title}
              tags={Array.isArray(question.tags) ? question.tags.map((tag: { tagId: string } | string) => ({
                id: typeof tag === "string" ? tag : tag.tagId,
                name: typeof tag === "string" ? tag : tag.tagId,
              })) : []}
              author={{
                id: question.author.id,
                name: question.author.name,
                picture: question.author.image ?? "",
                userId: question.author.id,
              }}
              upvotes={Array.isArray(question.upvotes) ? question.upvotes : []}
              views={question.views ?? 0}
              answers={question.answersCount || question.answers?.length || 0}
              createdAt={question.createdAt ?? new Date()}
            />
          ))
        ) : (
          <div className=" flex-center my-10 w-full flex-col">
            <Image
              src="/assets/images/no-questions.svg"
              alt="no Question"
              width={270}
              height={200}
              className="hidden dark:flex"
            />
            <Image
              src="/assets/images/light-no-questions.svg"
              alt="no Question"
              width={270}
              height={200}
              className="dark:hidden"
            />
            <h2
              className="h2-bold
          text-invert mt-8"
            >
              There&apos;s no Tags to show
            </h2>
            <p className="body-regular text-invert-secondary mt-3.5 max-w-md text-center">
              Be the first to break the silence! 🚀 Ask a Question and kickstart
              the discussion. our query could be the next big thing others learn
              from. Get involved! 💡
            </p>
          </div>
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
};

export default Page;
