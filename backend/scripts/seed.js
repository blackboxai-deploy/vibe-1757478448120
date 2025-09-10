#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Sample base64 PDF document (simple test PDF)
const samplePdfBase64 = 'data:application/pdf;base64,JVBERi0xLjMKJeXi5OT5CjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL091dGxpbmVzIDIgMCBSCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvT3V0bGluZXMKL0NvdW50IDAKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFs0IDAgUl0KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgo+PgplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEyMCAwMDAwMCBuIAowMDAwMDAwMTc3IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjI5CiUlRU9G';

/**
 * Seed script for Legal Contracts Management System
 * Creates initial data for testing and development
 */

async function createSeedData() {
  console.log('🌱 Starting seed process...');
  
  try {
    // Initialize Strapi
    const Strapi = require('@strapi/strapi');
    const app = Strapi({ 
      distDir: path.resolve(__dirname, '../dist'),
      appDir: path.resolve(__dirname, '..'),
    });
    
    await app.load();
    
    console.log('✅ Strapi loaded successfully');

    // Create roles first
    await createRoles(app);
    
    // Create admin user
    const adminUser = await createAdminUser(app);
    
    // Create sample users
    const users = await createSampleUsers(app);
    
    // Create categories and tags
    const { categories, subcategories, tags } = await createTaxonomy(app);
    
    // Create attribute definitions
    await createAttributeDefinitions(app);
    
    // Create sample projects
    const projects = await createSampleProjects(app, users);
    
    // Create sample contracts
    const contracts = await createSampleContracts(app, projects, users, categories, subcategories, tags);
    
    // Create sample documents with base64 upload
    await createSampleDocuments(app, contracts, users);
    
    // Create sample notes
    await createSampleNotes(app, projects, contracts, users);
    
    console.log('🎉 Seed process completed successfully!');
    console.log('');
    console.log('📝 Sample data created:');
    console.log('  - Admin user: admin@example.com / Admin123!');
    console.log('  - Legal user: legal@example.com / Legal123!');
    console.log('  - Viewer user: viewer@example.com / Viewer123!');
    console.log('  - 3 Projects with contracts and documents');
    console.log('  - Categories, subcategories, and tags');
    console.log('  - Sample notes and audit logs');
    console.log('');
    console.log('🚀 You can now start the Strapi server and access the admin panel');
    
    // Exit process
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

async function createRoles(strapi) {
  console.log('📋 Creating roles and permissions...');
  
  const roles = [
    {
      name: 'SuperAdmin',
      description: 'Complete system access',
      type: 'superadmin'
    },
    {
      name: 'Admin', 
      description: 'Administrative access',
      type: 'admin'
    },
    {
      name: 'Legal',
      description: 'Full access to legal content',
      type: 'legal'
    },
    {
      name: 'Viewer',
      description: 'Read-only access',
      type: 'viewer'
    },
    {
      name: 'Auditor',
      description: 'Audit logs access',
      type: 'auditor'
    }
  ];

  for (const roleData of roles) {
    const existingRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { name: roleData.name }
    });
    
    if (!existingRole) {
      await strapi.db.query('plugin::users-permissions.role').create({
        data: roleData
      });
      console.log(`  ✅ Created role: ${roleData.name}`);
    }
  }
}

async function createAdminUser(strapi) {
  console.log('👤 Creating admin user...');
  
  const adminRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'superadmin' }
  });
  
  const existingAdmin = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { email: 'admin@example.com' }
  });
  
  if (!existingAdmin) {
    const hashedPassword = await strapi.plugins['users-permissions'].services.user.hashPassword({
      password: 'Admin123!'
    });
    
    const admin = await strapi.db.query('plugin::users-permissions.user').create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        confirmed: true,
        blocked: false,
        firstName: 'System',
        lastName: 'Administrator',
        role: adminRole.id,
        provider: 'local'
      }
    });
    
    console.log('  ✅ Admin user created: admin@example.com / Admin123!');
    return admin;
  }
  
  console.log('  ℹ️ Admin user already exists');
  return existingAdmin;
}

