import AnswerTab from "@/components/shared/AnswerTab";
import ProfileLink from "@/components/shared/ProfileLink";
import QuestionTab from "@/components/shared/QuestionTab";
import States from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserInfo } from "@/lib/actions/user.action";
import { getJoinedMonthYear } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "StrathSpace | Profile",
  description: "View user profile.",
};

const Profile = async ({ params, searchParams }: any) => {
  const userInfo = await getUserInfo({ userId: params.id });

  // Get session from NextAuth
  const session = await auth();
  const userSessionId = session?.user?.id;

  return (
    <>
      <div className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <Image
            src={userInfo?.user.image ?? ""}
            alt={userInfo?.user.username}
            width={140}
            height={140}
            className="primary-gradient rounded-full border-4 border-transparent object-cover"
          />
          <div className="mt-3">
            <h2 className="h2-bold text-invert ">{userInfo.user.name}</h2>
            <p className="paragraph-regular text-invert-3 ">
              @{userInfo.user.username}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-start gap-4">
              {userInfo.user.portfolioWebsite && (
                <ProfileLink
                  imgUrl="/assets/icons/link.svg"
                  title="Portfolio"
                  href={userInfo.user.portfolioWebsite}
                />
              )}
              {userInfo.user.location && (
                <ProfileLink
                  imgUrl="/assets/icons/location.svg"
                  title={userInfo.user.location}
                />
              )}
              <ProfileLink
                imgUrl="/assets/icons/calendar.svg"
                title={
                  userInfo.user.joinedAt
                    ? getJoinedMonthYear(userInfo.user.joinedAt)
                    : "Date not available"
                }
              />
            </div>
            {userInfo.user.bio && (
              <p className="paragraph-regular text-invert-secondary mt-8 ">
                {userInfo.user.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {userSessionId === userInfo.user.id && (
            <Link href="/profile/edit">
              <Button className="btn paragraph-medium text-invert-secondary min-h-[46px] min-w-[175px] px-4 py-3">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <States
        reputation={userInfo.reputation ?? 0}
        totalQuestions={userInfo.totalQuestions}
        totalAnswers={userInfo.totalAnswers}
        badges={userInfo.badgeCounts}
      />
      <div className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-1">
          <TabsList className="min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab rounded-sm">
              Top Questions
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab rounded-sm">
              Top Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="top-posts">
            <QuestionTab
              searchParams={searchParams}
              userId={userInfo.user.id.toString()}
              userSessionId={userSessionId}
            />
          </TabsContent>
          <TabsContent value="answers">
            <AnswerTab
              searchParams={searchParams}
              userId={userInfo.user.id.toString()}
              userSessionId={userSessionId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Profile;
