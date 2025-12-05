import { merge } from 'lodash';
import { infrastructureResolvers } from './infrastructure';
import { deploymentResolvers } from './deployment';
import { aiopsResolvers } from './aiops';
import { authResolvers } from './auth';
import { GraphQLScalarType, Kind } from 'graphql';

// Custom scalar for DateTime
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date and time in ISO 8601 format',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom scalar for JSON
const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    return null;
  },
});

// Merge all resolvers
export const resolvers = merge(
  {
    DateTime: dateTimeScalar,
    JSON: jsonScalar,
  },
  infrastructureResolvers,
  deploymentResolvers,
  aiopsResolvers,
  authResolvers
);
