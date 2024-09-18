'use client';

import { HomePageFilters } from '@/constants/filters';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useParams, useRouter } from 'next/navigation';
import { formUrlQuery } from '@/lib/utils';

const HomeFilters = () => {
  const searchParams = useParams();
  const router = useRouter();

  const [active, setActive] = useState('');

  const handleTypeClick = (item: string) => {
    if (active === item) {
      setActive('');
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'f',
        value: null,
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(item);
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'f',
        value: item.toLowerCase(),
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((filter) => (
        <Button
          key={filter.value}
          className={`body-medium rounded px-6 py-3 capitalize shadow-none duration-300 ${
            active === filter.value
              ? 'border-primary-300 bg-primary-100 text-primary-500 hover:bg-primary-200   hover:text-primary-600 dark:bg-primary-400 dark:hover:bg-primary-300 border border-dashed dark:border-none dark:text-white dark:hover:text-gray-200'
              : 'bg-grey-100 hover:bg-primaryDark-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => handleTypeClick(filter.value)}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
