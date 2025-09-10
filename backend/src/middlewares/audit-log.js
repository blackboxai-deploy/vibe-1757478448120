'use strict';

/**
 * Audit Log Middleware
 * 
 * This middleware logs all important events in the system:
 * - Authentication events (login, logout, token refresh)
 * - CRUD operations on all entities
 * - File uploads and downloads
 * - Document signing events
 * - User management events
 */

const auditableEvents = {
  // Authentication Events
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REFRESH_TOKEN: 'auth.refresh_token',
  PASSWORD_RESET: 'auth.password_reset',
  PASSWORD_CHANGE: 'auth.password_change',
  
  // CRUD Events
  CREATE: 'crud.create',
  READ: 'crud.read',
  UPDATE: 'crud.update',
  DELETE: 'crud.delete',
  
  // File Events
  FILE_UPLOAD: 'file.upload',
  FILE_DOWNLOAD: 'file.download',
  FILE_DELETE: 'file.delete',
  
  // Document Events
  DOCUMENT_SIGN: 'document.sign',
  DOCUMENT_APPROVE: 'document.approve',
  DOCUMENT_REJECT: 'document.reject',
  
  // User Management Events
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ROLE_CHANGE: 'user.role_change',
};

const getClientIP = (ctx) => {
  return ctx.request.ip || 
         ctx.request.header['x-forwarded-for'] || 
         ctx.request.header['x-real-ip'] || 
         ctx.request.connection?.remoteAddress || 
         'unknown';
};

const getUserAgent = (ctx) => {
  return ctx.request.header['user-agent'] || 'unknown';
};

const createAuditLog = async (strapi, logData) => {
  try {
    await strapi.db.query('api::audit-log.audit-log').create({
      data: {
        ...logData,
        timestamp: new Date(),
        publishedAt: new Date(),
      },
    });
  } catch (error) {
    strapi.log.error('Failed to create audit log:', error);
  }
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const startTime = Date.now();
    
    // Extract request information
    const method = ctx.request.method;
    const url = ctx.request.url;
    const user = ctx.state.user;
    const ip = getClientIP(ctx);
    const userAgent = getUserAgent(ctx);
    
    // Continue with the request
    await next();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const statusCode = ctx.response.status;
    
    // Determine if this is an auditable event
    let eventType = null;
    let entityType = null;
    let entityId = null;
    let details = {};
    
    // Parse URL to determine entity and action
    const urlParts = url.split('/');
    const apiIndex = urlParts.indexOf('api');
    
    if (apiIndex !== -1 && urlParts.length > apiIndex + 1) {
      entityType = urlParts[apiIndex + 1];
      entityId = urlParts[apiIndex + 2] || null;
    }
    
    // Map HTTP methods to CRUD operations
    switch (method.toLowerCase()) {
      case 'post':
        if (url.includes('/auth/local')) {
          eventType = auditableEvents.LOGIN;
          entityType = 'authentication';
          details = { 
            identifier: ctx.request.body?.identifier,
            success: statusCode === 200
          };
        } else if (url.includes('/auth/refresh')) {
          eventType = auditableEvents.REFRESH_TOKEN;
          entityType = 'authentication';
          details = { success: statusCode === 200 };
        } else if (url.includes('/auth/logout')) {
          eventType = auditableEvents.LOGOUT;
          entityType = 'authentication';
          details = { success: statusCode === 200 };
        } else if (url.includes('/upload-base64')) {
          eventType = auditableEvents.FILE_UPLOAD;
          entityType = 'document';
          details = { 
            fileName: ctx.request.body?.name,
            fileSize: ctx.request.body?.data?.length,
            success: statusCode === 200
          };
        } else if (url.includes('/generate-password')) {
          eventType = auditableEvents.PASSWORD_RESET;
          entityType = 'user';
          details = { 
            targetUserId: entityId,
            success: statusCode === 200
          };
        } else {
          eventType = auditableEvents.CREATE;
        }
        break;
      
      case 'get':
        if (url.includes('/me')) {
          // Skip logging /me endpoint to avoid noise
          return;
        }
        eventType = auditableEvents.READ;
        break;
      
      case 'put':
        eventType = auditableEvents.UPDATE;
        break;
      
      case 'delete':
        eventType = auditableEvents.DELETE;
        break;
    }
    
    // Only log auditable events with successful responses or important failures
    if (eventType && (statusCode < 400 || statusCode === 401 || statusCode === 403)) {
      const auditData = {
        event: eventType,
        entityType: entityType || 'unknown',
        entityId: entityId || null,
        userId: user?.id || null,
        userEmail: user?.email || null,
        ipAddress: ip,
        userAgent: userAgent,
        method: method,
        endpoint: url,
        statusCode: statusCode,
        responseTime: responseTime,
        details: JSON.stringify(details),
        metadata: JSON.stringify({
          requestHeaders: {
            'content-type': ctx.request.header['content-type'],
            'authorization': ctx.request.header['authorization'] ? '[REDACTED]' : null,
          },
          requestSize: ctx.request.header['content-length'] || 0,
          responseSize: ctx.response.length || 0,
        }),
      };
      
      // Create audit log asynchronously to not block the response
      setImmediate(() => createAuditLog(strapi, auditData));
    }
  };
};