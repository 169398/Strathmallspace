'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { Button } from '../ui/button'

interface CloseModalProps {}

const CloseModal: FC<CloseModalProps> = () => {
  const router = useRouter()

  return (
    <Button variant='ghost' className='size-6 rounded-md p-0' onClick={() => router.back()}>
      <X aria-label='close modal' className='size-4' />
    </Button>
  )
}

export default CloseModal
