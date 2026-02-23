import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import storybookPlugin from 'eslint-plugin-storybook'
import tseslint from 'typescript-eslint'

const config = [
  ...nextCoreWebVitals,

  prettierConfig,

  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },

  ...storybookPlugin.configs['flat/recommended'],

  {
    ignores: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/*.stories.tsx'],
  },

  {
    rules: {
      semi: [2, 'never'],
      quotes: 'off',
      'object-curly-spacing': [2, 'always'],
      'eol-last': [2, 'always'],
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutability': 'off',
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: 'never',
          interfaces: {
            optionalityOrder: 'required-first',
          },
          typeLiterals: {
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
  },
]

export default config
