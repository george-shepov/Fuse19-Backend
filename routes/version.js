const express = require('express');
const { asyncHandler } = require('../middleware/error');
const { getVersionInfo } = require('../middleware/apiVersion');

const router = express.Router();

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Get API version information
 *     description: Returns information about supported API versions, current version, and deprecation warnings
 *     tags: [Version]
 *     responses:
 *       200:
 *         description: Version information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     supportedVersions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["v1", "v2"]
 *                     currentVersion:
 *                       type: string
 *                       example: "v1"
 *                     defaultVersion:
 *                       type: string
 *                       example: "v1"
 *                     deprecationWarnings:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           deprecated:
 *                             type: boolean
 *                           sunsetDate:
 *                             type: string
 *                             format: date
 *                           message:
 *                             type: string
 *                     versioningMethods:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["URL path", "Accept header", "X-API-Version header", "Query parameter"]
 */
router.get('/', asyncHandler(async (req, res) => {
  const versionInfo = getVersionInfo();
  
  res.json({
    success: true,
    data: {
      ...versionInfo,
      versioningMethods: [
        'URL path (/api/v1/endpoint)',
        'Accept header (Accept: application/vnd.fuse19.v1+json)',
        'X-API-Version header (X-API-Version: v1)',
        'Query parameter (?version=v1)'
      ],
      examples: {
        urlPath: '/api/v1/users',
        acceptHeader: 'Accept: application/vnd.fuse19.v1+json',
        customHeader: 'X-API-Version: v1',
        queryParameter: '?version=v1'
      }
    }
  });
}));

/**
 * @swagger
 * /api/version/compatibility:
 *   get:
 *     summary: Check version compatibility
 *     description: Check if the requested API version is compatible with specific features
 *     tags: [Version]
 *     parameters:
 *       - in: query
 *         name: requested
 *         required: true
 *         schema:
 *           type: string
 *         description: Requested API version
 *         example: v1
 *       - in: query
 *         name: target
 *         required: true
 *         schema:
 *           type: string
 *         description: Target API version to check compatibility against
 *         example: v1
 *     responses:
 *       200:
 *         description: Compatibility check result
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
 *                     compatible:
 *                       type: boolean
 *                     requestedVersion:
 *                       type: string
 *                     targetVersion:
 *                       type: string
 *                     message:
 *                       type: string
 */
router.get('/compatibility', asyncHandler(async (req, res) => {
  const { requested, target } = req.query;
  
  if (!requested || !target) {
    return res.status(400).json({
      success: false,
      message: 'Both requested and target version parameters are required',
      error: 'MISSING_PARAMETERS'
    });
  }

  const { isVersionCompatible, supportedVersions } = require('../middleware/apiVersion');
  
  // Check if versions are supported
  if (!supportedVersions.includes(requested)) {
    return res.status(400).json({
      success: false,
      message: `Requested version '${requested}' is not supported`,
      error: 'UNSUPPORTED_VERSION'
    });
  }

  if (!supportedVersions.includes(target)) {
    return res.status(400).json({
      success: false,
      message: `Target version '${target}' is not supported`,
      error: 'UNSUPPORTED_VERSION'
    });
  }

  const compatible = isVersionCompatible(requested, target);
  
  res.json({
    success: true,
    data: {
      compatible,
      requestedVersion: requested,
      targetVersion: target,
      message: compatible 
        ? `Version ${requested} is compatible with ${target}`
        : `Version ${requested} is not compatible with ${target}. Please upgrade to ${target} or higher.`
    }
  });
}));

module.exports = router;