import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Legal Contracts Manager</h1>
            </div>
            <div className="text-sm text-gray-500">Demo Version</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Contratos Legales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Plataforma profesional para la gestión completa de contratos legales con 
            Strapi (MySQL) + Frontend Vite+React+Tailwind
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Proyecto Implementado Completamente</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Backend (Strapi + MySQL)</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ 11 Content Types personalizados</li>
                  <li>✅ Autenticación JWT + Refresh Tokens</li>
                  <li>✅ Upload base64 con endpoint custom</li>
                  <li>✅ Middleware de audit logging</li>
                  <li>✅ Email SMTP + generación de passwords</li>
                  <li>✅ 5 Roles con permisos granulares</li>
                  <li>✅ Script de seed con datos ejemplo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Frontend (Vite + React + Tailwind)</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Páginas completas y responsive</li>
                  <li>✅ Manejo automático de tokens</li>
                  <li>✅ Upload de archivos base64</li>
                  <li>✅ Sidebar colapsable</li>
                  <li>✅ Diseño mobile-first</li>
                  <li>✅ Servicios API con interceptores</li>
                  <li>✅ TypeScript + tipos completos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🗄️</span>
              Backend Architecture
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>Strapi v4</strong> con MySQL como base de datos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>11 Content Types:</strong> project, contract, document, document-version, note, attribute-definition, category, subcategory, tag, audit-log, refresh-token</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>Endpoints personalizados:</strong> /auth/refresh, /auth/logout, /documents/upload-base64, /users/:id/generate-password</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span><strong>Seguridad:</strong> JWT con refresh tokens, permisos granulares, audit completo</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">💻</span>
              Frontend Architecture
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span><strong>Vite + React + TypeScript</strong> con Tailwind CSS</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span><strong>Páginas:</strong> Dashboard, Projects, Contracts, Documents, Users, Attributes, Categories, Tags, Audit Logs, Settings</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span><strong>Servicios:</strong> API service con interceptores, Auth service, File service con base64</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span><strong>UI/UX:</strong> Diseño responsive, sidebar colapsable, componentes reutilizables</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Funcionalidades Clave</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">📄</div>
              <h4 className="font-semibold text-gray-900 mb-2">Gestión de Contratos</h4>
              <p className="text-sm text-gray-600">Ciclo completo de contratos con estados, versionado, firmas digitales y seguimiento de compliance.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">📎</div>
              <h4 className="font-semibold text-gray-900 mb-2">Upload Base64</h4>
              <p className="text-sm text-gray-600">Sistema de carga de archivos mediante conversión base64 con versioning y checksums automáticos.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">🔐</div>
              <h4 className="font-semibold text-gray-900 mb-2">Seguridad Avanzada</h4>
              <p className="text-sm text-gray-600">Autenticación JWT con refresh tokens, roles granulares y audit logging completo.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="font-semibold text-gray-900 mb-2">Gestión de Usuarios</h4>
              <p className="text-sm text-gray-600">5 roles predefinidos con generación automática de contraseñas y envío por email.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Audit Trail</h4>
              <p className="text-sm text-gray-600">Registro completo de todas las actividades del sistema para compliance y auditoría.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Campos Dinámicos</h4>
              <p className="text-sm text-gray-600">Sistema de attribute-definitions para formularios dinámicos y customización.</p>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-gray-900 text-white rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Implementación Técnica Completa</h3>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-green-400 mb-3">✅ Backend Completado</h4>
              <ul className="space-y-2 text-sm">
                <li>• Configuración MySQL con schemas optimizados</li>
                <li>• Content types con relaciones complejas</li>
                <li>• Controllers custom para upload-base64</li>
                <li>• Middleware de audit logging automático</li>
                <li>• Plugin de email con templates HTML</li>
                <li>• Extensiones de users-permissions</li>
                <li>• Script de seed con datos realistas</li>
                <li>• Configuración CORS y seguridad</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">✅ Frontend Completado</h4>
              <ul className="space-y-2 text-sm">
                <li>• Layout responsive con sidebar colapsable</li>
                <li>• Páginas funcionales para todas las entidades</li>
                <li>• Servicios API con manejo automático de tokens</li>
                <li>• Upload de archivos con conversión base64</li>
                <li>• Tipos TypeScript completos</li>
                <li>• Componentes reutilizables con Tailwind</li>
                <li>• Interceptores Axios para refresh automático</li>
                <li>• Manejo de errores y loading states</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">👤 Cuentas Demo Disponibles</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Administrator</h4>
              <p className="text-sm text-blue-700 mt-1">admin@example.com / Admin123!</p>
              <p className="text-xs text-blue-600 mt-2">Acceso completo al sistema</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Legal Manager</h4>
              <p className="text-sm text-green-700 mt-1">legal@example.com / Legal123!</p>
              <p className="text-xs text-green-600 mt-2">Gestión de contratos y documentos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Viewer</h4>
              <p className="text-sm text-gray-700 mt-1">viewer@example.com / Viewer123!</p>
              <p className="text-xs text-gray-600 mt-2">Solo lectura del sistema</p>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🚀 Instrucciones de Setup</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Backend (Strapi)</h4>
              <div className="text-xs bg-green-100 p-3 rounded text-green-900 overflow-x-auto">
                <div>cd backend</div>
                <div>npm install</div>
                <div># Configurar MySQL y .env</div>
                <div>npm run develop</div>
                <div># En terminal separado:</div>
                <div>node scripts/seed.js</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Frontend (Vite)</h4>
              <div className="text-xs bg-green-100 p-3 rounded text-green-900 overflow-x-auto">
                <div>cd frontend</div>
                <div>npm install</div>
                <div># Configurar .env</div>
                <div>npm run dev</div>
                <div># http://localhost:5173</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded text-sm text-green-800">
            <strong>Nota:</strong> El proyecto incluye documentación completa en README.md con todos los detalles de configuración, 
            API endpoints, ejemplos de uso y troubleshooting.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium mb-2">Legal Contracts Management System</p>
          <p className="text-gray-400 text-sm">
            Sistema completo de gestión de contratos legales • Strapi + MySQL + React + TypeScript + Tailwind
          </p>
          <div className="mt-4 text-gray-500 text-xs">
            Desarrollado con ❤️ para gestión legal profesional
          </div>
        </div>
      </footer>
    </div>
  );
}