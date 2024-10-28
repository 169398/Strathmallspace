import SignUp from '@/components/shared/SignUp'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'
import { Icons } from '@/components/shared/Icons'

const page: FC = () => {
  return (
    <div className="relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute left-4 top-4 md:left-8 md:top-8'
        )}
      >
        <ChevronLeft className="mr-2 size-4" />
        Back
      </Link>
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-cyan-600" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Icons.logo className="mr-2 size-6" /> StrathSpace
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Create an account and start your journey with StrathSpace today.&rdquo;
            </p>
            <footer className="text-sm">Strathmore University</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <SignUp />
        </div>
      </div>
    </div>
  )
}

export default page