async function createSampleUsers(strapi) {
  console.log('👥 Creating sample users...');
  
  const legalRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { name: 'Legal' }
  });
  
  const viewerRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { name: 'Viewer' }
  });
  
  const users = [];
  
  const sampleUsers = [
    {
      username: 'legal.manager',
      email: 'legal@example.com',
      password: 'Legal123!',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      role: legalRole.id,
      department: 'Legal',
      position: 'Senior Legal Counsel'
    },
    {
      username: 'contract.viewer',
      email: 'viewer@example.com', 
      password: 'Viewer123!',
      firstName: 'John',
      lastName: 'Smith',
      role: viewerRole.id,
      department: 'Operations',
      position: 'Project Manager'
    }
  ];
  
  for (const userData of sampleUsers) {
    const existing = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: userData.email }
    });
    
    if (!existing) {
      const hashedPassword = await strapi.plugins['users-permissions'].services.user.hashPassword({
        password: userData.password
      });
      
      const user = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          ...userData,
          password: hashedPassword,
          confirmed: true,
          blocked: false,
          provider: 'local'
        }
      });
      
      users.push(user);
      console.log(`  ✅ Created user: ${userData.email}`);
    }
  }
  
  return users;
}

async function createTaxonomy(strapi) {
  console.log('🏷️ Creating categories, subcategories, and tags...');
  
  const categories = [];
  const subcategories = [];
  const tags = [];
  
  // Create categories
  const categoryData = [
    { name: 'Service Agreements', color: '#3B82F6', icon: 'handshake' },
    { name: 'Employment', color: '#10B981', icon: 'users' },
    { name: 'Vendor Contracts', color: '#F59E0B', icon: 'truck' },
    { name: 'Real Estate', color: '#8B5CF6', icon: 'building' }
  ];
  
  for (const catData of categoryData) {
    const category = await strapi.db.query('api::category.category').create({
      data: { ...catData, publishedAt: new Date() }
    });
    categories.push(category);
  }
  
  // Create subcategories
  const subcategoryData = [
    { name: 'Software Development', categoryId: categories[0].id },
    { name: 'Consulting Services', categoryId: categories[0].id },
    { name: 'Full-time Employment', categoryId: categories[1].id },
    { name: 'Independent Contractor', categoryId: categories[1].id }
  ];
  
  for (const subData of subcategoryData) {
    const subcategory = await strapi.db.query('api::subcategory.subcategory').create({
      data: {
        name: subData.name,
        category: subData.categoryId,
        color: '#6B7280',
        publishedAt: new Date()
      }
    });
    subcategories.push(subcategory);
  }
  
  // Create tags
  const tagData = [
    { name: 'urgent', color: '#EF4444' },
    { name: 'high-value', color: '#F59E0B' },
    { name: 'recurring', color: '#10B981' },
    { name: 'confidential', color: '#8B5CF6' },
    { name: 'template', color: '#6B7280' }
  ];
  
  for (const tagDataItem of tagData) {
    const tag = await strapi.db.query('api::tag.tag').create({
      data: { ...tagDataItem, publishedAt: new Date() }
    });
    tags.push(tag);
  }
  
  console.log('  ✅ Created taxonomy structure');
  return { categories, subcategories, tags };
}

