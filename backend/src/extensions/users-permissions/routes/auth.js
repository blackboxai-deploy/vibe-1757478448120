'use strict';

/**
 * Extended Auth routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/refresh',
      handler: 'auth.refresh',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // No authentication required for token refresh
      },
    },
    {
      method: 'POST',
      path: '/auth/logout',
      handler: 'auth.logout',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/revoke',
      handler: 'auth.revokeToken',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/auth/sessions',
      handler: 'auth.sessions',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};