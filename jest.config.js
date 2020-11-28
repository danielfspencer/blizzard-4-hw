module.exports = {
  testMatch: [
    "<rootDir>/tests/**/*.js"
  ],
  slowTestThreshold: 60000,
  globalSetup: "<rootDir>/build.js",
  setupFilesAfterEnv: ["<rootDir>/setup.js"],
  testEnvironment: "node",
  moduleFileExtensions: ["js", "v", "cpp", "mem"]
}
