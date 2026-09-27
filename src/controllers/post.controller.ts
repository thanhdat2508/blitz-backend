import { Request, Response } from "express";
import PostService from "../services/post.service";
import { CreatePostInput, UpdatePostInput } from "../types/post.types";

export class PostController {
  // POST /api/posts/create or POST /api/posts
  createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: Please log in to create a post" });
        return;
      }

      const { title, content, tags, status, coverImageUrl, blurHash } = req.body;
      const input: CreatePostInput = {
        title,
        content,
        tags,
        status,
        coverImageUrl,
        blurHash,
      };

      const post = await PostService.createPost(userId, input);
      res.status(201).json({
        message: "Post created successfully",
        data: post,
      });
    } catch (error: any) {
      this.handleError(res, error, "Failed to create post");
    }
  };

  // GET /api/posts
  getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const status = req.query.status as any;
      const search = req.query.search as string;
      const tag = req.query.tag as string;
      const authorId = req.query.authorId as string;

      const result = await PostService.getPosts({
        page,
        limit,
        status,
        search,
        tag,
        authorId,
      });

      res.status(200).json({
        message: "Posts retrieved successfully",
        ...result,
      });
    } catch (error: any) {
      this.handleError(res, error, "Failed to retrieve posts");
    }
  };

  // GET /api/posts/me
  getMyPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: Please log in" });
        return;
      }

      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const status = req.query.status as any;
      const search = req.query.search as string;

      const result = await PostService.getMyPosts(userId, {
        page,
        limit,
        status,
        search,
      });

      res.status(200).json({
        message: "Personal posts retrieved successfully",
        ...result,
      });
    } catch (error: any) {
      this.handleError(res, error, "Failed to retrieve personal posts");
    }
  };

  // GET /api/posts/:slug
  getPostBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const requestingUserId = req.user?.id;

      const post = await PostService.getPostByIdOrSlug(slug, requestingUserId);
      res.status(200).json({
        message: "Post retrieved successfully",
        data: post,
      });
    } catch (error: any) {
      this.handleError(res, error, "Failed to retrieve post");
    }
  };

  // GET /api/posts/:slug/related
  getRelatedPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const limit = req.query.limit ? Number(req.query.limit) : 3;

      const related = await PostService.getRelatedPosts(slug, limit);
      res.status(200).json({
        message: "Related posts retrieved successfully",
        data: related,
      });
    } catch (error: any) {
      this.handleError(res, error, "Failed to retrieve related posts");
    }
  };

  // PATCH /api/posts/:id
  updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: Please log in" });
        return;
      }

      const id = req.params.id as string;
      const { title, content, tags, status, coverImageUrl, blurHash } = req.body;
      const input: UpdatePostInput = {
        title,
        content,
        tags,
        status,
        coverImageUrl,
        blurHash,
      };

      const updated = await PostService.updatePost(userId, id, input);
      res.status(200).json({
        message: "Post updated successfully",
        data: updated,
      });
    } catch (error: any) {
      this.handleError(res, error, "Failed to update post");
    }
  };

  // DELETE /api/posts/:id (Archive)
  archivePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: Please log in" });
        return;
      }

      const id = req.params.id as string;
      const result = await PostService.archivePost(userId, id);

      res.status(200).json(result);
    } catch (error: any) {
      this.handleError(res, error, "Failed to archive post");
    }
  };

  // POST /api/posts/:id/restore
  restorePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: Please log in" });
        return;
      }

      const id = req.params.id as string;
      const post = await PostService.restorePost(userId, id);

      res.status(200).json({
        message: "Post restored successfully",
        data: post,
      });
    } catch (error: any) {
      this.handleError(res, error, "Failed to restore post");
    }
  };

  private handleError(res: Response, error: any, defaultMessage: string): void {
    const status = error.status || 500;
    const message = error.message || defaultMessage;
    if (status >= 500) {
      console.error("[PostController Error]:", error);
    }
    res.status(status).json({
      error: message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

export const postController = new PostController();
export default postController;
