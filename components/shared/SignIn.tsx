import Link from 'next/link'
import { Icons } from './Icons'
import UserAuthForm from './UserAuthForm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const SignIn = () => {
  return (
    <Card className="w-full max-w-md border-none bg-white/75 shadow-xl backdrop-blur-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center space-x-2">
          <Icons.logo className="size-8" />
          <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
            StrathSpace
          </CardTitle>
        </div>
        <CardDescription className="text-center">
          Welcome back! Please sign in to your account.
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
          <span className="text-muted-foreground bg-white px-2">
            New to StrathSpace?
          </span>
        </div>
      </div>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-muted-foreground text-center text-sm">
          <Link
            href="/sign-up"
            className="hover:text-primary text-primary underline-offset-4 transition-colors hover:underline"
          >
            Create an account
          </Link>
        </div>
        <p className="text-muted-foreground px-8 text-center text-xs">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="hover:text-primary underline underline-offset-4">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:text-primary underline underline-offset-4">
            Privacy Policy
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default SignIn
