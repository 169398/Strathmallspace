"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { useState } from "react";
import { signUp } from "@/lib/actions/user.action";
import { signUpDefaultValues } from "@/constants";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [data, action] = useFormState(signUp, {
    success: false,
    message: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        disabled={pending || !termsAccepted}
        className="w-full"
        variant="default"
      >
        {pending ? "Submitting..." : "Sign Up"}
      </Button>
    );
  };

  // Redirect to the verification page if sign up is successful
  if (data.success) {
    router.push(`/verify-email?email=${signUpDefaultValues.email}`);
  }

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            required
            type="text"
            defaultValue={signUpDefaultValues.name}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="john@example.com"
            required
            type="email"
            defaultValue={signUpDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            required
            type="password"
            defaultValue={signUpDefaultValues.password}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            required
            type="password"
            defaultValue={signUpDefaultValues.confirmPassword}
          />
        </div>
        <div className="flex items-start">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
            required
          />
          <Label htmlFor="terms" className="ml-2">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-blue-600">
              StrathSpace terms
            </Link>
          </Label>
        </div>
        <div>
          <SignUpButton />
        </div>

        {!data.success && (
          <div className="text-center text-red-600">{data.message}</div>
        )}
        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            target="_self"
            className="text-blue-600"
            href={`/sign-in?callbackUrl=${callbackUrl}`}
          >
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
}