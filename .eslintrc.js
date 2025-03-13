module.exports = {
    // You can specify your parser if needed (e.g., babel-eslint or @babel/eslint-parser)
    parser: 'babel-eslint', // or another parser you use
    plugins: ['react', 'react-hooks'],
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      // ...other shared configs
    ],
    rules: {
      // Checks rules of Hooks: https://reactjs.org/docs/hooks-rules.html
      'react-hooks/rules-of-hooks': 'error',
      // Checks effect dependencies: https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
      'react-hooks/exhaustive-deps': 'warn',
      // ...other rules
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the react version
      },
    },
  };
  