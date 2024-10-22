/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|mjs|cjs)"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {}],
  },
}
