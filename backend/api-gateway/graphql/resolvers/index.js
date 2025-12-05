"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const lodash_1 = require("lodash");
const infrastructure_1 = require("./infrastructure");
const deployment_1 = require("./deployment");
const aiops_1 = require("./aiops");
const auth_1 = require("./auth");
const graphql_1 = require("graphql");
// Custom scalar for DateTime
const dateTimeScalar = new graphql_1.GraphQLScalarType({
    name: 'DateTime',
    description: 'Date and time in ISO 8601 format',
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    },
    parseValue(value) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    },
});
// Custom scalar for JSON
const jsonScalar = new graphql_1.GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON value',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.OBJECT) {
            return ast;
        }
        return null;
    },
});
// Merge all resolvers
exports.resolvers = (0, lodash_1.merge)({
    DateTime: dateTimeScalar,
    JSON: jsonScalar,
}, infrastructure_1.infrastructureResolvers, deployment_1.deploymentResolvers, aiops_1.aiopsResolvers, auth_1.authResolvers);
//# sourceMappingURL=index.js.map