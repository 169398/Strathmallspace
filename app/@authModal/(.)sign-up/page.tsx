
import CloseModal from '@/components/shared/CloseModal'
import SignUp from '@/components/shared/SignUp'
import { FC } from 'react'

interface pageProps {}

const page: FC<pageProps> = () => {
  return (
    <div className="dark:bg-primaryDark-900 fixed inset-0 z-10 flex items-center justify-center bg-gray-50">
      <div className="dark:bg-primaryDark-800 relative w-full max-w-md rounded-lg bg-white px-2 py-20 shadow-xl">
        <div className="absolute right-4 top-4">
          <CloseModal />
        </div>

        <SignUp />
      </div>
    </div>
  );
}

export default page
