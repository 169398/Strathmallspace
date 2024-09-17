import Link from "next/link";
import React from "react";
import Theme from "./Theme";
import MobileNav from "./MobileNav";
import GlobalSearch from "../search/GlobalSearch";
import Image from "next/image";
import { auth } from "@/auth";
import { SignOut } from "@/lib/actions/user.action";



const Navbar = async () => {
  const   session  = await auth();

  return (
    <nav className="flex-between background-background_paper fixed z-50 w-full gap-5 border-b-2 border-divider p-3 shadow-light-300 backdrop-blur-lg dark:border-none dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <p className="h2-bold font-spaceGrotesk text-gray-800 dark:text-white max-sm:hidden">
          <span className="primary-text-gradient">StrathSpace</span>
        </p>
      </Link>
      <GlobalSearch />
      <div className="flex-between gap-1">
        <Theme />

        {session ? (
          <div className="flex items-center gap-2">
            <Image
              src={session.user?.image || "/default-avatar.png"}
              alt="User Avatar"
              width={28}
              height={28}
              className="rounded-full"
            />
            <button
              onClick={() => SignOut({ redirectTo: "/" })}
              className="text-sm text-blue-600 dark:text-blue-400"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/sign-in">
            <button className="text-sm text-blue-600 dark:text-blue-400">
              Sign in
            </button>
          </Link>
        )}

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
