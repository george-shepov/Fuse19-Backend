const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fuse19 Backend API',
      version: '1.0.0',
      description: `
        A comprehensive backend API for the Fuse19 application built with Node.js, Express, and MongoDB.
        
        ## Features
        - **Authentication & Authorization**: JWT-based auth with refresh tokens
        - **Email Verification**: Automated email verification system
        - **Password Security**: Advanced password strength validation
        - **File Management**: File upload with image processing
        - **Real-time Communication**: Socket.io integration for chat and notifications
        - **Data Management**: Full CRUD operations for users, notes, tasks, contacts
        - **Security**: Rate limiting, CORS, helmet security headers
        
        ## Getting Started
        1. Register a new account or login with existing credentials
        2. Verify your email address (check your inbox)
        3. Start using the API endpoints
        
        ## Authentication
        Most endpoints require authentication. Include the JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
      `,
      contact: {
        name: 'Fuse19 Backend Support',
        email: 'support@fuse19.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.fuse19.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        },
        refreshToken: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: '60d21b4667d0d8992e610c85'
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Full name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (must be unique)',
              example: 'john.doe@example.com'
            },
            avatar: {
              type: 'string',
              nullable: true,
              description: 'URL to user avatar image',
              example: 'https://example.com/avatars/john.jpg'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'moderator'],
              default: 'user',
              description: 'User role in the system'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              default: 'active',
              description: 'Current status of the user account'
            },
            isEmailVerified: {
              type: 'boolean',
              default: false,
              description: 'Whether the user has verified their email address'
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Timestamp of last login'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last account update timestamp'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password',
              example: 'SecurePass123!'
            },
            rememberMe: {
              type: 'boolean',
              default: false,
              description: 'Whether to extend token expiration'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Full name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (must be unique)',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Strong password meeting security requirements',
              example: 'SecurePass123!'
            },
            confirmPassword: {
              type: 'string',
              description: 'Password confirmation (optional)',
              example: 'SecurePass123!'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                accessToken: {
                  type: 'string',
                  description: 'JWT access token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  description: 'Refresh token for getting new access tokens',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid credentials'
            },
            error: {
              type: 'string',
              description: 'Error code',
              example: 'INVALID_CREDENTIALS'
            },
            details: {
              type: 'object',
              description: 'Additional error details',
              nullable: true
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            error: {
              type: 'string',
              example: 'VALIDATION_ERROR'
            },
            details: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['Email is required', 'Password must be at least 8 characters']
                }
              }
            }
          }
        },
        PasswordStrength: {
          type: 'object',
          properties: {
            isValid: {
              type: 'boolean',
              description: 'Whether password meets requirements'
            },
            score: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Password strength score (0-100)'
            },
            strength: {
              type: 'object',
              properties: {
                level: {
                  type: 'string',
                  enum: ['weak', 'fair', 'good', 'strong'],
                  description: 'Strength level'
                },
                label: {
                  type: 'string',
                  description: 'Human-readable strength label'
                },
                color: {
                  type: 'string',
                  description: 'Color code for UI display'
                },
                description: {
                  type: 'string',
                  description: 'Strength description'
                }
              }
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Validation errors that must be fixed'
            },
            warnings: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Warnings to improve password security'
            },
            suggestions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Suggestions for improving password'
            }
          }
        },
        Contact: {
          type: 'object',
          required: ['firstName', 'lastName'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique contact identifier'
            },
            firstName: {
              type: 'string',
              maxLength: 50,
              description: 'Contact first name'
            },
            lastName: {
              type: 'string',
              maxLength: 50,
              description: 'Contact last name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email address'
            },
            phone: {
              type: 'string',
              description: 'Contact phone number'
            },
            company: {
              type: 'string',
              description: 'Company name'
            },
            position: {
              type: 'string',
              description: 'Job position'
            },
            avatar: {
              type: 'string',
              description: 'Avatar image URL'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Contact tags'
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Additional notes about the contact'
            }
          }
        },
        Note: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique note identifier'
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Note title'
            },
            content: {
              type: 'string',
              description: 'Note content (supports markdown)'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Note tags for organization'
            },
            isArchived: {
              type: 'boolean',
              default: false,
              description: 'Whether the note is archived'
            },
            isPinned: {
              type: 'boolean',
              default: false,
              description: 'Whether the note is pinned'
            },
            createdBy: {
              type: 'string',
              description: 'ID of the user who created the note'
            }
          }
        },
        Task: {
          type: 'object',
          required: ['title'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique task identifier'
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Task title'
            },
            description: {
              type: 'string',
              description: 'Task description'
            },
            completed: {
              type: 'boolean',
              default: false,
              description: 'Whether the task is completed'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              default: 'medium',
              description: 'Task priority level'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Task due date'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Task tags'
            },
            assignedTo: {
              type: 'string',
              nullable: true,
              description: 'ID of the user assigned to the task'
            }
          }
        },
        FileUpload: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique file identifier'
            },
            originalName: {
              type: 'string',
              description: 'Original filename'
            },
            filename: {
              type: 'string',
              description: 'Stored filename'
            },
            mimetype: {
              type: 'string',
              description: 'File MIME type'
            },
            size: {
              type: 'integer',
              description: 'File size in bytes'
            },
            url: {
              type: 'string',
              description: 'URL to access the file'
            },
            thumbnailUrl: {
              type: 'string',
              nullable: true,
              description: 'URL to file thumbnail (for images)'
            },
            category: {
              type: 'string',
              enum: ['image', 'video', 'document', 'other'],
              description: 'File category'
            },
            isPublic: {
              type: 'boolean',
              default: false,
              description: 'Whether the file is publicly accessible'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'File tags'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Insufficient permissions',
                error: 'FORBIDDEN'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found',
                error: 'NOT_FOUND'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Password',
        description: 'Password strength validation and utilities'
      },
      {
        name: 'Files',
        description: 'File upload and management'
      },
      {
        name: 'Contacts',
        description: 'Contact management operations'
      },
      {
        name: 'Notes',
        description: 'Note-taking and management'
      },
      {
        name: 'Tasks',
        description: 'Task and project management'
      },
      {
        name: 'Chat',
        description: 'Real-time messaging and chat'
      },
      {
        name: 'Common',
        description: 'Common utilities and shared resources'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

const swaggerConfig = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #4F46E5; }
    .swagger-ui .scheme-container { background: #f8fafc; }
  `,
  customSiteTitle: 'Fuse19 Backend API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerConfig
};