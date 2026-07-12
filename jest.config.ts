// jest.config.ts — authorization marker: editable for 100% coverage thresholds
const IgnorePatterns = [
  '<rootDir>/node_modules/',
  '<rootDir>/templates/',
  '<rootDir>/.next',
  '<rootDir>/e2e/',
]

export default {
  verbose: false,
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2020',
          module: 'commonjs',
          esModuleInterop: true,
          jsx: 'react-jsx',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          strict: true,
        },
        useESM: false,
      },
    ],
    '.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  transformIgnorePatterns: IgnorePatterns,
  testPathIgnorePatterns: IgnorePatterns,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/main.tsx',
    '!src/**/*.d.ts',
    '!src/**/*.spec.*',
    '!src/shared/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironmentOptions: {
    // Force Node's package `exports` resolver to pick the `require`
    // condition. The @preact/* packages ship dual ESM/CJS bundles and
    // default to the ESM `.module.js`/`.mjs` builds, which jest can't
    // parse. Pinning `require` makes jest load the CJS variants.
    customExportConditions: ['require', 'node'],
  },
  testRegex: String.raw`(/_tests_/.*|(\.|/)(test|spec))\.(jsx?|tsx?)$`,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary', 'json-summary'],
  modulePathIgnorePatterns: ['builds', 'node_modules'],
}
