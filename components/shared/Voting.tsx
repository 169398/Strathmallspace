'use client';

import { toast } from 'sonner';
import { downvoteAnswer, upvoteAnswer } from '@/lib/actions/answer.action';
import { viewQuestion } from '@/lib/actions/interaction.action';
import {
  downvoteQuestion,
  upvoteQuestion,
} from '@/lib/actions/question.action';
import { formatNumber } from '@/lib/utils';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toggleSaveQuestion } from '@/lib/actions/user.action';

interface Params {
  type: string;
  itemId: string;
  userId: string;
  upvotes: number;
  hasUpvoted: boolean;
  downvotes: number;
  hasDownvoted: boolean;
  hasSaved?: boolean;
}

const Voting = ({
  type,
  itemId,
  userId,
  upvotes,
  hasUpvoted,
  downvotes,
  hasDownvoted,
  hasSaved,
}: Params) => {


  const [upvoted, setUpvoted] = useState(hasUpvoted);
  const [downvoted, setDownvoted] = useState(hasDownvoted);
  const [upvoteCount, setUpvoteCount] = useState(upvotes);
  const [downvoteCount, setDownvoteCount] = useState(downvotes);
  const [saved, setSaved] = useState(hasSaved);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // TODO: add Animation and immediate update of the voting image
  const handleVote = async (action: string) => {
    if (!userId) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      if (action === 'upvote') {
        if (isSubmitting) return;

        if (hasDownvoted) {
          setDownvoted(false);
          setDownvoteCount(downvoteCount - 1);
        }
        
        setUpvoted(!upvoted);
        setUpvoteCount(upvoted ? upvoteCount - 1 : upvoteCount + 1);
        
        setIsSubmitting(true);
        if (type === 'Question') {
          await upvoteQuestion({
            questionId: JSON.parse(itemId),
            userId: JSON.parse(userId),
            hasDownvoted,
            hasUpvoted,
            path: pathname,
          });
          toast.success(upvoted ? 'Upvote removed' : 'Question upvoted!');
        } else if (type === 'Answer') {
          await upvoteAnswer({
            answerId: JSON.parse(itemId),
            userId: JSON.parse(userId),
            hasDownvoted,
            hasUpvoted,
            path: pathname,
          });
          toast.success(upvoted ? 'Upvote removed' : 'Answer upvoted!');
        }
      }

      if (action === 'downvote') {
        if (isSubmitting) return;

        if (hasUpvoted) {
          setUpvoted(false);
          setUpvoteCount(upvoteCount - 1);
        }
        
        setDownvoted(!downvoted);
        setDownvoteCount(downvoted ? downvoteCount - 1 : downvoteCount + 1);

        setIsSubmitting(true);
        if (type === 'Question') {
          await downvoteQuestion({
            questionId: JSON.parse(itemId),
            userId: JSON.parse(userId),
            hasDownvoted,
            hasUpvoted,
            path: pathname,
          });
          toast.success(downvoted ? 'Downvote removed' : 'Question downvoted');
        } else if (type === 'Answer') {
          await downvoteAnswer({
            answerId: JSON.parse(itemId),
            userId: JSON.parse(userId),
            hasDownvoted,
            hasUpvoted,
            path: pathname,
          });
          toast.success(downvoted ? 'Downvote removed' : 'Answer downvoted');
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      // Revert the optimistic update
      if (action === 'upvote') {
        setUpvoted(!upvoted);
        setUpvoteCount(upvoted ? upvoteCount - 1 : upvoteCount + 1);
      } else {
        setDownvoted(!downvoted);
        setDownvoteCount(downvoted ? downvoteCount - 1 : downvoteCount + 1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('Please log in to save questions');
      return;
    }

    try {
      // Optimistic update
      setSaved((prev) => !prev);

      const response = await toggleSaveQuestion({
        userId,
        questionId: itemId,
        path: pathname,
      });

      if (!response.success) {
        // Revert optimistic update if failed
        setSaved((prev) => !prev);
        toast.error(response.message);
        return;
      }

      // Show success message
      toast.success(response.message);
    } catch (error) {
      // Revert optimistic update
      setSaved((prev) => !prev);
      toast.error('Failed to save question. Please try again.');
    }
  };

  useEffect(() => {
    viewQuestion({
      questionId: JSON.parse(itemId),
      userId: userId ? JSON.parse(userId) : undefined,
    });
  }, [itemId, userId, pathname, router]);

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-5 ">
        <div className="flex-center">
          {/* TODO: change color of border of SVG image  */}

          <Image
            src={`${upvoted ? '/assets/icons/upvoted.svg' : '/assets/icons/upvote.svg'}`}
            alt="upvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => (isSubmitting ? null : handleVote('upvote'))}
          />
          <div className="btn flex-center min-w-[18px] rounded-sm p-1 ">
            <p className="subtle-medium text-invert-secondary">
              {formatNumber(upvoteCount)}
            </p>
          </div>
        </div>

        <div className="flex-center gap-1">
          <Image
            src={`${downvoted ? '/assets/icons/downvoted.svg' : '/assets/icons/downvote.svg'}`}
            alt="downvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => (isSubmitting ? null : handleVote('downvote'))}
          />
          <div className="btn flex-center min-w-[18px] rounded-sm p-1 ">
            <p className="subtle-medium text-invert-secondary">
              {formatNumber(downvoteCount)}
            </p>
          </div>
        </div>
      </div>

      {type === 'Question' && (
        <Image
          src={`${saved ? '/assets/icons/star-filled.svg' : '/assets/icons/star-blue.svg'}`}
          alt="downvote"
          width={18}
          height={18}
          className="cursor-pointer"
          onClick={() => handleSave()}
        />
      )}
    </div>
  );
};

export default Voting;
