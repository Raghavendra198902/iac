/**
 * Swagger UI Configuration
 * Serves interactive API documentation at /api-docs
 */

import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { generateOpenAPISpec } from './swagger-generator';

export function setupSwaggerDocs(app: Application): void {
  const swaggerSpec = generateOpenAPISpec();
  
  // Serve Swagger UI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'IAC Dharma API Documentation'
  }));

  // Serve raw OpenAPI JSON at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  logger.info('📚 API Documentation available at /api-docs');
  logger.info('📄 OpenAPI Spec available at /api-docs.json');
}
