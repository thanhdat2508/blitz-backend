import prisma from "../config/database";
import { Prisma, POST_STATUS } from "@prisma/client";
import { generateSlug, generateUniqueSlug } from "../utils/slug";
import { calculateReadingTime } from "../utils/reading-time";
import {
  ArchivePostResult,
  CreatePostInput,
  PaginatedPostsResult,
  PostWithRelations,
  QueryPostOptions,
  RelatedPostItem,
  UpdatePostInput,
} from "../types/post.types";

export class PostService {
  private static getFrontendUrl(): string {
    const raw = process.env.FRONTEND_URL || "http://localhost:3000";
    return raw.replace(/\/+$/, "");
  }

  private static postInclude = {
    author: {
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
    },
    tags: {
      select: {
        id: true,
        name: true,
        slug: true,
        postsCount: true,
      },
    },
  } as const;

  private static mapPostResult(post: any): PostWithRelations {
    return {
      ...post,
      url: `${this.getFrontendUrl()}/posts/${post.slug}`,
      readingTime: calculateReadingTime(post.content),
      cancelArchiveToken: null,
    };
  }

  private static mapRelatedPost(post: any): RelatedPostItem {
    const { content, cancelArchiveToken, ...rest } = post;
    return {
      ...rest,
      url: `${this.getFrontendUrl()}/posts/${post.slug}`,
      readingTime: calculateReadingTime(content),
    };
  }

  private static normalizeTags(tags?: string[]): string[] {
    if (!tags || !Array.isArray(tags)) return [];
    return Array.from(
      new Set(
        tags
          .filter((t) => typeof t === "string")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      )
    );
  }

  // ==========================================
  // 1. CREATE POST
  // ==========================================
  static async createPost(
    userId: string,
    data: CreatePostInput
  ): Promise<PostWithRelations> {
    if (!data.title || data.title.trim().length < 3) {
      throw { status: 400, message: "Title must be at least 3 characters long" };
    }
    if (!data.content || data.content.trim().length === 0) {
      throw { status: 400, message: "Content is required" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw { status: 404, message: "Author not found" };
    }

    const uniqueSlug = await generateUniqueSlug(data.title, async (candidate) => {
      const existing = await prisma.post.findUnique({ where: { slug: candidate } });
      return !!existing;
    });

    const uniqueTags = this.normalizeTags(data.tags);

    const post = await prisma.$transaction(async (tx) => {
      // Upsert tags and increment postsCount
      const tagRecords = await Promise.all(
        uniqueTags.map(async (tagName) => {
          const tagSlug = generateSlug(tagName) || tagName.toLowerCase();
          return tx.postTag.upsert({
            where: { slug: tagSlug },
            update: { postsCount: { increment: 1 } },
            create: { name: tagName, slug: tagSlug, postsCount: 1 },
          });
        })
      );

      return tx.post.create({
        data: {
          title: data.title.trim(),
          slug: uniqueSlug,
          content: data.content,
          status: data.status || POST_STATUS.DRAFT,
          coverImageUrl: data.coverImageUrl || null,
          blurHash: data.blurHash || null,
          isEdited: false,
          isArchived: false,
          authorId: userId,
          tags: {
            connect: tagRecords.map((t) => ({ id: t.id })),
          },
        },
        include: this.postInclude,
      });
    });

    return this.mapPostResult(post);
  }

  // ==========================================
  // 2. QUERY POSTS (PUBLIC & PAGINATED)
  // ==========================================
  static async getPosts(
    options: QueryPostOptions = {}
  ): Promise<PaginatedPostsResult> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      isArchived: false,
      status: options.status || POST_STATUS.PUBLISHED,
    };

    if (options.authorId) {
      where.authorId = options.authorId;
    }

    if (options.tag) {
      const tagKeyword = options.tag.toLowerCase().trim();
      const tagSlug = generateSlug(tagKeyword);
      where.tags = {
        some: {
          OR: [
            { slug: tagSlug },
            { name: { equals: tagKeyword, mode: "insensitive" } },
          ],
        },
      };
    }

