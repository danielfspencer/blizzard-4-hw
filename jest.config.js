module.exports = {
  testMatch: [
    "<rootDir>/tests/**/*.js"
  ],
  globalSetup: "<rootDir>/build.js",
  setupFilesAfterEnv: ["<rootDir>/setup.js"],
  testEnvironment: "node"
}
