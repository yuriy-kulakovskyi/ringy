import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  testMatch: ["**/*.spec.ts"],

  moduleNameMapper: {
    "^@modules/(.*)$": "<rootDir>/modules/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^prisma/(.*)$": "<rootDir>/prisma/$1",
    "^@config/(.*)$": "<rootDir>/config/$1",
    "^generated/(.*)$": "<rootDir>/generated/$1",
  },

  clearMocks: true,

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;