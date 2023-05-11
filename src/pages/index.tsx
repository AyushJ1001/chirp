import { type NextPage } from "next";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { z } from "zod";
import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// validation schema is used by server
export const validationSchema = z.object({
  content: z.string().emoji("Only emojis are allowed!").min(1).max(200),
});

function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  }
) {
  return useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });
}

const CreatePostWizard = () => {
  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
      }
      // toast.error("Failed to post! Please try again later.");
    },
  });

  const methods = useZodForm({
    schema: validationSchema,
    defaultValues: {
      content: "",
    },
  });

  if (!user) return null;

  const input = methods.watch("content");

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <form
        onSubmit={methods.handleSubmit(async (values) => {
          await mutate(values);
          methods.reset();
        })}
        className="flex flex-1"
      >
        <input
          type="text"
          placeholder="Type some emojis!"
          className=" grow bg-transparent outline-none"
          {...methods.register("content")}
          disabled={isPosting}
        />
        {input !== "" && !isPosting && <button type="submit">Post</button>}

        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}
      </form>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4">
        {" "}
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {!!isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
      {!!isSignedIn && (
        <div className="flex justify-center border-t border-slate-400 p-4">
          <SignOutButton />
        </div>
      )}
    </PageLayout>
  );
};

export default Home;
