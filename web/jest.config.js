module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './test-config/babel.config.js' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react|react-dom|@testing-library|@babel|jest-.*|@types)/)'
  ],
};