    if (options.search) {
      const keyword = options.search.trim();
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: this.postInclude,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((item) => this.mapPostResult(item)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // ==========================================
  // 3. GET CURRENT USER'S POSTS
  // ==========================================
  static async getMyPosts(
    userId: string,
    options: QueryPostOptions = {}
  ): Promise<PaginatedPostsResult> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      authorId: userId,
    };

    if (options.status) {
      where.status = options.status;
      if (options.status === POST_STATUS.ARCHIVED) {
        where.isArchived = true;
      }
    } else {
      where.isArchived = false;
    }

    if (options.search) {
      const keyword = options.search.trim();
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: this.postInclude,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((item) => this.mapPostResult(item)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // ==========================================
  // 4. GET POST BY ID OR SLUG
  // ==========================================
  static async getPostByIdOrSlug(
    idOrSlug: string,
    requestingUserId?: string
  ): Promise<PostWithRelations> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    const post = await prisma.post.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: this.postInclude,
    });

    if (!post) {
      throw { status: 404, message: `Post not found: ${idOrSlug}` };
    }

    // Only author can view unpublished / archived posts
    if (post.status !== POST_STATUS.PUBLISHED || post.isArchived) {
      if (!requestingUserId || requestingUserId !== post.authorId) {
        throw { status: 404, message: `Post not found: ${idOrSlug}` };
      }
    }

    return this.mapPostResult(post);
  }

  // ==========================================
  // 5. GET RELATED POSTS
  // ==========================================
  static async getRelatedPosts(
    slugOrId: string,
    limit: number = 3
  ): Promise<RelatedPostItem[]> {
    const safeLimit = Math.min(10, Math.max(1, Number(limit) || 3));
    const currentPost = await this.getPostByIdOrSlug(slugOrId);
    const tagIds = (currentPost.tags ?? []).map((t) => t.id);

    let tagMatched: any[] = [];

    if (tagIds.length > 0) {
      tagMatched = await prisma.post.findMany({
        where: {
          id: { not: currentPost.id },
          status: POST_STATUS.PUBLISHED,
          isArchived: false,
          tags: {
            some: { id: { in: tagIds } },
          },
        },
        take: safeLimit,
        orderBy: { createdAt: "desc" },
        include: this.postInclude,
      });
    }

    const remaining = safeLimit - tagMatched.length;
    let fallback: any[] = [];

    if (remaining > 0) {
      const excludeIds = [currentPost.id, ...tagMatched.map((p) => p.id)];
      fallback = await prisma.post.findMany({
        where: {
          id: { notIn: excludeIds },
          status: POST_STATUS.PUBLISHED,
          isArchived: false,
        },
        take: remaining,
        orderBy: { createdAt: "desc" },
        include: this.postInclude,
      });
    }

    return [...tagMatched, ...fallback].map((p) => this.mapRelatedPost(p));
  }

