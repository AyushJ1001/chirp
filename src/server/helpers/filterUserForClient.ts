import { type User } from "@clerk/nextjs/api";

export const filterUseForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};
