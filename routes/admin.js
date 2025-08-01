const express = require('express');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { getRateLimitStatus, clearRateLimit } = require('../middleware/rateLimiter');

const router = express.Router();

// Admin middleware - require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      error: 'FORBIDDEN'
    });
  }
  next();
};

/**
 * @swagger
 * /api/admin/rate-limits/{userId}:
 *   get:
 *     summary: Get user rate limit status
 *     description: Get current rate limit status for a specific user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to check
 *       - in: query
 *         name: limitType
 *         schema:
 *           type: string
 *           enum: [api, auth, upload, chat, search, email, passwordReset]
 *           default: api
 *         description: Type of rate limit to check
 *     responses:
 *       200:
 *         description: Rate limit status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                     limit:
 *                       type: integer
 *                     remaining:
 *                       type: integer
 *                     resetTime:
 *                       type: string
 *                       format: date-time
 *                     windowMs:
 *                       type: integer
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/rate-limits/:userId', auth, requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limitType = 'api' } = req.query;

  const status = await getRateLimitStatus(userId, limitType);

  res.json({
    success: true,
    data: {
      userId,
      limitType,
      ...status
    }
  });
}));

/**
 * @swagger
 * /api/admin/rate-limits/{userId}/clear:
 *   delete:
 *     summary: Clear user rate limits
 *     description: Clear rate limits for a specific user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to clear limits for
 *       - in: query
 *         name: limitType
 *         schema:
 *           type: string
 *           enum: [api, auth, upload, chat, search, email, passwordReset]
 *           default: api
 *         description: Type of rate limit to clear
 *     responses:
 *       200:
 *         description: Rate limit cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/rate-limits/:userId/clear', auth, requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limitType = 'api' } = req.query;

  const result = await clearRateLimit(userId, limitType);

  res.json({
    success: result.success,
    message: result.message
  });
}));

/**
 * @swagger
 * /api/admin/rate-limits/config:
 *   get:
 *     summary: Get rate limit configuration
 *     description: Get current rate limiting configuration (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rate limit configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       windowMs:
 *                         type: integer
 *                       max:
 *                         type: integer
 *                       message:
 *                         type: object
 */
router.get('/rate-limits/config', auth, requireAdmin, asyncHandler(async (req, res) => {
  const { rateLimitConfigs } = require('../middleware/rateLimiter');

  // Remove sensitive message details for security
  const sanitizedConfig = Object.keys(rateLimitConfigs).reduce((acc, key) => {
    acc[key] = {
      windowMs: rateLimitConfigs[key].windowMs,
      max: rateLimitConfigs[key].max,
      description: `${key} rate limit configuration`
    };
    return acc;
  }, {});

  res.json({
    success: true,
    data: sanitizedConfig
  });
}));

module.exports = router;