async function createAttributeDefinitions(strapi) {
  console.log('⚙️ Creating attribute definitions...');
  
  const attributeDefinitions = [
    {
      name: 'contract_value_range',
      label: 'Contract Value Range',
      fieldType: 'select',
      dataType: 'string',
      entityType: 'contract',
      options: JSON.stringify({
        choices: [
          { value: '0-10k', label: 'Under $10,000' },
          { value: '10k-50k', label: '$10,000 - $50,000' },
          { value: '50k-100k', label: '$50,000 - $100,000' },
          { value: '100k+', label: 'Over $100,000' }
        ]
      }),
      isSearchable: true,
      isFilterable: true,
      displayOrder: 1,
      groupName: 'Financial'
    },
    {
      name: 'risk_assessment',
      label: 'Risk Assessment',
      fieldType: 'select',
      dataType: 'string', 
      entityType: 'contract',
      options: JSON.stringify({
        choices: [
          { value: 'low', label: 'Low Risk' },
          { value: 'medium', label: 'Medium Risk' },
          { value: 'high', label: 'High Risk' },
          { value: 'critical', label: 'Critical Risk' }
        ]
      }),
      isRequired: true,
      displayOrder: 2,
      groupName: 'Risk Management'
    }
  ];
  
  for (const attrData of attributeDefinitions) {
    await strapi.db.query('api::attribute-definition.attribute-definition').create({
      data: { ...attrData, publishedAt: new Date() }
    });
  }
  
  console.log('  ✅ Created attribute definitions');
}

async function createSampleProjects(strapi, users) {
  console.log('📁 Creating sample projects...');
  
  const projects = [];
  
  const projectData = [
    {
      title: 'Enterprise Software License Agreement',
      description: 'Comprehensive software licensing project for Fortune 500 client',
      client: 'TechCorp Industries',
      clientContact: JSON.stringify({
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0123'
      }),
      projectManager: users[0]?.id,
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      budget: 150000.00
    },
    {
      title: 'Vendor Services Agreement',
      description: 'Multi-vendor service agreements for operational support',
      client: 'Global Manufacturing Co',
      clientContact: JSON.stringify({
        name: 'Michael Chen',
        email: 'michael.chen@globalmanuf.com',
        phone: '+1-555-0124'
      }),
      projectManager: users[1]?.id,
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      budget: 75000.00
    },
    {
      title: 'Employment Contract Templates',
      description: 'Standardization of employment contracts across all departments',
      client: 'Internal - HR Department',
      clientContact: JSON.stringify({
        name: 'Jennifer Williams',
        email: 'jennifer.williams@company.com',
        phone: '+1-555-0125'
      }),
      status: 'completed',
      priority: 'medium',
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-01-31'),
      budget: 25000.00
    }
  ];
  
  for (const projData of projectData) {
    const project = await strapi.db.query('api::project.project').create({
      data: { ...projData, publishedAt: new Date() }
    });
    projects.push(project);
  }
  
  console.log('  ✅ Created sample projects');
  return projects;
}

async function createSampleContracts(strapi, projects, users, categories, subcategories, tags) {
  console.log('📄 Creating sample contracts...');
  
  const contracts = [];
  
  const contractData = [
    {
      title: 'Software License Agreement - Enterprise Edition',
      description: 'Primary software licensing contract with extended support terms',
      contractNumber: 'SLA-2024-001',
      type: 'license',
      status: 'signed',
      priority: 'high',
      project: projects[0]?.id,
      assignedTo: users[0]?.id,
      value: 120000.00,
      currency: 'USD',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      customAttributes: JSON.stringify({
        contract_value_range: '100k+',
        risk_assessment: 'medium'
      })
    },
    {
      title: 'Vendor Service Agreement - IT Support',
      description: 'Comprehensive IT support services agreement',
      contractNumber: 'VSA-2024-002',
      type: 'service_agreement',
      status: 'review',
      priority: 'medium',
      project: projects[1]?.id,
      assignedTo: users[0]?.id,
      value: 45000.00,
      currency: 'USD',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-12-31'),
      customAttributes: JSON.stringify({
        contract_value_range: '10k-50k',
        risk_assessment: 'low'
      })
    },
    {
      title: 'Senior Developer Employment Contract',
      description: 'Full-time employment contract template for senior developers',
      contractNumber: 'EMP-2024-003',
      type: 'employment',
      status: 'approved',
      priority: 'medium',
      project: projects[2]?.id,
      customAttributes: JSON.stringify({
        risk_assessment: 'low'
      })
    }
  ];
  
  for (let i = 0; i < contractData.length; i++) {
    const contract = await strapi.db.query('api::contract.contract').create({
      data: { 
        ...contractData[i], 
        publishedAt: new Date(),
        categories: [categories[i % categories.length]?.id].filter(Boolean),
        tags: [tags[i % tags.length]?.id].filter(Boolean)
      }
    });
    contracts.push(contract);
  }
  
  console.log('  ✅ Created sample contracts');
  return contracts;
}

