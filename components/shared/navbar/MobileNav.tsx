import React from "react";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import NavContent from "./NavContent";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

const MobileNav = async () => {
  const  session  = await auth();

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/assets/icons/hamburger.svg"
            width={30}
            height={30}
            alt="Menu"
            className="invert-colors ml-2 sm:hidden"
          />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="background-navbar_bg border-none backdrop-blur-lg"
        >
          <Link href="/" className="flex-center flex items-center gap-1">
            {/* <Image
              src="/assets/images/logo.svg"
              height={23}
              width={23}
              alt="StrathSpace"
            /> */}
            <p className="h2-bold text-invert font-spaceGrotesk">
              <span className="primary-text-gradient">StrathSpace</span>
            </p>
          </Link>
          <div>
            <SheetClose asChild>
              <NavContent />
            </SheetClose>

            {!session && (
              <div className="flex flex-col gap-3">
                <SheetClose asChild>
                  <Link href="/sign-in">
                    <Button className="body-medium btn-primary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                      <span className="primary-text-gradient">Log in</span>
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/sign-up">
                    <Button className="body-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3  shadow-none dark:text-gray-50">
                      Sign up
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
