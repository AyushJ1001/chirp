import { api, type RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const { user } = useUser();
  const utils = api.useContext();

  const mutation = api.posts.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted!");
      void utils.posts.getAll.invalidate();
    },
  });

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            {" "}
            <span className="font-thin">
              {" "}
              • {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <div className="flex space-x-20">
          <div className="flex flex-col">
            <span className="text-2xl">{post.content}</span>
          </div>
          {user?.id === author.id && (
            <button
              className="text-red-500"
              onClick={() => {
                console.log(
                  `Deleting the post with emojis: ${post.content}...`
                );
                mutation.mutate({ id: post.id });
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
