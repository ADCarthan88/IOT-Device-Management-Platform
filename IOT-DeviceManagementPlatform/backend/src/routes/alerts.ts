import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: Get alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts list
 */
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Alerts routes - Coming soon',
    data: { endpoint: 'alerts' }
  });
}));

export default router;