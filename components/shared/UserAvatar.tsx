import { AvatarProps } from '@radix-ui/react-avatar'

import Image from 'next/image'
import { Icons } from './Icons'
import { User } from '@/db/schema'
import { Avatar, AvatarFallback } from '../ui/avatar'

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, 'image' | 'name'>
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className='relative aspect-square size-full'>
          <Image
            fill
            src={user.image}
            alt='profile picture'
            referrerPolicy='no-referrer'
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className='sr-only'>{user?.name}</span>
          <Icons.user className='size-4' />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
