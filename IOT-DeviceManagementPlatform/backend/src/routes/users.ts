import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'User routes - Coming soon',
    data: { endpoint: 'users' }
  });
}));

export default router;