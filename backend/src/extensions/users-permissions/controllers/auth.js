'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Extended Auth controller with refresh token functionality
 */

module.exports = (plugin) => {
  const originalController = plugin.controllers.auth;

  plugin.controllers.auth = {
    ...originalController,

    /**
     * Login with refresh token generation
     * POST /api/auth/local
     */
    async callback(ctx) {
      try {
        // Call original login logic
        await originalController.callback(ctx);
        
        if (ctx.body && ctx.body.jwt && ctx.body.user) {
          const user = ctx.body.user;
          
          // Generate refresh token
          const refreshToken = crypto.randomBytes(32).toString('hex');
          const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

          // Store refresh token in database
          await strapi.db.query('api::refresh-token.refresh-token').create({
            data: {
              token: refreshToken,
              tokenHash: refreshTokenHash,
              user: user.id,
              expiresAt: expiresAt,
              ipAddress: ctx.request.ip || 'unknown',
              userAgent: ctx.request.header['user-agent'] || 'unknown',
              sessionId: crypto.randomBytes(16).toString('hex'),
              lastUsedAt: new Date(),
              usageCount: 0,
              publishedAt: new Date(),
            }
          });

          // Add refresh token to response
          ctx.body.refreshToken = refreshToken;
          ctx.body.expiresIn = process.env.API_TOKEN_EXPIRES_IN || '7d';
          
          strapi.log.info(`User logged in: ${user.email} from ${ctx.request.ip}`);
        }

      } catch (error) {
        strapi.log.error('Login error:', error);
        ctx.body = { error: 'Authentication failed' };
        ctx.status = 401;
      }
    },

    /**
     * Refresh JWT token using refresh token
     * POST /api/auth/refresh
     */
    async refresh(ctx) {
      try {
        const { refreshToken } = ctx.request.body;

        if (!refreshToken) {
          return ctx.badRequest('Refresh token is required');
        }

        // Find refresh token in database
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const storedToken = await strapi.db.query('api::refresh-token.refresh-token').findOne({
          where: { 
            tokenHash: tokenHash,
            isRevoked: false,
            expiresAt: {
              $gt: new Date()
            }
          },
          populate: ['user']
        });

        if (!storedToken) {
          return ctx.unauthorized('Invalid or expired refresh token');
        }

        // Check if user is still active
        const user = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { 
            id: storedToken.user.id,
            blocked: false,
            confirmed: true
          },
          populate: ['role']
        });

        if (!user) {
          return ctx.unauthorized('User not found or blocked');
        }

        // Generate new JWT
        const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
          id: user.id,
        });

        // Update refresh token usage
        await strapi.db.query('api::refresh-token.refresh-token').update({
          where: { id: storedToken.id },
          data: {
            lastUsedAt: new Date(),
            usageCount: storedToken.usageCount + 1,
          }
        });

        // Clean user object
        delete user.password;
        delete user.resetPasswordToken;

        strapi.log.info(`Token refreshed for user: ${user.email}`);

        return ctx.send({
          jwt: jwt,
          user: user,
          expiresIn: process.env.API_TOKEN_EXPIRES_IN || '7d'
        });

      } catch (error) {
        strapi.log.error('Token refresh error:', error);
        return ctx.internalServerError('Failed to refresh token');
      }
    },

    /**
     * Logout and revoke refresh token
     * POST /api/auth/logout
     */
    async logout(ctx) {
      try {
        const { refreshToken } = ctx.request.body;
        const user = ctx.state.user;

        if (refreshToken) {
          // Revoke specific refresh token
          const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
          await strapi.db.query('api::refresh-token.refresh-token').update({
            where: { tokenHash: tokenHash },
            data: {
              isRevoked: true,
              revokedAt: new Date(),
              revokedReason: 'user_logout'
            }
          });
        }

        // Optionally revoke all user's refresh tokens
        const { revokeAll = false } = ctx.request.body;
        if (revokeAll && user) {
          await strapi.db.query('api::refresh-token.refresh-token').updateMany({
            where: { 
              user: user.id,
              isRevoked: false
            },
            data: {
              isRevoked: true,
              revokedAt: new Date(),
              revokedReason: 'logout_all_sessions'
            }
          });
        }

        if (user) {
          strapi.log.info(`User logged out: ${user.email} from ${ctx.request.ip}`);
        }

        return ctx.send({
          message: 'Logged out successfully'
        });

      } catch (error) {
        strapi.log.error('Logout error:', error);
        return ctx.internalServerError('Logout failed');
      }
    },

    /**
     * Revoke refresh token
     * POST /api/auth/revoke
     */
    async revokeToken(ctx) {
      try {
        const { refreshToken } = ctx.request.body;
        const user = ctx.state.user;

        if (!refreshToken) {
          return ctx.badRequest('Refresh token is required');
        }

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        
        const whereClause = { tokenHash: tokenHash };
        if (user) {
          whereClause.user = user.id; // Users can only revoke their own tokens
        }

        const result = await strapi.db.query('api::refresh-token.refresh-token').update({
          where: whereClause,
          data: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'manual_revocation'
          }
        });

        if (!result) {
          return ctx.notFound('Token not found or already revoked');
        }

        strapi.log.info(`Refresh token revoked by user: ${user?.email || 'unknown'}`);

        return ctx.send({
          message: 'Token revoked successfully'
        });

      } catch (error) {
        strapi.log.error('Token revocation error:', error);
        return ctx.internalServerError('Failed to revoke token');
      }
    },

    /**
     * Get user's active sessions
     * GET /api/auth/sessions
     */
    async sessions(ctx) {
      try {
        const user = ctx.state.user;

        if (!user) {
          return ctx.unauthorized('Authentication required');
        }

        const sessions = await strapi.db.query('api::refresh-token.refresh-token').findMany({
          where: {
            user: user.id,
            isRevoked: false,
            expiresAt: {
              $gt: new Date()
            }
          },
          select: [
            'id',
            'createdAt', 
            'lastUsedAt', 
            'expiresAt',
            'ipAddress',
            'userAgent',
            'sessionId',
            'usageCount'
          ],
          orderBy: { lastUsedAt: 'desc' }
        });

        return ctx.send({
          data: sessions,
          meta: {
            total: sessions.length
          }
        });

      } catch (error) {
        strapi.log.error('Error fetching sessions:', error);
        return ctx.internalServerError('Failed to fetch sessions');
      }
    }
  };

  return plugin;
};