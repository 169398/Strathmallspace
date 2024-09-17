import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import qs from 'query-string';
import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getTimeStamps = (createdAt: Date): string => {
  const currentDate = new Date();
  const elapsedTime = currentDate.getTime() - createdAt.getTime();

  if (elapsedTime < 60000) {
    return 'Just Now';
  }

  const seconds = Math.floor(elapsedTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
};

export const formatNumber = (num: number, options?: { suffixes?: string[], separator?: string }): string => {
  if (isNaN(num)) return '0'; // Return '0' if num is Na

  if(num <= 0 ) return '0';

  const defaultSuffixes = ['', 'K', 'M', 'B', 'T', 'Q']; 
  
  const { suffixes = defaultSuffixes, separator = '' } = options || {};

  const tier = Math.floor(Math.log10(num) / 3);
  if (tier === 0) return num.toString();

  const suffix = suffixes[Math.min(tier, suffixes.length - 1)];
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;

  const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  const formatted = formatter.format(scaled);

  return formatted.replace(/\.(\d*?)0+$/, '.$1') + separator + suffix;
}

export const getJoinedMonthYear = (date: Date): string => {
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `Joined ${month} ${year}`;
};


interface UrlQueryParams {
  params: string; 
  key: string;
  value: string | null;
}
export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {

  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl({
    url: window.location.pathname,
    query: currentUrl,
  }, {skipNull: true});
}

interface RemoveKeysFromQueryParams {
  params: string;
  keys: string[];
}

export const removeKeysFromQuery = ({ params, keys }: RemoveKeysFromQueryParams) => {
  const currentUrl = qs.parse(params);
 keys.forEach((key) => {
  delete currentUrl[key];
 })

  return qs.stringifyUrl({
    url: window.location.pathname,
    query: currentUrl,
  }, {skipNull: true});
}


interface BadgeParams {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}
export const assignBadges = (params: BadgeParams) => {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  }
  const { criteria } = params; 
  criteria.forEach((item) => {
    const { type, count} = item;
    const BadgeLevels: any = BADGE_CRITERIA[type];

    Object.keys(BadgeLevels).forEach((level: any) => {
      if(count >= BadgeLevels[level]){
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    })
  })

  return badgeCounts;
}

export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "KSH",
  style: "currency",
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}
export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;
export const formatError = (error: any): string => {
  if (error.name === "ZodError") {
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const errorMessage = error.errors[field].message;
      return `${error.errors[field].path}: ${errorMessage}`; // field: errorMessage
    });
    return fieldErrors.join(". ");
  } else if (error.name === "ValidationError") {
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const errorMessage = error.errors[field].message;
      return errorMessage;
    });
    return fieldErrors.join(". ");
  } else {
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
};



export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : int; // 12.1 => 12.10
};

export const round2 = (value: number | string) => {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100; // avoid rounding errors
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("value is not a number nor a string");
  }
};
