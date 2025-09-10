'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

/**
 * Document controller with custom upload-base64 functionality
 */
module.exports = createCoreController('api::document.document', ({ strapi }) => ({
  /**
   * Upload a document from base64 data
   * POST /api/documents/upload-base64
   */
  async uploadBase64(ctx) {
    try {
      const { name, data, contractId, description, documentType = 'contract' } = ctx.request.body;
      const user = ctx.state.user;

      // Validation
      if (!name || !data) {
        return ctx.badRequest('Name and data are required');
      }

      if (!data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)) {
        return ctx.badRequest('Invalid base64 data format');
      }

      // Extract file information from base64
      const matches = data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      const fileSize = buffer.length;
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const extension = mime.extension(mimeType) || 'bin';
      const fileName = `${timestamp}-${randomString}.${extension}`;
      
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(strapi.dirs.static.public, 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      
      // Save file to disk
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      
      // Generate checksum
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
      
      // Create file URL
      const fileUrl = `/uploads/${fileName}`;
      
      // Create document entry
      const document = await strapi.db.query('api::document.document').create({
        data: {
          title: name,
          description: description || '',
          fileName: fileName,
          originalFileName: name,
          fileType: mimeType,
          fileSize: fileSize,
          fileUrl: fileUrl,
          documentType: documentType,
          status: 'draft',
          version: '1.0',
          contract: contractId || null,
          uploadedBy: user.id,
          checksum: checksum,
          isTemplate: false,
          signatureRequired: false,
          metadata: {
            uploadMethod: 'base64',
            originalSize: base64Data.length,
            compressionRatio: fileSize / base64Data.length,
            uploadTimestamp: new Date().toISOString(),
          },
          publishedAt: new Date(),
        },
        populate: {
          uploadedBy: {
            select: ['id', 'username', 'email', 'firstName', 'lastName']
          },
          contract: {
            select: ['id', 'title', 'contractNumber']
          }
        }
      });

      // Create initial document version
      await strapi.db.query('api::document-version.document-version').create({
        data: {
          versionNumber: '1.0',
          title: name,
          description: 'Initial version uploaded via base64',
          changeLog: 'Document created via base64 upload',
          fileName: fileName,
          fileType: mimeType,
          fileSize: fileSize,
          fileUrl: fileUrl,
          document: document.id,
          createdBy: user.id,
          status: 'draft',
          isActive: true,
          checksum: checksum,
          versionNotes: 'Initial upload',
          metadata: {
            uploadMethod: 'base64',
            originalSize: base64Data.length,
            compressionRatio: fileSize / base64Data.length,
          },
          publishedAt: new Date(),
        }
      });

      // Log the upload event (will be caught by audit middleware)
      strapi.log.info(`Document uploaded via base64: ${name} by user ${user.email}`);

      return ctx.send({
        data: document,
        meta: {
          fileSize: fileSize,
          checksum: checksum,
          uploadMethod: 'base64'
        }
      });

    } catch (error) {
      strapi.log.error('Error in uploadBase64:', error);
      return ctx.internalServerError('Failed to upload document', { error: error.message });
    }
  },

  /**
   * Sign a document
   * POST /api/documents/:id/sign
   */
  async signDocument(ctx) {
    try {
      const { id } = ctx.params;
      const { signature, signatureData } = ctx.request.body;
      const user = ctx.state.user;

      const document = await strapi.db.query('api::document.document').findOne({
        where: { id },
        populate: ['contract', 'uploadedBy']
      });

      if (!document) {
        return ctx.notFound('Document not found');
      }

      // Update document signature status
      const currentSignatures = document.signatureStatus || {};
      currentSignatures[user.id] = {
        userId: user.id,
        userEmail: user.email,
        signature: signature,
        signedAt: new Date().toISOString(),
        ipAddress: ctx.request.ip,
        userAgent: ctx.request.header['user-agent'],
        signatureData: signatureData || null
      };

      const updatedDocument = await strapi.db.query('api::document.document').update({
        where: { id },
        data: {
          signatureStatus: currentSignatures,
          status: 'signed', // You might want to check if all required signatures are present
        },
      });

      // Log the signing event
      strapi.log.info(`Document signed: ${document.title} by user ${user.email}`);

      return ctx.send({
        data: updatedDocument,
        meta: {
          signedBy: user.email,
          signedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      strapi.log.error('Error signing document:', error);
      return ctx.internalServerError('Failed to sign document', { error: error.message });
    }
  },

  /**
   * Download document
   * GET /api/documents/:id/download
   */
  async downloadDocument(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      const document = await strapi.db.query('api::document.document').findOne({
        where: { id },
      });

      if (!document) {
        return ctx.notFound('Document not found');
      }

      const filePath = path.join(strapi.dirs.static.public, document.fileUrl);
      
      try {
        await fs.access(filePath);
        
        // Update access log
        const accessLog = document.accessLog || [];
        accessLog.push({
          userId: user.id,
          userEmail: user.email,
          action: 'download',
          timestamp: new Date().toISOString(),
          ipAddress: ctx.request.ip,
          userAgent: ctx.request.header['user-agent']
        });

        await strapi.db.query('api::document.document').update({
          where: { id },
          data: { accessLog }
        });

        // Set appropriate headers
        ctx.set('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
        ctx.set('Content-Type', document.fileType);
        
        // Send file
        ctx.body = await fs.readFile(filePath);
        
        strapi.log.info(`Document downloaded: ${document.title} by user ${user.email}`);
        
      } catch (fileError) {
        strapi.log.error('File not found on disk:', filePath);
        return ctx.notFound('File not found on server');
      }

    } catch (error) {
      strapi.log.error('Error downloading document:', error);
      return ctx.internalServerError('Failed to download document', { error: error.message });
    }
  }
}));