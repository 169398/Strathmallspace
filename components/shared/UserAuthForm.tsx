"use client";

import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import * as React from "react";
import { FC } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Icons } from "./Icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<boolean>(false);

  const loginWithGoogle = async () => {
    setLoading(true);

    try {
      await signIn("google");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error logging in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        type="button"
        size="sm"
        className="w-full"
        onClick={loginWithGoogle}
        disabled={loading}
        isloading={loading}
      >
        {!loading && <Icons.google className="mr-2 size-4" />}
        <span className="text-gray-950 dark:text-gray-50">Google</span>
      </Button>
    </div>
  );
};

export default UserAuthForm;
