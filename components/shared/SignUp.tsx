import Link from 'next/link'
import { Icons } from './Icons'
import UserAuthForm from './UserAuthForm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const SignUp = () => {
  return (
    <Card className="dark:bg-primaryDark-800 w-full max-w-md border-none bg-white/75 shadow-xl backdrop-blur-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center space-x-2">
          <Icons.logo className="size-8" />
          <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
            StrathSpace
          </CardTitle>
        </div>
        <CardDescription className="text-center text-gray-800 dark:text-gray-200">
          Create an account to get started with StrathSpace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserAuthForm />
      </CardContent>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="dark:bg-primaryDark-800 bg-white px-2 text-slate-950 dark:text-white">
            Already have an account?
          </span>
        </div>
      </div>
      <CardFooter className="flex flex-col space-y-4">
        <div className=" text-center text-sm text-slate-950 dark:text-white ">
          <Link
            href="/sign-in"
            className="text-blue-600 underline-offset-4 transition-colors hover:text-blue-600 hover:underline"
          >
            Sign in to your account
          </Link>
        </div>
        <p className="px-8 text-center text-xs text-slate-950 dark:text-white">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-blue-500 dark:text-white"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-blue-500 dark:text-white"
          >
            Privacy Policy
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default SignUp
