import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { join } from 'path';

import { resolvers } from './graphql/resolvers';
import { PostgresDataSource } from './graphql/datasources/PostgresDataSource';
import { AIOpsDataSource } from './graphql/datasources/AIOpsDataSource';
import { verifyToken } from './graphql/resolvers/auth';

// Load GraphQL schema
const typeDefs = readFileSync(
  join(__dirname, 'graphql/schemas/schema.graphql'),
  'utf-8'
);

// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

interface Context {
  dataSources: {
    postgres: PostgresDataSource;
    aiops: AIOpsDataSource;
  };
  user?: any;
  req: Request;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Data sources
  const postgresDataSource = new PostgresDataSource({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433'),
    database: process.env.POSTGRES_DB || 'iac_v3',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  });

  const aiopsDataSource = new AIOpsDataSource({
    baseURL: process.env.AIOPS_URL || 'http://localhost:8100',
  });

  // Initialize data sources
  await postgresDataSource.initialize({});
  await aiopsDataSource.initialize({});

  // WebSocket server cleanup
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: any) => {
        // Get token from connection params
        const token = ctx.connectionParams?.authorization?.replace('Bearer ', '');
        const user = token ? verifyToken(token) : null;

        return {
          dataSources: {
            postgres: postgresDataSource,
            aiops: aiopsDataSource,
          },
          user,
        };
      },
    },
    wsServer
  );

  // Apollo Server
  const server = new ApolloServer<Context>({
    schema,
    plugins: [
      // Proper shutdown for HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for WebSocket server
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      // GraphQL Playground for development
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();

  // Middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }),
    bodyParser.json({ limit: '50mb' }),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        // Get token from Authorization header
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = token ? verifyToken(token) : null;

        return {
          dataSources: {
            postgres: postgresDataSource,
            aiops: aiopsDataSource,
          },
          user,
          req,
        };
      },
    })
  );

  // Health check endpoint
  app.get('/health', async (req: Request, res: Response) => {
    try {
      // Check PostgreSQL
      const pgHealth = await postgresDataSource.getInfrastructure('test')
        .then(() => true)
        .catch(() => false);

      // Check AIOps
      const aiopsHealth = await aiopsDataSource.getHealth()
        .then(() => true)
        .catch(() => false);

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          graphql: true,
          postgres: pgHealth,
          aiops: aiopsHealth,
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      service: 'IAC Dharma v3.0 - GraphQL API Gateway',
      version: '3.0.0',
      endpoints: {
        graphql: '/graphql',
        health: '/health',
      },
      documentation: '/graphql (GraphQL Playground)',
    });
  });

  // Start server
  const PORT = parseInt(process.env.PORT || '4000');
  
  await new Promise<void>((resolve) => {
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('🚀 GraphQL API Gateway v3.0 started successfully!');
      console.log('');
      console.log(`📍 GraphQL Endpoint: http://localhost:${PORT}/graphql`);
      console.log(`📍 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`📍 WebSocket Subscriptions: ws://localhost:${PORT}/graphql`);
      console.log(`📍 Health Check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('✓ PostgreSQL connected (port 5433)');
      console.log('✓ AIOps Engine connected (port 8100)');
      console.log('');
      resolve();
    });
  });
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start GraphQL API Gateway:', error);
  process.exit(1);
});
