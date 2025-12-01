module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  collectCoverageFrom: [
    'backend/*/src/**/*.{ts,js}',
    '!backend/*/src/**/*.d.ts',
    '!backend/*/src/**/*.test.{ts,js}',
  ],
  coverageDirectory: 'coverage/integration',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  maxWorkers: 1, // Run integration tests serially
};