  // ==========================================
  // 6. UPDATE POST
  // ==========================================
  static async updatePost(
    userId: string,
    postId: string,
    data: UpdatePostInput
  ): Promise<PostWithRelations> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { tags: true },
    });

    if (!post) {
      throw { status: 404, message: "Post not found" };
    }

    if (post.authorId !== userId) {
      throw { status: 403, message: "You are not authorized to update this post" };
    }

    const isContentOrTitleUpdated =
      data.title !== undefined || data.content !== undefined;

    const updatedPost = await prisma.$transaction(async (tx) => {
      let tagConnectData: any = undefined;

      if (data.tags !== undefined) {
        const uniqueTagNames = this.normalizeTags(data.tags);
        const currentTags = post.tags;

        const newTagMap = new Map(
          uniqueTagNames.map((name) => [
            generateSlug(name) || name.toLowerCase(),
            name,
          ])
        );

        const currentTagSlugs = new Set(currentTags.map((t) => t.slug));

        // Tags to remove
        const removedTagIds = currentTags
          .filter((t) => !newTagMap.has(t.slug))
          .map((t) => t.id);

        if (removedTagIds.length > 0) {
          await tx.postTag.updateMany({
            where: { id: { in: removedTagIds }, postsCount: { gt: 0 } },
            data: { postsCount: { decrement: 1 } },
          });
        }

        const keptTagIds = currentTags
          .filter((t) => newTagMap.has(t.slug))
          .map((t) => ({ id: t.id }));

        const addedEntries = Array.from(newTagMap.entries()).filter(
          ([slug]) => !currentTagSlugs.has(slug)
        );

        const addedRecords = await Promise.all(
          addedEntries.map(async ([slug, name]) =>
            tx.postTag.upsert({
              where: { slug },
              update: { postsCount: { increment: 1 } },
              create: { name, slug, postsCount: 1 },
            })
          )
        );

        tagConnectData = {
          set: [...keptTagIds, ...addedRecords.map((t) => ({ id: t.id }))],
        };
      }

      return tx.post.update({
        where: { id: postId },
        data: {
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.coverImageUrl !== undefined
            ? { coverImageUrl: data.coverImageUrl }
            : {}),
          ...(data.blurHash !== undefined ? { blurHash: data.blurHash } : {}),
          ...(tagConnectData ? { tags: tagConnectData } : {}),
          ...(isContentOrTitleUpdated ? { isEdited: true } : {}),
        },
        include: this.postInclude,
      });
    });

    return this.mapPostResult(updatedPost);
  }

  // ==========================================
  // 7. ARCHIVE (SOFT DELETE) POST
  // ==========================================
  static async archivePost(
    userId: string,
    postId: string
  ): Promise<ArchivePostResult> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: this.postInclude,
    });

    if (!post) {
      throw { status: 404, message: "Post not found" };
    }

    if (post.authorId !== userId) {
      throw { status: 403, message: "You are not authorized to archive this post" };
    }

    if (post.isArchived || post.status === POST_STATUS.ARCHIVED) {
      return {
        message: "No change: Post is already archived",
        post: this.mapPostResult(post),
        changed: false,
      };
    }

    const archived = await prisma.post.update({
      where: { id: postId },
      data: {
        status: POST_STATUS.ARCHIVED,
        isArchived: true,
        archivedAt: new Date(),
      },
      include: this.postInclude,
    });

    return {
      message: "Post archived successfully",
      post: this.mapPostResult(archived),
      changed: true,
    };
  }

  // ==========================================
  // 8. RESTORE ARCHIVED POST
  // ==========================================
  static async restorePost(
    userId: string,
    postId: string
  ): Promise<PostWithRelations> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: this.postInclude,
    });

    if (!post) {
      throw { status: 404, message: "Post not found" };
    }

    if (post.authorId !== userId) {
      throw { status: 403, message: "You are not authorized to restore this post" };
    }

    if (!post.isArchived && post.status !== POST_STATUS.ARCHIVED) {
      return this.mapPostResult(post);
    }

    const restored = await prisma.post.update({
      where: { id: postId },
      data: {
        status: POST_STATUS.DRAFT,
        isArchived: false,
        archivedAt: null,
      },
      include: this.postInclude,
    });

    return this.mapPostResult(restored);
  }

  // ==========================================
  // 9. HARD DELETE POST (OPTIONAL)
  // ==========================================
  static async deletePost(userId: string, postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { tags: true },
    });

    if (!post) {
      throw { status: 404, message: "Post not found" };
    }

    if (post.authorId !== userId) {
      throw { status: 403, message: "You are not authorized to delete this post" };
    }

    await prisma.$transaction(async (tx) => {
      // Decrement tags
      const tagIds = post.tags.map((t) => t.id);
      if (tagIds.length > 0) {
        await tx.postTag.updateMany({
          where: { id: { in: tagIds }, postsCount: { gt: 0 } },
          data: { postsCount: { decrement: 1 } },
        });
      }

      await tx.post.delete({ where: { id: postId } });
    });
  }
}

export default PostService;
