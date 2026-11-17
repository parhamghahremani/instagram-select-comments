import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        location: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        requestIdleCallback: 'readonly',
        MutationObserver: 'readonly',
        Node: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLElement: 'readonly',
        WeakSet: 'readonly',
        URLSearchParams: 'readonly',
        IntersectionObserver: 'readonly',
        history: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {
      indent: ['error', 4],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];