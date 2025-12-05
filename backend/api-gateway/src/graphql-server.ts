import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from '../graphql/resolvers';
import { PostgresDataSource } from '../graphql/datasources/PostgresDataSource';
import { AIOpsDataSource } from '../graphql/datasources/AIOpsDataSource';
import { Application } from 'express';
import { Server } from 'http';

// Load GraphQL schema
const typeDefs = readFileSync(
  join(__dirname, '../graphql/schemas/schema.graphql'),
  'utf-8'
);

export interface GraphQLContext {
  dataSources: {
    postgres: PostgresDataSource;
    aiops: AIOpsDataSource;
  };
  user?: any;
}

export async function createGraphQLServer(app: Application, httpServer: Server) {
  // Create Apollo Server
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  // Apply GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        return {
          dataSources: {
            postgres: new PostgresDataSource(),
            aiops: new AIOpsDataSource(),
          },
          user: (req as any).user,
        };
      },
    })
  );

  return server;
}
