import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'



import CredentialsSignInForm from './credentials-signin-form'
import { auth } from '@/auth'
import GoogleSignInForm from './google-signin-form'
import { APP_NAME } from '@/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: `Sign In - ${APP_NAME}`,
}

export default async function SignIn({
  searchParams: { callbackUrl },
}: {
  searchParams: {
    callbackUrl: string
  }
}) {
  const session = await auth()
  if (session) {
    return redirect(callbackUrl || '/onboard')
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/assets/icons/logo.png"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
            />
          </Link>
          <CardTitle className="text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
             Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <GoogleSignInForm /> 
           {/* <EmailSigninForm />  */}
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  )
}