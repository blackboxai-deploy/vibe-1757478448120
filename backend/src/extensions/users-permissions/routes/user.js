'use strict';

/**
 * Extended User routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/users/:id/generate-password',
      handler: 'user.generatePassword',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};