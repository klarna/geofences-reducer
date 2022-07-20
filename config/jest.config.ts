import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      tsconfig: 'config/tsconfig.json'
    }
  },
  preset: 'ts-jest',
  rootDir: '../',
  testEnvironment: 'node'
}

export default config
