import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      tsconfig: 'config/tsconfig.json'
    }
  },
  preset: 'ts-jest',
  rootDir: '../',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/*.test.ts'],
  collectCoverage: false,
}

export default config
