module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/$1"
  },
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!@radix-ui|embla-carousel-react|lucide-react).+\\.js$"
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
}; 