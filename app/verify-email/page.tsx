"use client";

import Image from "next/image";



export default function VerificationPage( ){

  return (
    <div className="flex  h-screen flex-col items-center justify-center bg-blue-100">
      <div className="relative mb-4 h-60 w-60 text-gray-500">
        <Image src="/emails-sent.png" fill alt=" email sent image" />
      </div>

      <h3 className="text-2xl font-semibold">Check your email</h3>
 
        <p className="text-center text-gray-500">
          We&apos;ve sent a verification link to your email.
        </p>
      
    </div>
  );
}
