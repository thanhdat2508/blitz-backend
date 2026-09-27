import { Post, POST_STATUS, PostTag } from "@prisma/client";

export { POST_STATUS };

export type PostAuthorSummary = {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export type TagSummary = {
  id: string;
  name: string;
  slug: string;
  postsCount?: number;
};

export type PostWithRelations = Post & {
  url: string;
  readingTime: number;
  author: PostAuthorSummary;
  tags?: TagSummary[];
};

export type RelatedPostItem = Omit<
  PostWithRelations,
  "content" | "cancelArchiveToken"
>;

export type PaginatedPostsResult = {
  items: PostWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ArchivePostResult = {
  message: string;
  post: PostWithRelations;
  changed: boolean;
};

export type PostFilterOptions = {
  authorId?: string;
  status?: POST_STATUS;
  search?: string;
  tag?: string;
  includeArchived?: boolean;
};

export type CreatePostInput = {
  title: string;
  content: string;
  status?: POST_STATUS;
  tags?: string[];
  coverImageUrl?: string | null;
  blurHash?: string | null;
};

export type UpdatePostInput = {
  title?: string;
  content?: string;
  status?: POST_STATUS;
  tags?: string[];
  coverImageUrl?: string | null;
  blurHash?: string | null;
};

export type QueryPostOptions = {
  page?: number;
  limit?: number;
  status?: POST_STATUS;
  search?: string;
  tag?: string;
  authorId?: string;
};
