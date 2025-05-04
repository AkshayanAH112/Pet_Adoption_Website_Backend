export default {
  testEnvironment: 'node',
  transform: {},
  transformIgnorePatterns: [
    'node_modules/(?!axios)/'
  ],
  moduleFileExtensions: ['js', 'mjs'],
  extensionsToTreatAsEsm: ['.js', '.mjs'],
  setupFiles: ['<rootDir>/jest.setup.js']
};
