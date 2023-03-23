import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient, User } from "@clerk/nextjs/api";
import { TRPCError } from "@trpc/server";

const filterUseForClient = (user: User) => {
  return {id: user.id, username: user.username, profileImageUrl: user.profileImageUrl}
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100
    })).map(filterUseForClient)

    console.log(users)

    return posts.map(post => {
      const author = users.find(user => user.id === post.authorId)

      if (!author || !author.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Author not found"})

      return {
      post,
      author: {
        ...author,
        username: author.username
      }
    }})
  }),
});
