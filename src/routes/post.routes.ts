import { Router } from "express";
import { postController } from "../controllers/post.controller";
import authenticateJwt, { optionalAuthenticateJwt } from "../middlewares/auth.middleware";

const router = Router();

// 1. Create blog post (supports both POST /api/posts and POST /api/posts/create matching requin)
router.post("/", authenticateJwt, postController.createPost);
router.post("/create", authenticateJwt, postController.createPost);

// 2. Query published posts with pagination & filtering
router.get("/", postController.getPosts);

// 3. Current authenticated user's posts (including drafts and archives)
router.get("/me", authenticateJwt, postController.getMyPosts);

// 4. Single post view by Slug or UUID
router.get("/:slug", optionalAuthenticateJwt, postController.getPostBySlug);

// 5. Related posts based on shared tags
router.get("/:slug/related", postController.getRelatedPosts);

// 6. Update post (only by author)
router.patch("/:id", authenticateJwt, postController.updatePost);

// 7. Archive (soft delete) post (only by author)
router.delete("/:id", authenticateJwt, postController.archivePost);

// 8. Restore archived post (only by author)
router.post("/:id/restore", authenticateJwt, postController.restorePost);

export default router;
