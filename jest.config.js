module.exports = {
  projects: [
    {
      displayName: 'game',
      preset: 'ts-jest',
      globals: {
        'ts-jest': {
          tsConfig: 'src/game/tsconfig.json',
          diagnostics: true
        }
      },
      testMatch: ['<rootDir>/src/game/**/*.test.ts'],
      collectCoverageFrom: ['src/game/**/*.{ts,tsx}']
    }
  ]
}
