
import Link from 'next/link'
import { Icons } from './Icons'
import UserAuthForm from './UserAuthForm'

const SignUp = () => {
  return (
    <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
      <div className='flex flex-col space-y-2 text-center'>
        <Icons.logo className='mx-auto size-6' />
        <h1 className='text-2xl font-semibold tracking-tight'>Sign Up</h1>
        <p className='mx-auto max-w-xs text-sm'>
          By continuing, you are setting up a STRATH EVENTS account and agree to our
          User Agreement and Privacy Policy.
        </p>
      </div>
      <UserAuthForm />
      <p className='px-8 text-center text-sm text-gray-500'>
        Already a user?{' '}
        <Link
          href='/sign-in'
          className='text-sm underline underline-offset-4 hover:text-blue-500'>
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default SignUp
