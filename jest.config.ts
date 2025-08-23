import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Encuentra cualquier *.spec.ts o *.test.ts en todo el repo
  testMatch: ['**/?(*.)+(spec|test).ts'],

  setupFiles: ['<rootDir>/tests/shims.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],


  moduleNameMapper: {
    '^core/xray-clients$': '<rootDir>/tests/__mocks__/__core/xray-clients.ts',
    '^core/xray-bootstrap$': '<rootDir>/tests/__mocks__/__core/xray-bootstrap.ts',
    '^core(.*)$': '<rootDir>/_layers/core/nodejs/@core$1',
    // 👇 alias corto para importar mocks desde los specs
    '^@mocks/(.*)$': '<rootDir>/tests/__mocks__/$1',
  },

  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },

  moduleDirectories: [
    "node_modules",
    "<rootDir>/_layers/core/nodejs/node_modules",
  ],

  // Evita que Jest entre a directorios generados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.serverless/',
    '/dist/',
    '/build/',
    '/.build/',
  ],
};

export default config;
