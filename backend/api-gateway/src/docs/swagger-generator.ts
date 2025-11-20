/**
 * OpenAPI 3.0 Specification Generator
 * Generates comprehensive API documentation for all IAC Dharma endpoints
 */

import { OpenAPIV3 } from 'openapi-types';

export const generateOpenAPISpec = (): any => {
  return {
    openapi: '3.0.0',
    info: {
      title: 'IAC Dharma API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for IAC Dharma - Infrastructure as Code platform with AI-powered architecture design, automated deployment, and intelligent governance.',
      contact: {
        name: 'IAC Dharma Team',
        email: 'support@iacdharma.io'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.iacdharma.io',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Blueprints', description: 'Architecture blueprint management' },
      { name: 'AI', description: 'AI-powered recommendations and analysis' },
      { name: 'IaC Generation', description: 'Infrastructure as Code generation' },
      { name: 'Costing', description: 'Cost estimation and TCO analysis' },
      { name: 'PM - Approvals', description: 'Project Manager - Deployment approvals' },
      { name: 'PM - Budget', description: 'Project Manager - Budget management' },
      { name: 'PM - Migrations', description: 'Project Manager - Cloud migration planning' },
      { name: 'PM - KPIs', description: 'Project Manager - KPI tracking' },
      { name: 'SE - Deployments', description: 'Software Engineer - Deployment execution' },
      { name: 'SE - Logs', description: 'Software Engineer - Deployment logs' },
      { name: 'SE - Incidents', description: 'Software Engineer - Incident management' },
      { name: 'SE - Health', description: 'Software Engineer - System health monitoring' },
      { name: 'EA - Policies', description: 'Enterprise Architect - Governance policies' },
      { name: 'EA - Patterns', description: 'Enterprise Architect - Architecture patterns' },
      { name: 'EA - Compliance', description: 'Enterprise Architect - Compliance management' },
      { name: 'EA - Cost Optimization', description: 'Enterprise Architect - Cost optimization' },
      { name: 'TA - IaC', description: 'Technical Architect - IaC management' },
      { name: 'TA - Guardrails', description: 'Technical Architect - Policy guardrails' },
      { name: 'SA - Blueprints', description: 'Solutions Architect - Blueprint design' },
      { name: 'SA - AI Recommendations', description: 'Solutions Architect - AI recommendations' }
    ],
    paths: {
      ...authPaths(),
      ...blueprintPaths(),
      ...aiPaths(),
      ...iacPaths(),
      ...costingPaths(),
      ...pmPaths(),
      ...sePaths(),
      ...eaPaths(),
      ...taPaths(),
      ...saPaths()
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        ...commonSchemas(),
        ...blueprintSchemas(),
        ...deploymentSchemas(),
        ...complianceSchemas(),
        ...budgetSchemas(),
        ...incidentSchemas()
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Unauthorized' },
                  message: { type: 'string', example: 'Invalid or missing authentication token' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Forbidden' },
                  message: { type: 'string', example: 'Insufficient permissions' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Not Found' },
                  message: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Validation Error' },
                  message: { type: 'string', example: 'Invalid request parameters' },
                  details: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  };
};

// Authentication paths
function authPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        description: 'Authenticate user and receive JWT token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'sa@test.com' },
                  password: { type: 'string', format: 'password', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        roles: { type: 'array', items: { type: 'string' }, example: ['SA', 'TA'] }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    },
    '/api/auth/sso/callback': {
      get: {
        tags: ['Authentication'],
        summary: 'SSO callback',
        description: 'Handle SSO authentication callback',
        security: [],
        parameters: [
          {
            in: 'query',
            name: 'code',
            schema: { type: 'string' },
            required: true,
            description: 'Authorization code from SSO provider'
          }
        ],
        responses: {
          '302': { description: 'Redirect to application with token' },
          '401': { $ref: '#/components/responses/UnauthorizedError' }
        }
      }
    }
  };
}

// Blueprint paths
function blueprintPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/blueprints': {
      get: {
        tags: ['Blueprints'],
        summary: 'List all blueprints',
        description: 'Get all blueprints accessible to the authenticated user',
        responses: {
          '200': {
            description: 'List of blueprints',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Blueprint' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Blueprints'],
        summary: 'Create a new blueprint',
        description: 'Create a new architecture blueprint',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BlueprintCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Blueprint created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Blueprint' }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' }
        }
      }
    },
    '/api/blueprints/{id}': {
      get: {
        tags: ['Blueprints'],
        summary: 'Get blueprint by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Blueprint details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Blueprint' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      },
      put: {
        tags: ['Blueprints'],
        summary: 'Update blueprint',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BlueprintUpdate' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Blueprint updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Blueprint' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      },
      delete: {
        tags: ['Blueprints'],
        summary: 'Delete blueprint',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '204': { description: 'Blueprint deleted' },
          '404': { $ref: '#/components/responses/NotFoundError' }
        }
      }
    },
    '/api/blueprints/{id}/validate': {
      post: {
        tags: ['Blueprints'],
        summary: 'Validate blueprint',
        description: 'Run validation checks on a blueprint',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Validation result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean' },
                    errors: { type: 'array', items: { type: 'string' } },
                    warnings: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// AI paths
function aiPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/ai/generate': {
      post: {
        tags: ['AI'],
        summary: 'Generate blueprint from natural language',
        description: 'Use AI to generate an architecture blueprint from natural language description',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userInput'],
                properties: {
                  userInput: { type: 'string', example: 'Create a scalable e-commerce platform on AWS' },
                  targetCloud: { type: 'string', enum: ['aws', 'azure', 'gcp', 'on-premise'], example: 'aws' },
                  environment: { type: 'string', enum: ['dev', 'staging', 'production'], example: 'production' },
                  budget: { type: 'number', example: 5000 },
                  region: { type: 'string', example: 'us-east-1' },
                  constraints: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Blueprint generated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Blueprint' }
              }
            }
          },
          '400': { $ref: '#/components/responses/ValidationError' }
        }
      }
    },
    '/api/ai/optimize/{blueprintId}': {
      get: {
        tags: ['AI'],
        summary: 'Get optimization suggestions',
        description: 'Get AI-powered optimization suggestions for a blueprint',
        parameters: [
          {
            in: 'path',
            name: 'blueprintId',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Optimization suggestions',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['cost', 'performance', 'security', 'resilience'] },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      impact: { type: 'string', enum: ['low', 'medium', 'high'] },
                      estimatedSavings: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// IaC Generation paths
function iacPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/iac/generate': {
      post: {
        tags: ['IaC Generation'],
        summary: 'Generate IaC from blueprint',
        description: 'Generate Infrastructure as Code from a blueprint',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['blueprintId', 'format', 'provider'],
                properties: {
                  blueprintId: { type: 'string', format: 'uuid' },
                  format: { type: 'string', enum: ['terraform', 'bicep', 'cloudformation', 'arm'] },
                  provider: { type: 'string', enum: ['aws', 'azure', 'gcp', 'on-premise'] },
                  options: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          '202': {
            description: 'Generation job started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jobId: { type: 'string', format: 'uuid' },
                    status: { type: 'string', example: 'processing' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/iac/status/{jobId}': {
      get: {
        tags: ['IaC Generation'],
        summary: 'Get generation job status',
        parameters: [
          {
            in: 'path',
            name: 'jobId',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Job status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jobId: { type: 'string', format: 'uuid' },
                    status: { type: 'string', enum: ['processing', 'completed', 'failed'] },
                    progress: { type: 'number', minimum: 0, maximum: 100 },
                    result: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// Costing paths
function costingPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/costing/estimate': {
      post: {
        tags: ['Costing'],
        summary: 'Calculate cost estimate',
        description: 'Calculate cost estimate for a blueprint or resources',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  blueprintId: { type: 'string', format: 'uuid' },
                  resources: { type: 'array', items: { type: 'object' } },
                  region: { type: 'string' },
                  duration: { type: 'number', description: 'Duration in months', minimum: 1 }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Cost estimate',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalMonthly: { type: 'number' },
                    totalAnnual: { type: 'number' },
                    breakdown: { type: 'array', items: { type: 'object' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/costing/tco': {
      post: {
        tags: ['Costing'],
        summary: 'Calculate Total Cost of Ownership',
        description: 'Calculate comprehensive TCO analysis',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  blueprintId: { type: 'string', format: 'uuid' },
                  timeframe: { type: 'number', description: 'Timeframe in months' },
                  includeLabor: { type: 'boolean' },
                  includeTraining: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'TCO analysis',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalCost: { type: 'number' },
                    breakdown: { type: 'object' },
                    recommendations: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// PM paths (Project Manager)
function pmPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/pm/approvals': {
      get: {
        tags: ['PM - Approvals'],
        summary: 'List pending approvals',
        description: 'Get all deployment approvals pending PM review',
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] }
          },
          {
            in: 'query',
            name: 'projectId',
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'List of approvals',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/DeploymentApproval' }
                }
              }
            }
          }
        }
      }
    },
    '/api/pm/approvals/{id}/approve': {
      post: {
        tags: ['PM - Approvals'],
        summary: 'Approve deployment',
        description: 'Approve a deployment for execution',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  comments: { type: 'string' },
                  conditions: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Approval submitted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeploymentApproval' }
              }
            }
          }
        }
      }
    },
    '/api/pm/budget': {
      get: {
        tags: ['PM - Budget'],
        summary: 'List budget allocations',
        description: 'Get all budget allocations for projects',
        responses: {
          '200': {
            description: 'Budget allocations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/BudgetAllocation' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['PM - Budget'],
        summary: 'Create budget allocation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BudgetAllocationCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Budget allocated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BudgetAllocation' }
              }
            }
          }
        }
      }
    },
    '/api/pm/migrations': {
      get: {
        tags: ['PM - Migrations'],
        summary: 'List cloud migrations',
        responses: {
          '200': {
            description: 'Cloud migrations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CloudMigration' }
                }
              }
            }
          }
        }
      }
    },
    '/api/pm/kpis': {
      get: {
        tags: ['PM - KPIs'],
        summary: 'Get KPI metrics',
        responses: {
          '200': {
            description: 'KPI metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/KPIMetric' }
                }
              }
            }
          }
        }
      }
    }
  };
}

