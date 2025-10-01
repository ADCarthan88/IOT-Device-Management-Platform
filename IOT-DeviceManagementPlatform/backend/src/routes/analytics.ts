import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Analytics routes - Coming soon',
    data: { endpoint: 'analytics' }
  });
}));

export default router;