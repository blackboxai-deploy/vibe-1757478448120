'use strict';

/**
 * Document router with custom routes
 */

module.exports = {
  routes: [
    // Default CRUD routes
    {
      method: 'GET',
      path: '/documents',
      handler: 'document.find',
    },
    {
      method: 'GET',
      path: '/documents/:id',
      handler: 'document.findOne',
    },
    {
      method: 'POST',
      path: '/documents',
      handler: 'document.create',
    },
    {
      method: 'PUT',
      path: '/documents/:id',
      handler: 'document.update',
    },
    {
      method: 'DELETE',
      path: '/documents/:id',
      handler: 'document.delete',
    },
    
    // Custom routes
    {
      method: 'POST',
      path: '/documents/upload-base64',
      handler: 'document.uploadBase64',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/documents/:id/sign',
      handler: 'document.signDocument',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/documents/:id/download',
      handler: 'document.downloadDocument',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};