import { getTopInteractedTags } from '@/lib/actions/tag.actions';
import Image from 'next/image';
import Link from 'next/link';
import RenderTags from '../shared/RenderTags';
import { Badge } from '../ui/badge';
import { auth } from '@/lib/auth';
import MessageButton from '../shared/MessageButton';

interface UserProps {
  user: {
    id: string;
    userId: string;
    picture: string;
    name: string;
    username: string;
  };
}

const UserCard = async ({ user }: UserProps) => {
  const session = await auth();
  const interactedTags = await getTopInteractedTags({
    userId: user.userId,
    limit: 2,
  });

  return (
    <div className="max-xs:min-w-full xs:w-[260px] w-full rounded-2xl shadow-md">
      <div className="card-wrapper flex w-full flex-col items-center justify-center rounded-2xl p-8">
        <Link href={`/profile/${user.userId}`} >
          <Image
            src={user.picture}
            alt={user.name}
            width={100}
            height={100}
            className="rounded-full"
          />
        </Link>
        <div className="mt-4 flex flex-col items-center gap-3">
          <Link href={`/profile/${user.userId}`}>
            <div className="text-center">
              <h3 className="h3-bold text-invert line-clamp-1">{user.name}</h3>
              <p className="body-regular text-invert-3 mt-2">@{user.username}</p>
            </div>
          </Link>
          
          <MessageButton 
            currentUserId={session?.user?.id}
            recipientId={user.userId}
            icon="commentReply"
            label="Message"
          />
        </div>

        <div className="mt-5">
          {interactedTags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {interactedTags.map((tag) => (
                <RenderTags key={tag.id} id={tag.id} name={tag.name} totalQuestions={tag.interactionCount} />
              ))}
            </div>
          ) : (
            <Badge className="primary-text-gradient paragraph-medium border-none">
              No tags yet
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
