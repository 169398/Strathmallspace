import LeftSidebar from '@/components/shared/leftsidebar/LeftSidebar';
import Navbar from '@/components/shared/navbar/Navbar';
import RightSidebar from '@/components/shared/rightsidebar/RightSidebar';
import React from 'react';
import NextTopLoader from 'nextjs-toploader';
import Providers from '@/components/shared/Providers';
import { Toaster } from 'sonner';

const Layout = ({ children, }: { children: React.ReactNode, }) => {
  return (
    <main className="background-default_bg_primary50 relative">
      <Providers>
        <NextTopLoader
          color="#007FFF"
          height={2}
          showSpinner={false}
          easing="ease-in"
        />
        <Navbar />

        <div className="flex">
          <LeftSidebar />
          <section className="max-mb:pb-14 flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 sm:px-14 ">
            <div className="mx-auto w-full max-w-5xl">
              {" "}
              {children}
              <Toaster richColors position="top-center" />
            </div>
          </section>
          <RightSidebar />
        </div>
      </Providers>

      {/* Notifications */}
    </main>
  );
};

export default Layout;