// SE paths (Software Engineer)
function sePaths(): OpenAPIV3.PathsObject {
  return {
    '/api/se/deployments/{id}/execute': {
      post: {
        tags: ['SE - Deployments'],
        summary: 'Execute deployment',
        description: 'Execute an approved deployment',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['environment'],
                properties: {
                  environment: { type: 'string', enum: ['dev', 'staging', 'production'] },
                  deploymentWindow: { type: 'string', format: 'date-time' },
                  preChecksPassed: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '202': {
            description: 'Deployment started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    executionId: { type: 'string', format: 'uuid' },
                    status: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/se/deployment-logs': {
      get: {
        tags: ['SE - Logs'],
        summary: 'Get deployment logs',
        parameters: [
          {
            in: 'query',
            name: 'executionId',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Deployment logs',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/DeploymentLog' }
                }
              }
            }
          }
        }
      }
    },
    '/api/se/incidents': {
      get: {
        tags: ['SE - Incidents'],
        summary: 'List incidents',
        responses: {
          '200': {
            description: 'List of incidents',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Incident' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['SE - Incidents'],
        summary: 'Report incident',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IncidentCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Incident created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Incident' }
              }
            }
          }
        }
      }
    },
    '/api/se/health/services': {
      get: {
        tags: ['SE - Health'],
        summary: 'Get service health status',
        responses: {
          '200': {
            description: 'Service health status',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      status: { type: 'string', enum: ['healthy', 'degraded', 'down'] },
                      uptime: { type: 'number' },
                      lastCheck: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// EA paths (Enterprise Architect)
function eaPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/ea/policies': {
      get: {
        tags: ['EA - Policies'],
        summary: 'List governance policies',
        responses: {
          '200': {
            description: 'List of policies',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/GovernancePolicy' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['EA - Policies'],
        summary: 'Create governance policy',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GovernancePolicyCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Policy created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GovernancePolicy' }
              }
            }
          }
        }
      }
    },
    '/api/ea/patterns': {
      get: {
        tags: ['EA - Patterns'],
        summary: 'List architecture patterns',
        responses: {
          '200': {
            description: 'Architecture patterns',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ArchitecturePattern' }
                }
              }
            }
          }
        }
      }
    },
    '/api/ea/compliance': {
      get: {
        tags: ['EA - Compliance'],
        summary: 'List compliance frameworks',
        responses: {
          '200': {
            description: 'Compliance frameworks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ComplianceFramework' }
                }
              }
            }
          }
        }
      }
    },
    '/api/ea/cost-optimization/recommendations': {
      get: {
        tags: ['EA - Cost Optimization'],
        summary: 'Get cost optimization recommendations',
        responses: {
          '200': {
            description: 'Cost optimization recommendations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      description: { type: 'string' },
                      potentialSavings: { type: 'number' },
                      implementation: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// TA paths (Technical Architect)
function taPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/ta/iac/templates': {
      get: {
        tags: ['TA - IaC'],
        summary: 'List IaC templates',
        responses: {
          '200': {
            description: 'IaC templates',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/IaCTemplate' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['TA - IaC'],
        summary: 'Create IaC template',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IaCTemplateCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Template created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IaCTemplate' }
              }
            }
          }
        }
      }
    },
    '/api/ta/guardrails/rules': {
      get: {
        tags: ['TA - Guardrails'],
        summary: 'List guardrail rules',
        responses: {
          '200': {
            description: 'Guardrail rules',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/GuardrailRule' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['TA - Guardrails'],
        summary: 'Create guardrail rule',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GuardrailRuleCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Rule created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GuardrailRule' }
              }
            }
          }
        }
      }
    },
    '/api/ta/guardrails/violations': {
      get: {
        tags: ['TA - Guardrails'],
        summary: 'List guardrail violations',
        responses: {
          '200': {
            description: 'Guardrail violations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/GuardrailViolation' }
                }
              }
            }
          }
        }
      }
    }
  };
}

