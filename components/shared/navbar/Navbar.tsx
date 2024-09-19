import Link from "next/link";
import React from "react";
import Theme from "./Theme";
import MobileNav from "./MobileNav";
import GlobalSearch from "../search/GlobalSearch";
import { auth } from "@/lib/auth";
import { UserAccountNav } from "../UserAccountNav";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="flex-between background-background_paper fixed z-50 w-full gap-5 border-b-2 border-gray-300 p-3 shadow-md backdrop-blur-lg sm:px-12 dark:border-none dark:shadow-none">
      <Link href="/" className="flex items-center gap-1">
        <p className="h2-bold font-sans text-gray-800 max-sm:hidden dark:text-white">
          <span className="primary-text-gradient">StrathSpace</span>
        </p>
      </Link>

      <GlobalSearch />
      <div className="flex-between gap-1">
        <Theme />

        {session ? (
          <div className="flex items-center gap-2">
            <UserAccountNav user={session.user!} />
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
