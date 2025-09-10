module.exports = ({ env }) => ({
  // Email Plugin Configuration
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        secure: false, // true for 465, false for other ports
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'noreply@legalcontracts.com'),
        defaultReplyTo: env('SMTP_FROM', 'noreply@legalcontracts.com'),
      },
    },
  },

  // Upload Plugin Configuration
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: env.int('MAX_FILE_SIZE', 50000000), // 50MB
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },

  // Users & Permissions Plugin Configuration
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: env('API_TOKEN_EXPIRES_IN', '7d'),
      },
      register: {
        allowedFields: [
          'firstName',
          'lastName',
          'phone',
          'department',
          'position',
        ],
      },
      ratelimit: {
        enabled: true,
        max: 5,
        duration: 60000, // 1 minute
      },
    },
  },

  // Documentation Plugin (Optional)
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Legal Contracts Management API',
        description: 'API for managing legal contracts, documents, and audit logs',
        contact: {
          name: 'Legal Contracts Team',
          email: 'support@legalcontracts.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:1337/api',
          description: 'Development server',
        },
      ],
    },
  },
});