// SA paths (Solutions Architect)
function saPaths(): OpenAPIV3.PathsObject {
  return {
    '/api/sa/blueprints': {
      get: {
        tags: ['SA - Blueprints'],
        summary: 'List SA blueprints',
        description: 'Get blueprints created by Solutions Architects',
        responses: {
          '200': {
            description: 'SA blueprints',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Blueprint' }
                }
              }
            }
          }
        }
      }
    },
    '/api/sa/ai-recommendations': {
      get: {
        tags: ['SA - AI Recommendations'],
        summary: 'Get AI recommendations',
        description: 'Get AI-powered architecture recommendations',
        parameters: [
          {
            in: 'query',
            name: 'blueprintId',
            schema: { type: 'string', format: 'uuid' }
          },
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['analysis', 'optimization', 'comparison'] }
          }
        ],
        responses: {
          '200': {
            description: 'AI recommendations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AIRecommendation' }
                }
              }
            }
          }
        }
      }
    }
  };
}

// Common schemas
function commonSchemas() {
  return {
    UUID: {
      type: 'string',
      format: 'uuid',
      example: '550e8400-e29b-41d4-a716-446655440000'
    },
    Timestamp: {
      type: 'string',
      format: 'date-time',
      example: '2025-11-16T10:30:00Z'
    },
    Error: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'object' }
      }
    }
  };
}

