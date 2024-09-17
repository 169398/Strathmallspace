'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-800">
      <div className="relative mx-auto w-full max-w-lg">
        <Image
          src="/not-found.svg"
          alt="Not Found"
          width={400}
          height={400}
          className="mx-auto"
        />
      </div>
      <h1 className="mt-2 text-4xl font-bold">Oops! Page not found.</h1>
      <p className="mt-2 text-center text-lg">
        Sorry, the page you&apos;re looking for doesn&apos;t exist. You may have mistyped
        the address 
      </p>
      <Button
          variant="default"
          className="ml-2 mt-4 "
          
          onClick={() => (window.location.href = "/")}
        >
      
          Take me home
      </Button>
    </div>
  );
}
