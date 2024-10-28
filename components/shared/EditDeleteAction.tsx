'use client';

import { deleteAnswer } from '@/lib/actions/answer.action';
import { deleteQuestion } from '@/lib/actions/question.action';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Loading from './Loading';
import { useState } from 'react';

interface Props {
  type: string;
  itemId: string;
}

const EditDeleteAction = ({ type, itemId }: Props) => {
  
  const pathname = usePathname();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleEdit = () => {
    router.push(`/question/edit/${itemId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    if (type === 'Question') {
      await deleteQuestion({ questionId: itemId, path: pathname });
    } else if (type === 'Answer') {
      await deleteAnswer({ answerId: itemId, path: pathname });
    }
    setIsDeleting(false);
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-3 max-sm:w-full">
        {isDeleting && <Loading title="Deleting..." />}
        {type === 'Question' && (
          <Image
            src="/assets/icons/edit.svg"
            alt="Edit"
            width={14}
            height={14}
            className="cursor-pointer object-contain"
            onClick={handleEdit}
          />
        )}
        <Image
          src="/assets/icons/trash.svg"
          alt="delete"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          onClick={() => setShowConfirmModal(true)}
        />
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this {type.toLowerCase()}? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditDeleteAction;