// Blueprint schemas
function blueprintSchemas() {
  return {
    Blueprint: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        name: { type: 'string', example: 'E-commerce Platform' },
        description: { type: 'string' },
        category: { type: 'string', enum: ['web-app', 'microservices', 'data-platform', 'ml-platform'] },
        provider: { type: 'string', enum: ['aws', 'azure', 'gcp', 'on-premise', 'multi-cloud'] },
        components: { type: 'object' },
        status: { type: 'string', enum: ['draft', 'active', 'archived'], default: 'draft' },
        version: { type: 'string', example: '1.0.0' },
        tags: { type: 'array', items: { type: 'string' } },
        tenantId: { $ref: '#/components/schemas/UUID' },
        createdBy: { $ref: '#/components/schemas/UUID' },
        createdAt: { $ref: '#/components/schemas/Timestamp' },
        updatedAt: { $ref: '#/components/schemas/Timestamp' }
      }
    },
    BlueprintCreate: {
      type: 'object',
      required: ['name', 'description'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        provider: { type: 'string' },
        components: { type: 'object' },
        tags: { type: 'array', items: { type: 'string' } }
      }
    },
    BlueprintUpdate: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        components: { type: 'object' },
        status: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } }
      }
    }
  };
}

// Deployment schemas
function deploymentSchemas() {
  return {
    DeploymentApproval: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        blueprintId: { $ref: '#/components/schemas/UUID' },
        requestedBy: { $ref: '#/components/schemas/UUID' },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        approvedBy: { $ref: '#/components/schemas/UUID' },
        comments: { type: 'string' },
        createdAt: { $ref: '#/components/schemas/Timestamp' }
      }
    },
    DeploymentLog: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        executionId: { $ref: '#/components/schemas/UUID' },
        logLevel: { type: 'string', enum: ['info', 'warning', 'error'] },
        message: { type: 'string' },
        context: { type: 'object' },
        timestamp: { $ref: '#/components/schemas/Timestamp' }
      }
    }
  };
}

// Compliance schemas
function complianceSchemas() {
  return {
    GovernancePolicy: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        name: { type: 'string' },
        description: { type: 'string' },
        policyType: { type: 'string' },
        category: { type: 'string' },
        severity: { type: 'string', enum: ['info', 'warning', 'error', 'critical'] },
        policyRules: { type: 'object' },
        enforcementLevel: { type: 'string', enum: ['advisory', 'mandatory'] },
        effectiveFrom: { type: 'string', format: 'date' },
        tenantId: { $ref: '#/components/schemas/UUID' }
      }
    },
    GovernancePolicyCreate: {
      type: 'object',
      required: ['name', 'policyType', 'policyRules', 'enforcementLevel'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        policyType: { type: 'string' },
        category: { type: 'string' },
        severity: { type: 'string' },
        policyRules: { type: 'object' },
        enforcementLevel: { type: 'string' }
      }
    },
    ComplianceFramework: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        name: { type: 'string', example: 'SOC2' },
        version: { type: 'string' },
        requirements: { type: 'object' },
        controls: { type: 'object' }
      }
    },
    ArchitecturePattern: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        name: { type: 'string' },
        category: { type: 'string' },
        patternDefinition: { type: 'object' },
        useCases: { type: 'array', items: { type: 'string' } }
      }
    }
  };
}

