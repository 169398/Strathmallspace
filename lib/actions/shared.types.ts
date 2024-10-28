export type UpdateUserParams = {
  userId: string;
  updateData: {
    name?: string;
    username?: string;
    portfolioWebsite?: string;
    location?: string;
    bio?: string;
  };
  path: string;
};
