'use client'
import { useSearchParams } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import Link from 'next/link'
import { signInWithCredentials } from '@/lib/actions/user.action'
import { signInDefaultValues } from '@/constants'

export default function CredentialsSignInForm() {
  const [data, action] = useFormState(signInWithCredentials, {
    message: '',
    success: false,
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const SignInButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button disabled={pending} className="w-full" variant="default">
        {pending ? 'Submitting...' : 'Sign In with credentials'}
      </Button>
    )
  }

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="m@example.com"
            required
            type="email"
            defaultValue={signInDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            required
            type="password"
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <div>
          <SignInButton />
        </div>

        {data && !data.success && (
          <div className="text-center text-red-500">{data.message}</div>
        )}
        {!data && (
          <div className="text-center text-red-500">
            Unknown error happened.{' '}
            <Button onClick={() => window.location.reload()}>
              Please reload
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            target="_self"
            className="text-blue-500 underline"
            href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          >
            Sign Up
          </Link>
        </div>
        <div className="text-center text-sm text-gray-500">
  <Link href="/request-reset" className="text-blue-500 underline">Forgot Password?</Link>
</div>

      </div>
    </form>
  )
}
