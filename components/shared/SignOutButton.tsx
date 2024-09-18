'use client'; // Mark this as a client component

import { signOut } from "next-auth/react";

export const SignOutButton = ({ redirectTo }: { redirectTo: string }) => {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: redirectTo });
  };

  return (
    <button onClick={handleSignOut} className="text-sm text-blue-600 dark:text-blue-400">
      Sign out
    </button>
  );
};
