import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import Theme from './Theme';
import MobileNav from './MobileNav';
import GlobalSearch from '../search/GlobalSearch';

const Navbar = () => {
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
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'h-7 w-7',
              },
              variables: {
                colorPrimary: '#007FFF',
              },
            }}
          />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
