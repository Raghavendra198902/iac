import { GraphQLResolveInfo } from 'graphql';
import { PostgresDataSource } from '../datasources/PostgresDataSource';
import { AIOpsDataSource } from '../datasources/AIOpsDataSource';

export const infrastructureResolvers = {
  Query: {
    infrastructure: async (
      _: any,
      { id }: { id: string },
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      return await dataSources.postgres.getInfrastructure(id);
    },

    listInfrastructures: async (
      _: any,
      args: {
        provider?: string;
        status?: string;
        limit?: number;
        offset?: number;
      },
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      const { infrastructures, totalCount } = await dataSources.postgres.listInfrastructures(
        args.provider,
        args.status,
        args.limit || 20,
        args.offset || 0
      );

      return {
        edges: infrastructures.map((infra, index) => ({
          node: infra,
          cursor: Buffer.from(`${args.offset || 0 + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: (args.offset || 0) + infrastructures.length < totalCount,
          hasPreviousPage: (args.offset || 0) > 0,
          startCursor: infrastructures.length > 0 
            ? Buffer.from(`${args.offset || 0}`).toString('base64') 
            : null,
          endCursor: infrastructures.length > 0
            ? Buffer.from(`${(args.offset || 0) + infrastructures.length - 1}`).toString('base64')
            : null,
        },
        totalCount,
      };
    },
  },

  Mutation: {
    createInfrastructure: async (
      _: any,
      { input }: any,
      { dataSources, user }: any
    ) => {
      // Create audit log
      await dataSources.postgres.createAuditLog({
        userId: user?.id,
        action: 'CREATE',
        resourceType: 'infrastructure',
        details: { name: input.name, provider: input.provider },
      });

      return await dataSources.postgres.createInfrastructure({
        name: input.name,
        provider: input.provider,
        region: input.region,
        templateId: input.templateId,
        config: input.config || {},
        tags: input.tags || [],
        createdBy: user?.id,
      });
    },

    updateInfrastructure: async (
      _: any,
      { id, input }: any,
      { dataSources, user }: any
    ) => {
      // Create audit log
      await dataSources.postgres.createAuditLog({
        userId: user?.id,
        action: 'UPDATE',
        resourceType: 'infrastructure',
        resourceId: id,
        details: input,
      });

      return await dataSources.postgres.updateInfrastructure(id, {
        name: input.name,
        region: input.region,
        config: input.config,
        tags: input.tags,
        status: input.status,
      });
    },

    deleteInfrastructure: async (
      _: any,
      { id }: { id: string },
      { dataSources, user }: any
    ) => {
      // Create audit log
      await dataSources.postgres.createAuditLog({
        userId: user?.id,
        action: 'DELETE',
        resourceType: 'infrastructure',
        resourceId: id,
      });

      return await dataSources.postgres.deleteInfrastructure(id);
    },
  },

  Infrastructure: {
    computeResources: async (
      parent: any,
      _: any,
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      return await dataSources.postgres.getComputeResourcesByInfrastructure(parent.id);
    },

    deployments: async (
      parent: any,
      _: any,
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      const { deployments } = await dataSources.postgres.listDeployments(parent.id);
      return deployments;
    },

    createdBy: async (
      parent: any,
      _: any,
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      if (!parent.created_by) return null;
      return await dataSources.postgres.getUser(parent.created_by);
    },
  },
};
