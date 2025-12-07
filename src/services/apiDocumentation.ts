/**
 * AgriScore Dashboard API Documentation
 * Generated with OpenAPI 3.0 Specification
 * 
 * This document describes all available REST API endpoints
 */

export const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'AgriScore Dashboard API',
    description: 'Smart Agriculture Management Platform API',
    version: '1.0.0',
    contact: {
      name: 'AgriScore Team',
      email: 'support@agriscore.com'
    }
  },
  servers: [
    {
      url: 'https://api.agriscore.com/v1',
      description: 'Production Server'
    },
    {
      url: 'http://localhost:3001',
      description: 'Development Server'
    }
  ],
  paths: {
    '/auth/signup': {
      post: {
        summary: 'User Registration',
        description: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User created successfully' },
          400: { description: 'Invalid input' },
          409: { description: 'User already exists' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'User Login',
        description: 'Authenticate user with email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful, returns JWT token' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/2fa/enable': {
      post: {
        summary: 'Enable Two-Factor Authentication',
        description: 'Enable 2FA for enhanced security',
        tags: ['Authentication', 'Security'],
        responses: {
          200: { description: 'Returns QR code and secret for authenticator' },
          400: { description: 'Error enabling 2FA' }
        }
      }
    },
    '/profile': {
      get: {
        summary: 'Get User Profile',
        description: 'Retrieve current user profile information',
        tags: ['Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile data' },
          401: { description: 'Unauthorized' }
        }
      },
      put: {
        summary: 'Update User Profile',
        description: 'Update user profile information',
        tags: ['Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  location: { type: 'string' },
                  farmName: { type: 'string' },
                  language: { type: 'string' },
                  timezone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated successfully' },
          400: { description: 'Invalid data' }
        }
      }
    },
    '/weather': {
      get: {
        summary: 'Get Weather Data',
        description: 'Fetch real-time weather data for location',
        tags: ['Weather'],
        parameters: [
          {
            name: 'latitude',
            in: 'query',
            required: true,
            schema: { type: 'number' }
          },
          {
            name: 'longitude',
            in: 'query',
            required: true,
            schema: { type: 'number' }
          }
        ],
        responses: {
          200: { description: 'Weather data' },
          400: { description: 'Invalid coordinates' }
        }
      }
    },
    '/weather/forecast': {
      get: {
        summary: 'Get Weather Forecast',
        description: 'Get 7-day weather forecast',
        tags: ['Weather'],
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'days', in: 'query', schema: { type: 'integer', default: 7 } }
        ],
        responses: {
          200: { description: 'Forecast data' }
        }
      }
    },
    '/weather/alerts': {
      get: {
        summary: 'Get Agricultural Alerts',
        description: 'Get weather-based agricultural alerts and recommendations',
        tags: ['Weather', 'Agriculture'],
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number' } },
          { name: 'cropType', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Alerts and recommendations' }
        }
      }
    },
    '/reports/export/pdf': {
      post: {
        summary: 'Export Farm Report as PDF',
        description: 'Generate and download farm report in PDF format',
        tags: ['Reports', 'Export'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  farmId: { type: 'string' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'PDF file generated' },
          404: { description: 'Farm not found' }
        }
      }
    },
    '/reports/export/excel': {
      post: {
        summary: 'Export Farm Data as Excel',
        description: 'Generate and download farm data in Excel format',
        tags: ['Reports', 'Export'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Excel file generated' }
        }
      }
    },
    '/analytics': {
      get: {
        summary: 'Get User Analytics',
        description: 'Retrieve user activity analytics',
        tags: ['Analytics'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'period', in: 'query', schema: { type: 'string', enum: ['7d', '30d', '90d'] } }
        ],
        responses: {
          200: { description: 'Analytics data' }
        }
      }
    },
    '/analytics/activity': {
      get: {
        summary: 'Get Activity History',
        description: 'Retrieve user activity logs',
        tags: ['Analytics'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }
        ],
        responses: {
          200: { description: 'Activity logs' }
        }
      }
    },
    '/documents': {
      get: {
        summary: 'List Documents',
        description: 'List all documents in user document locker',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of documents' }
        }
      },
      post: {
        summary: 'Upload Document',
        description: 'Upload a document to document locker',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Document uploaded' },
          413: { description: 'File too large' }
        }
      }
    },
    '/team/members': {
      get: {
        summary: 'Get Team Members',
        description: 'List all team members',
        tags: ['Team'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Team members list' }
        }
      },
      post: {
        summary: 'Invite Team Member',
        description: 'Send invitation to new team member',
        tags: ['Team'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['viewer', 'editor', 'admin'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Invitation sent' },
          400: { description: 'Invalid email' }
        }
      }
    },
    '/notifications': {
      get: {
        summary: 'Get Notifications',
        description: 'Retrieve user notifications',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          200: { description: 'Notifications list' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          location: { type: 'string' },
          farmName: { type: 'string' },
          language: { type: 'string' },
          timezone: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      WeatherData: {
        type: 'object',
        properties: {
          temperature: { type: 'number' },
          humidity: { type: 'number' },
          windSpeed: { type: 'number' },
          condition: { type: 'string' },
          lastUpdated: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints'
    },
    {
      name: 'Profile',
      description: 'User profile management'
    },
    {
      name: 'Weather',
      description: 'Weather data and forecasts'
    },
    {
      name: 'Reports',
      description: 'Report generation and export'
    },
    {
      name: 'Analytics',
      description: 'User activity analytics'
    },
    {
      name: 'Documents',
      description: 'Document management'
    },
    {
      name: 'Team',
      description: 'Team management'
    }
  ]
};

/**
 * Generate API documentation HTML
 */
export const getAPIDocumentationHTML = (): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>AgriScore API Documentation</title>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Roboto', sans-serif;
          line-height: 1.6;
          color: #333;
        }
        header {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        header p {
          font-size: 1.1em;
          opacity: 0.9;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .section {
          margin-bottom: 40px;
        }
        .section h2 {
          color: #22c55e;
          margin-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }
        .endpoint {
          background: #f9f9f9;
          border-left: 4px solid #22c55e;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .endpoint-title {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .method {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 3px;
          font-weight: bold;
          margin-right: 10px;
          color: white;
        }
        .method.get { background: #3b82f6; }
        .method.post { background: #22c55e; }
        .method.put { background: #f59e0b; }
        .method.delete { background: #ef4444; }
        .description {
          margin-top: 10px;
          color: #666;
        }
        code {
          background: #e5e7eb;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        footer {
          background: #f3f4f6;
          padding: 20px;
          text-align: center;
          color: #666;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>🌾 AgriScore Dashboard API</h1>
        <p>Smart Agriculture Management Platform</p>
      </header>
      
      <div class="container">
        <div class="section">
          <h2>📖 API Overview</h2>
          <p>AgriScore Dashboard provides a comprehensive REST API for managing farms, weather data, reports, and user analytics.</p>
          <p style="margin-top: 10px;"><strong>Base URL:</strong> <code>https://api.agriscore.com/v1</code></p>
          <p style="margin-top: 10px;"><strong>Authentication:</strong> Bearer Token (JWT)</p>
        </div>

        <div class="section">
          <h2>🔐 Authentication Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method post">POST</span> /auth/signup</div>
            <div class="description">Register a new user account</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method post">POST</span> /auth/login</div>
            <div class="description">Authenticate user with email and password</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method post">POST</span> /auth/2fa/enable</div>
            <div class="description">Enable two-factor authentication</div>
          </div>
        </div>

        <div class="section">
          <h2>👤 Profile Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /profile</div>
            <div class="description">Get user profile information</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method put">PUT</span> /profile</div>
            <div class="description">Update user profile information</div>
          </div>
        </div>

        <div class="section">
          <h2>🌤️ Weather Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /weather</div>
            <div class="description">Get real-time weather data for coordinates</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /weather/forecast</div>
            <div class="description">Get 7-day weather forecast</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /weather/alerts</div>
            <div class="description">Get agricultural alerts and recommendations</div>
          </div>
        </div>

        <div class="section">
          <h2>📊 Report & Export Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method post">POST</span> /reports/export/pdf</div>
            <div class="description">Export farm report as PDF</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method post">POST</span> /reports/export/excel</div>
            <div class="description">Export farm data as Excel spreadsheet</div>
          </div>
        </div>

        <div class="section">
          <h2>📈 Analytics Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /analytics</div>
            <div class="description">Get user analytics dashboard</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /analytics/activity</div>
            <div class="description">Get activity history logs</div>
          </div>
        </div>

        <div class="section">
          <h2>📄 Document Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /documents</div>
            <div class="description">List all documents</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method post">POST</span> /documents</div>
            <div class="description">Upload a new document</div>
          </div>
        </div>

        <div class="section">
          <h2>👥 Team Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /team/members</div>
            <div class="description">List team members</div>
          </div>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method post">POST</span> /team/members</div>
            <div class="description">Invite new team member</div>
          </div>
        </div>

        <div class="section">
          <h2>🔔 Notification Endpoints</h2>
          <div class="endpoint">
            <div class="endpoint-title"><span class="method get">GET</span> /notifications</div>
            <div class="description">Get user notifications</div>
          </div>
        </div>

        <div class="section">
          <h2>📦 Response Format</h2>
          <p>All responses are in JSON format. Successful responses return a 200 status code with the following structure:</p>
          <code style="display: block; padding: 15px; margin-top: 10px; background: #f3f4f6; border-radius: 4px;">
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
          </code>
        </div>

        <div class="section">
          <h2>❌ Error Responses</h2>
          <p>Error responses include appropriate HTTP status codes:</p>
          <ul style="margin-left: 20px; margin-top: 10px;">
            <li>400 - Bad Request (invalid parameters)</li>
            <li>401 - Unauthorized (missing/invalid token)</li>
            <li>403 - Forbidden (insufficient permissions)</li>
            <li>404 - Not Found</li>
            <li>500 - Server Error</li>
          </ul>
        </div>

        <div class="section">
          <h2>🚀 Getting Started</h2>
          <ol style="margin-left: 20px; margin-top: 10px;">
            <li>Sign up for an account via <code>/auth/signup</code></li>
            <li>Log in via <code>/auth/login</code> to receive JWT token</li>
            <li>Include token in Authorization header: <code>Authorization: Bearer {token}</code></li>
            <li>Make requests to available endpoints</li>
          </ol>
        </div>
      </div>

      <footer>
        <p>&copy; 2025 AgriScore Dashboard. All rights reserved.</p>
        <p>API Version 1.0.0 | <a href="/api-docs/swagger">View Swagger UI</a></p>
      </footer>
    </body>
    </html>
  `;
};
