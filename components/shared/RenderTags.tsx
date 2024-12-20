import Link from 'next/link';
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface props {
  id: string;
  name: string;
  totalQuestions?: number;
  showCount?: boolean;
}

const RenderTags = ({ id, name, totalQuestions, showCount }: props) => {
  return (
    <Link href={`/tags/${id}`} className="flex-between gap-2">
      <Badge
        variant="outline"
        className="subtle-medium tag-bg rounded-md px-4 py-2 uppercase"
      >
        {name}
      </Badge>
      {showCount && (
        <p className="small-medium text-invert">{totalQuestions}</p>
      )}
    </Link>
  );
};

export default RenderTags;
