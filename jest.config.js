module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  collectCoverageFrom: [
    'backend/*/src/**/*.{ts,js}',
    '!backend/*/src/**/*.d.ts',
    '!backend/*/src/**/*.test.{ts,js}',
    '!backend/*/node_modules/**',
  ],
  coverageDirectory: 'coverage/unit',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
};
