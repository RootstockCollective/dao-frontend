import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import storybookPlugin from 'eslint-plugin-storybook'
import unicorn from 'eslint-plugin-unicorn'
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
      'react/jsx-pascal-case': 'error',
    },
  },

  // -----------------------------------------------------------------------
  // Import sorting (auto-fixable via `eslint --fix` or editor save)
  // [TechDebt] Set to 'warn' to avoid breaking CI on existing files.
  //            Promote to 'error' once cleanup epic is complete.
  // -----------------------------------------------------------------------
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // -----------------------------------------------------------------------
  // Unicorn – modern JS/TS best-practice rules (eslint-plugin-unicorn)
  // [TechDebt] Starting at 'warn' to avoid breaking CI.
  //            Promote individual rules to 'error' once violations are fixed.
  // -----------------------------------------------------------------------
  {
    plugins: { unicorn },
    rules: {
      'unicorn/no-useless-undefined': 'warn', // TODO: fix violations and promote to 'error' in a separate PR
      // 'unicorn/no-negated-condition': 'warn',
      'unicorn/no-lonely-if': 'warn', // TODO: fix violations and promote to 'error' in a separate PR
      // 'unicorn/prefer-optional-catch-binding': 'warn',
      'unicorn/prefer-string-replace-all': 'warn', // TODO: fix violations and promote to 'error' in a separate PR
      'unicorn/error-message': 'warn', // TODO: fix violations and promote to 'error' in a separate PR
      'unicorn/no-for-loop': 'warn', // TODO: fix violations and promote to 'error' in a separate PR
      // 'unicorn/no-typeof-undefined': 'warn', // disabled: flags legitimate `typeof window` SSR checks
    },
  },

  // -----------------------------------------------------------------------
  // Import sorting (auto-fixable via `eslint --fix` or editor save)
  // [TechDebt] Set to 'warn' to avoid breaking CI on existing files.
  //            Promote to 'error' once cleanup epic is complete.
  // -----------------------------------------------------------------------
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
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
      // Enforce PascalCase or camelCase on function declarations (blocks ALLCAPS names like RANDOMCOMPONENT)
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
      ],
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            FC: {
              message:
                'Do not use FC. Type the component as (props: Props) => JSX.Element and use (props: Props) in the parameter.',
            },
            FunctionComponent: {
              message:
                'Do not use FunctionComponent. Type the component as (props: Props) => JSX.Element and use (props: Props) in the parameter.',
            },
          },
        },
      ],
    },
  },
]

export default config
