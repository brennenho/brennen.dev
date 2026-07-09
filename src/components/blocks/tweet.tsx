import { cn } from "@/lib/utils";
import { Tweet as EmbeddedTweet } from "react-tweet";

type TweetProps = {
  className?: string;
  id?: string;
  url?: string;
};

function getTweetId({ id, url }: Pick<TweetProps, "id" | "url">) {
  if (id) return id;

  return url?.match(/\/status(?:es)?\/(?<id>\d+)/)?.groups?.id;
}

export function Tweet({ className, id, url }: TweetProps) {
  const tweetId = getTweetId({ id, url });

  if (!tweetId) return null;

  return (
    <figure className={cn("my-3 flex justify-center", className)}>
      <div className="w-full max-w-[440px]">
        <EmbeddedTweet id={tweetId} />
      </div>
    </figure>
  );
}
