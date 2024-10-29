import { Metadata } from "next";
import { ensureStartsWith } from "./utils";

const { TWITTER_CREATOR, TWITTER_SITE } = process.env;
const twitterCreator = TWITTER_CREATOR
  ? ensureStartsWith(TWITTER_CREATOR, "@")
  : undefined;
const twitterSite = TWITTER_SITE
  ? ensureStartsWith(TWITTER_SITE, "https://")
  : undefined;

export function constructMetadata({
  title = "StrathSpace - Dive into everything ",
  description = "StrathSpace is the place to find everything. From events,jobs, to resources, we've got you covered.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    ...(twitterCreator &&
      twitterSite && {
        twitter: {
          card: "summary_large_image",
          creator: twitterCreator,
          site: twitterSite,
          title,
          description,
          images: [image],
        },
      }),
    icons,
    metadataBase: new URL("https://strathspace.vercel.app"), 
    ...(noIndex && {
      robots: {
        index: false,
        follow: true,
      },
    }),
  };
}
