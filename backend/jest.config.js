module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js", // Don't cover server bootstrap in unit/integration tests
    "!src/config/**/*.js"
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  },
  testTimeout: 10000 // 10s for integration tests
};