async function createSampleDocuments(strapi, contracts, users) {
  console.log('📎 Creating sample documents via base64 upload...');
  
  const documents = [];
  
  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i];
    const user = users[i % users.length];
    
    try {
      // Simulate base64 upload by calling the controller directly
      const documentData = {
        name: `${contract.contractNumber}_main_document.pdf`,
        description: `Main contract document for ${contract.title}`,
        documentType: 'contract',
        contractId: contract.id
      };
      
      // Create document manually (simulating the upload)
      const buffer = Buffer.from(samplePdfBase64.split(',')[1], 'base64');
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
      const timestamp = Date.now();
      const fileName = `${timestamp}-${contract.contractNumber}.pdf`;
      
      const document = await strapi.db.query('api::document.document').create({
        data: {
          title: documentData.name,
          description: documentData.description,
          fileName: fileName,
          originalFileName: documentData.name,
          fileType: 'application/pdf',
          fileSize: buffer.length,
          fileUrl: `/uploads/${fileName}`,
          documentType: documentData.documentType,
          status: 'draft',
          version: '1.0',
          contract: contract.id,
          uploadedBy: user?.id,
          checksum: checksum,
          metadata: JSON.stringify({
            uploadMethod: 'seed_script',
            originalSize: samplePdfBase64.length,
            compressionRatio: buffer.length / samplePdfBase64.length
          }),
          publishedAt: new Date()
        }
      });
      
      documents.push(document);
      
      // Create initial version
      await strapi.db.query('api::document-version.document-version').create({
        data: {
          versionNumber: '1.0',
          title: documentData.name,
          description: 'Initial version from seed script',
          fileName: fileName,
          fileType: 'application/pdf',
          fileSize: buffer.length,
          fileUrl: `/uploads/${fileName}`,
          document: document.id,
          createdBy: user?.id,
          status: 'draft',
          isActive: true,
          checksum: checksum,
          publishedAt: new Date()
        }
      });
      
    } catch (error) {
      console.warn(`    ⚠️ Failed to create document for contract ${contract.contractNumber}:`, error.message);
    }
  }
  
  console.log(`  ✅ Created ${documents.length} sample documents`);
  return documents;
}

async function createSampleNotes(strapi, projects, contracts, users) {
  console.log('📝 Creating sample notes...');
  
  const notes = [];
  
  const noteData = [
    {
      title: 'Contract Review Feedback',
      content: 'Initial review completed. Terms look favorable but need clarification on liability clauses in section 7.3.',
      type: 'review',
      priority: 'high',
      author: users[0]?.id,
      contract: contracts[0]?.id,
      project: projects[0]?.id
    },
    {
      content: 'Client meeting scheduled for next Tuesday to discuss contract modifications. Need to prepare amendment proposals.',
      type: 'meeting',
      priority: 'medium',
      author: users[1]?.id,
      contract: contracts[1]?.id,
      project: projects[1]?.id
    },
    {
      title: 'Template Approved',
      content: 'HR has approved the new employment contract template. Ready for implementation across all departments.',
      type: 'approval',
      priority: 'medium',
      author: users[0]?.id,
      project: projects[2]?.id,
      isResolved: true,
      resolvedBy: users[0]?.id,
      resolvedAt: new Date()
    }
  ];
  
  for (const noteDataItem of noteData) {
    const note = await strapi.db.query('api::note.note').create({
      data: { ...noteDataItem, publishedAt: new Date() }
    });
    notes.push(note);
  }
  
  console.log('  ✅ Created sample notes');
  return notes;
}

// Run seed script
if (require.main === module) {
  createSeedData();
}

module.exports = { createSeedData };