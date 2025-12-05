import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = express.Router();

// Load OpenAPI specification
const swaggerDocument = YAML.load(
  path.join(__dirname, '../../docs/api/openapi.yaml')
);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1976d2; }
  `,
  customSiteTitle: 'IAC Dharma API Documentation',
  customfavIcon: '/favicon.ico',
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, swaggerUiOptions));

// Serve OpenAPI JSON
router.get('/json', (req, res) => {
  res.json(swaggerDocument);
});

// Serve OpenAPI YAML
router.get('/yaml', (req, res) => {
  res.type('text/yaml');
  res.sendFile(path.join(__dirname, '../../docs/api/openapi.yaml'));
});

export default router;
