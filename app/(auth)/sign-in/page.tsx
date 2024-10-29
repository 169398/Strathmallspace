import SignIn from '@/components/shared/SignIn'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'

const page: FC = () => {
  return (
    <div className='dark:bg-primaryDark-900 absolute inset-0 bg-gray-50'>
      <div className='mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-20'>
        <Link
          href='/'
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'self-start -mt-20 text-gray-800 dark:text-gray-200'
          )}>
          <ChevronLeft className='mr-2 size-4' />
          Home
        </Link>

        <SignIn />
      </div>
    </div>
  )
}

export default page
