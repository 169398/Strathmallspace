"use client";

import Link from "next/link";

export default function VerificationSuccessPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
     

      <h1 className="text-2xl font-bold">Verification Successful</h1>
      <p className="mt-4 text-center text-lg">
        Your email has been successfully verified. You can now log in.
      </p>
      <Link
        href="/sign-in"
        className="mt-6 text-lg font-semibold text-blue-500"
      >
        Log In
      </Link>
    </div>
  );
}
