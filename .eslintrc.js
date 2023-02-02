module.exports = {
  plugins: ['oxygen'],
  extends: ['plugin:oxygen/react'],
  rules: {
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/prefer-namespace-keyword': 0,
    '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    '@typescript-eslint/no-floating-promises': 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/no-unsafe-return": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-misused-promises": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-unsafe-argument": 0,
    "space-infix-ops": 1,
    "keyword-spacing": ["error", {
      "before": true,
      "after": true
    }],
    "object-curly-spacing": ["error", "always"]
  },
};