// Budget schemas
function budgetSchemas() {
  return {
    BudgetAllocation: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        projectId: { $ref: '#/components/schemas/UUID' },
        category: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string', default: 'USD' },
        fiscalYear: { type: 'number' },
        tenantId: { $ref: '#/components/schemas/UUID' }
      }
    },
    BudgetAllocationCreate: {
      type: 'object',
      required: ['projectId', 'category', 'amount', 'fiscalYear'],
      properties: {
        projectId: { type: 'string', format: 'uuid' },
        category: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
        fiscalYear: { type: 'number' }
      }
    },
    KPIMetric: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        name: { type: 'string' },
        value: { type: 'number' },
        unit: { type: 'string' },
        target: { type: 'number' },
        trend: { type: 'string', enum: ['up', 'down', 'stable'] }
      }
    },
    CloudMigration: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        projectId: { $ref: '#/components/schemas/UUID' },
        description: { type: 'string' },
        status: { type: 'string' },
        phase: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        progress: { type: 'number', minimum: 0, maximum: 100 }
      }
    }
  };
}

// Incident schemas
function incidentSchemas() {
  return {
    Incident: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        title: { type: 'string' },
        description: { type: 'string' },
        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        priority: { type: 'string', enum: ['p1', 'p2', 'p3', 'p4'] },
        status: { type: 'string', enum: ['open', 'investigating', 'resolved', 'closed'] },
        affectedServices: { type: 'object' },
        detectedBy: { $ref: '#/components/schemas/UUID' },
        assignedTo: { $ref: '#/components/schemas/UUID' },
        createdAt: { $ref: '#/components/schemas/Timestamp' },
        resolvedAt: { $ref: '#/components/schemas/Timestamp' }
      }
    },
    IncidentCreate: {
      type: 'object',
      required: ['title', 'description', 'severity', 'priority'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        severity: { type: 'string' },
        priority: { type: 'string' },
        affectedServices: { type: 'object' },
        assignedTo: { type: 'string', format: 'uuid' }
      }
    },
    IaCTemplate: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        name: { type: 'string' },
        templateType: { type: 'string', enum: ['terraform', 'bicep', 'cloudformation', 'arm'] },
        category: { type: 'string' },
        provider: { type: 'string' },
        templateContent: { type: 'string' },
        variables: { type: 'object' }
      }
    },
    IaCTemplateCreate: {
      type: 'object',
      required: ['name', 'templateType', 'category', 'templateContent'],
      properties: {
        name: { type: 'string' },
        templateType: { type: 'string' },
        category: { type: 'string' },
        provider: { type: 'string' },
        templateContent: { type: 'string' },
        variables: { type: 'object' }
      }
    },
    GuardrailRule: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        ruleType: { type: 'string' },
        conditions: { type: 'object' },
        actions: { type: 'object' },
        severity: { type: 'string', enum: ['info', 'warning', 'error'] },
        status: { type: 'string', enum: ['active', 'inactive'] }
      }
    },
    GuardrailRuleCreate: {
      type: 'object',
      required: ['name', 'category', 'ruleType', 'conditions', 'actions'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        ruleType: { type: 'string' },
        conditions: { type: 'object' },
        actions: { type: 'object' },
        severity: { type: 'string' }
      }
    },
    GuardrailViolation: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        ruleId: { $ref: '#/components/schemas/UUID' },
        blueprintId: { $ref: '#/components/schemas/UUID' },
        violationType: { type: 'string' },
        severity: { type: 'string' },
        message: { type: 'string' },
        status: { type: 'string', enum: ['open', 'overridden', 'resolved'] },
        detectedAt: { $ref: '#/components/schemas/Timestamp' }
      }
    },
    AIRecommendation: {
      type: 'object',
      properties: {
        id: { $ref: '#/components/schemas/UUID' },
        blueprintId: { $ref: '#/components/schemas/UUID' },
        type: { type: 'string', enum: ['analysis', 'optimization', 'comparison'] },
        title: { type: 'string' },
        description: { type: 'string' },
        recommendations: { type: 'object' },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        createdAt: { $ref: '#/components/schemas/Timestamp' }
      }
    }
  };
}
