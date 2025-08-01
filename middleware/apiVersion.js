const { AppError } = require('./error');

// Supported API versions
const supportedVersions = ['v1', 'v2'];
const defaultVersion = 'v1';
const currentVersion = 'v1';

// Version deprecation warnings
const deprecationWarnings = {
  'v1': {
    deprecated: false,
    sunsetDate: null,
    message: null
  }
  // Example for future versions:
  // 'v2': {
  //   deprecated: true,
  //   sunsetDate: '2025-12-31',
  //   message: 'API v2 will be deprecated on 2025-12-31. Please migrate to v3.'
  // }
};

/**
 * Extract API version from request
 * Supports multiple methods:
 * 1. URL path: /api/v1/users
 * 2. Accept header: Accept: application/vnd.fuse19.v1+json
 * 3. Custom header: X-API-Version: v1
 * 4. Query parameter: ?version=v1
 */
const extractVersion = (req) => {
  // Method 1: URL path
  const pathMatch = req.path.match(/^\/api\/v(\d+)\//);
  if (pathMatch) {
    return `v${pathMatch[1]}`;
  }

  // Method 2: Accept header
  const acceptHeader = req.get('Accept');
  if (acceptHeader) {
    const acceptMatch = acceptHeader.match(/application\/vnd\.fuse19\.v(\d+)\+json/);
    if (acceptMatch) {
      return `v${acceptMatch[1]}`;
    }
  }

  // Method 3: Custom header
  const versionHeader = req.get('X-API-Version');
  if (versionHeader) {
    return versionHeader.toLowerCase();
  }

  // Method 4: Query parameter
  const queryVersion = req.query.version;
  if (queryVersion) {
    return queryVersion.toLowerCase();
  }

  // Default version
  return defaultVersion;
};

/**
 * Middleware to handle API versioning
 */
const apiVersioning = (req, res, next) => {
  // Extract version from request
  const requestedVersion = extractVersion(req);
  
  // Validate version
  if (!supportedVersions.includes(requestedVersion)) {
    return next(new AppError(
      `API version '${requestedVersion}' is not supported. Supported versions: ${supportedVersions.join(', ')}`,
      400,
      'UNSUPPORTED_API_VERSION',
      {
        requestedVersion,
        supportedVersions,
        currentVersion
      }
    ));
  }

  // Set version on request object
  req.apiVersion = requestedVersion;

  // Add version headers to response
  res.set('X-API-Version', requestedVersion);
  res.set('X-API-Current-Version', currentVersion);
  res.set('X-API-Supported-Versions', supportedVersions.join(', '));

  // Check for deprecation warnings
  const deprecation = deprecationWarnings[requestedVersion];
  if (deprecation && deprecation.deprecated) {
    res.set('X-API-Deprecation-Warning', deprecation.message);
    res.set('X-API-Sunset-Date', deprecation.sunsetDate);
    
    // Log deprecation usage for monitoring
    console.warn(`Deprecated API version ${requestedVersion} used`, {
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      version: requestedVersion,
      sunsetDate: deprecation.sunsetDate
    });
  }

  next();
};

/**
 * Create version-specific route handler
 */
const versionedRoute = (versionHandlers) => {
  return (req, res, next) => {
    const version = req.apiVersion || defaultVersion;
    const handler = versionHandlers[version];

    if (!handler) {
      return next(new AppError(
        `No handler available for API version '${version}' on this endpoint`,
        404,
        'VERSION_HANDLER_NOT_FOUND',
        {
          availableVersions: Object.keys(versionHandlers),
          requestedVersion: version
        }
      ));
    }

    // Call the version-specific handler
    handler(req, res, next);
  };
};

/**
 * Version-specific response formatter
 */
const formatVersionedResponse = (data, version = 'v1') => {
  switch (version) {
    case 'v1':
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        version: 'v1'
      };
    
    case 'v2':
      // Example of different response format for v2
      return {
        status: 'success',
        result: data,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId: Math.random().toString(36).substr(2, 9)
        }
      };
    
    default:
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        version: version
      };
  }
};

/**
 * Middleware to format response based on API version
 */
const versionedResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Don't format error responses differently
    if (data && data.success === false) {
      return originalJson.call(this, data);
    }

    // Format based on API version
    const formattedData = formatVersionedResponse(data, req.apiVersion);
    return originalJson.call(this, formattedData);
  };

  next();
};

/**
 * Create version-specific middleware
 */
const requireVersion = (minVersion) => {
  return (req, res, next) => {
    const currentVersionNum = parseInt(req.apiVersion.replace('v', ''));
    const minVersionNum = parseInt(minVersion.replace('v', ''));

    if (currentVersionNum < minVersionNum) {
      return next(new AppError(
        `This endpoint requires API version ${minVersion} or higher. You are using ${req.apiVersion}.`,
        400,
        'VERSION_TOO_LOW',
        {
          requestedVersion: req.apiVersion,
          minimumVersion: minVersion,
          currentVersion
        }
      ));
    }

    next();
  };
};

/**
 * Deprecate a specific version
 */
const deprecateVersion = (version, sunsetDate, message) => {
  deprecationWarnings[version] = {
    deprecated: true,
    sunsetDate,
    message: message || `API ${version} is deprecated and will be removed on ${sunsetDate}`
  };
};

/**
 * Get version information
 */
const getVersionInfo = () => {
  return {
    supportedVersions,
    currentVersion,
    defaultVersion,
    deprecationWarnings: Object.keys(deprecationWarnings)
      .filter(v => deprecationWarnings[v].deprecated)
      .reduce((acc, v) => {
        acc[v] = deprecationWarnings[v];
        return acc;
      }, {})
  };
};

/**
 * Version compatibility checker
 */
const isVersionCompatible = (requestedVersion, targetVersion) => {
  const requestedNum = parseInt(requestedVersion.replace('v', ''));
  const targetNum = parseInt(targetVersion.replace('v', ''));
  
  return requestedNum >= targetNum;
};

module.exports = {
  apiVersioning,
  versionedRoute,
  versionedResponse,
  requireVersion,
  extractVersion,
  formatVersionedResponse,
  deprecateVersion,
  getVersionInfo,
  isVersionCompatible,
  supportedVersions,
  currentVersion,
  defaultVersion
};