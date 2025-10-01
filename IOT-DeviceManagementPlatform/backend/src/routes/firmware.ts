import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/firmware:
 *   get:
 *     tags: [Firmware]
 *     summary: Get firmware versions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Firmware versions list
 */
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Firmware routes - Coming soon',
    data: { endpoint: 'firmware' }
  });
}));

export default router;