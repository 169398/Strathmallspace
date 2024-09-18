import { getTopInteractedTags } from '@/lib/actions/tag.actions';
import Image from 'next/image';
import Link from 'next/link';
import RenderTags from '../shared/RenderTags';
import { Badge } from '../ui/badge';

interface UserProps {
  user: {
    _id: string;
    userId: string;
    picture: string;
    name: string;
    username: string;
  };
}

const UserCard = async ({ user }: UserProps) => {
  const interactedTags = await getTopInteractedTags({
    userId: user._id,
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
        <Link href={`/profile/${user.userId}`}>
          <div className="mt-4 text-center">
            <h3 className="h3-bold text-invert line-clamp-1">{user.name}</h3>
            <p className=" body-regular text-invert-3 mt-2">@{user.username}</p>
          </div>
        </Link>

        <div className="mt-5">
          {interactedTags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {interactedTags.map((tag) => (
                <RenderTags key={tag.id} _id={tag.id.toString()} name={tag.name} />
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
