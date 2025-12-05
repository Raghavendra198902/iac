import { PostgresDataSource } from '../datasources/PostgresDataSource';

export const deploymentResolvers = {
  Query: {
    deployment: async (
      _: any,
      { id }: { id: string },
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      return await dataSources.postgres.getDeployment(id);
    },

    listDeployments: async (
      _: any,
      args: {
        infrastructureId?: string;
        status?: string;
        limit?: number;
        offset?: number;
      },
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      const { deployments, totalCount } = await dataSources.postgres.listDeployments(
        args.infrastructureId,
        args.status,
        args.limit || 20,
        args.offset || 0
      );

      return {
        edges: deployments.map((deployment, index) => ({
          node: deployment,
          cursor: Buffer.from(`${args.offset || 0 + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: (args.offset || 0) + deployments.length < totalCount,
          hasPreviousPage: (args.offset || 0) > 0,
          startCursor: deployments.length > 0
            ? Buffer.from(`${args.offset || 0}`).toString('base64')
            : null,
          endCursor: deployments.length > 0
            ? Buffer.from(`${(args.offset || 0) + deployments.length - 1}`).toString('base64')
            : null,
        },
        totalCount,
      };
    },
  },

  Mutation: {
    createDeployment: async (
      _: any,
      { input }: any,
      { dataSources, user }: any
    ) => {
      // Create audit log
      await dataSources.postgres.createAuditLog({
        userId: user?.id,
        action: 'CREATE',
        resourceType: 'deployment',
        details: { name: input.name, infrastructureId: input.infrastructureId },
      });

      return await dataSources.postgres.createDeployment({
        infrastructureId: input.infrastructureId,
        name: input.name,
        namespace: input.namespace || 'default',
        replicas: input.replicas || 1,
        image: input.image,
        imageTag: input.imageTag || 'latest',
        envVars: input.envVars,
        resources: input.resources,
      });
    },

    scaleDeployment: async (
      _: any,
      { id, replicas }: { id: string; replicas: number },
      { dataSources, user }: any
    ) => {
      // Create audit log
      await dataSources.postgres.createAuditLog({
        userId: user?.id,
        action: 'SCALE',
        resourceType: 'deployment',
        resourceId: id,
        details: { replicas },
      });

      return await dataSources.postgres.scaleDeployment(id, replicas);
    },

    deleteDeployment: async (
      _: any,
      { id }: { id: string },
      { dataSources, user }: any
    ) => {
      // Create audit log
      await dataSources.postgres.createAuditLog({
        userId: user?.id,
        action: 'DELETE',
        resourceType: 'deployment',
        resourceId: id,
      });

      return await dataSources.postgres.deleteDeployment(id);
    },
  },

  Deployment: {
    infrastructureId: (parent: any) => parent.infrastructure_id,
    desiredReplicas: (parent: any) => parent.desired_replicas,
    availableReplicas: (parent: any) => parent.available_replicas,
    imageTag: (parent: any) => parent.image_tag,
    envVars: (parent: any) => parent.env_vars,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,
  },
};
