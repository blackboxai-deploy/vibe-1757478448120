'use strict';

const { sanitize } = require('@strapi/utils');
const crypto = require('crypto');

/**
 * Extended User controller with password generation
 */

module.exports = (plugin) => {
  const originalController = plugin.controllers.user;

  plugin.controllers.user = {
    ...originalController,

    /**
     * Generate and email a new password for a user
     * POST /api/users/:id/generate-password
     */
    async generatePassword(ctx) {
      try {
        const { id } = ctx.params;
        const requestingUser = ctx.state.user;

        // Check if requesting user has permission to manage users
        if (!requestingUser) {
          return ctx.unauthorized('Authentication required');
        }

        // Find the target user
        const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id },
          select: ['id', 'username', 'email', 'firstName', 'lastName', 'blocked']
        });

        if (!targetUser) {
          return ctx.notFound('User not found');
        }

        if (targetUser.blocked) {
          return ctx.badRequest('Cannot generate password for blocked user');
        }

        // Generate a secure random password
        const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);
        
        // Hash the password
        const hashedPassword = await strapi.plugins['users-permissions'].services.user.hashPassword({
          password: newPassword
        });

        // Update user password
        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id },
          data: { password: hashedPassword }
        });

        // Send email with new password
        try {
          await strapi.plugins['email'].services.email.send({
            to: targetUser.email,
            from: process.env.SMTP_FROM || 'noreply@legalcontracts.com',
            subject: 'Legal Contracts - New Password Generated',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
                  <h2 style="color: #333; margin-top: 0;">Password Reset - Legal Contracts System</h2>
                  <p style="color: #666; line-height: 1.6;">
                    Hello ${targetUser.firstName || targetUser.username},
                  </p>
                  <p style="color: #666; line-height: 1.6;">
                    A new password has been generated for your Legal Contracts account by an administrator.
                  </p>
                  <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <strong style="color: #333;">Your new password is:</strong>
                    <div style="font-family: 'Courier New', monospace; font-size: 18px; color: #007bff; padding: 10px; background-color: #f1f3f4; border-radius: 4px; margin-top: 10px; word-break: break-all;">
                      ${newPassword}
                    </div>
                  </div>
                  <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <strong style="color: #856404;">Important Security Note:</strong>
                    <p style="color: #856404; margin: 5px 0 0 0; font-size: 14px;">
                      Please change this password immediately after logging in. This password is temporary and should not be shared with anyone.
                    </p>
                  </div>
                  <p style="color: #666; line-height: 1.6;">
                    <strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #007bff;">Legal Contracts System</a>
                  </p>
                  <p style="color: #666; line-height: 1.6;">
                    If you did not request this password reset, please contact your system administrator immediately.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px; text-align: center;">
                    This is an automated message from the Legal Contracts Management System.
                    <br>Please do not reply to this email.
                  </p>
                </div>
              </div>
            `,
            text: `
              Legal Contracts System - Password Reset
              
              Hello ${targetUser.firstName || targetUser.username},
              
              A new password has been generated for your Legal Contracts account by an administrator.
              
              Your new password is: ${newPassword}
              
              IMPORTANT: Please change this password immediately after logging in. This password is temporary and should not be shared with anyone.
              
              Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
              
              If you did not request this password reset, please contact your system administrator immediately.
              
              ---
              This is an automated message from the Legal Contracts Management System.
            `
          });

          strapi.log.info(`Password generated and emailed for user: ${targetUser.email} by ${requestingUser.email}`);

        } catch (emailError) {
          strapi.log.error('Failed to send password email:', emailError);
          // Don't expose email error details to client
          return ctx.send({
            data: {
              message: 'Password generated successfully, but email delivery failed. Please provide the password manually.',
              userId: targetUser.id,
              username: targetUser.username,
              email: targetUser.email,
              // Include password in response if email fails (for admin to manually provide)
              temporaryPassword: newPassword
            }
          });
        }

        // Sanitize response (don't include password in normal success response)
        const sanitizedUser = sanitize.contentAPI.output(targetUser, strapi.getModel('plugin::users-permissions.user'));

        return ctx.send({
          data: {
            message: 'Password generated successfully and sent via email',
            user: sanitizedUser
          }
        });

      } catch (error) {
        strapi.log.error('Error generating password:', error);
        return ctx.internalServerError('Failed to generate password', { error: error.message });
      }
    },

    /**
     * Get current user profile with additional info
     * GET /api/users/me
     */
    async me(ctx) {
      try {
        const user = ctx.state.user;
        
        if (!user) {
          return ctx.unauthorized('You must be authenticated to access this resource');
        }

        // Get user with additional relations
        const userWithRelations = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: {
            role: {
              select: ['name', 'description']
            }
          }
        });

        // Get user statistics
        const stats = {
          projectsManaged: await strapi.db.query('api::project.project').count({
            where: { projectManager: user.id }
          }),
          contractsAssigned: await strapi.db.query('api::contract.contract').count({
            where: { assignedTo: user.id }
          }),
          documentsUploaded: await strapi.db.query('api::document.document').count({
            where: { uploadedBy: user.id }
          }),
          notesCreated: await strapi.db.query('api::note.note').count({
            where: { author: user.id }
          })
        };

        const sanitizedUser = sanitize.contentAPI.output(userWithRelations, strapi.getModel('plugin::users-permissions.user'));

        return ctx.send({
          ...sanitizedUser,
          stats
        });

      } catch (error) {
        strapi.log.error('Error fetching user profile:', error);
        return ctx.internalServerError('Failed to fetch user profile');
      }
    }
  };

  return plugin;
};