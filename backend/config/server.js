module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ['default-key-1', 'default-key-2']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  url: env('PUBLIC_URL', `http://localhost:${env.int('PORT', 1337)}`),
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
    tasks: {
      // Clean expired refresh tokens daily at midnight
      '0 0 * * *': async ({ strapi }) => {
        await strapi.db.query('api::refresh-token.refresh-token').deleteMany({
          where: {
            expiresAt: {
              $lt: new Date(),
            },
          },
        });
        strapi.log.info('Cleaned expired refresh tokens');
      },
    },
  },
});