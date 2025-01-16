import type { Config } from '@jest/types';

const performanceConfig: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      tsconfig: 'config/tsconfig.json',
    },
  },
  preset: 'ts-jest',
  rootDir: '../',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/performance/*.test.ts'],
  collectCoverage: false,
  verbose: true,
  maxConcurrency: 4,
};

export default performanceConfig;
