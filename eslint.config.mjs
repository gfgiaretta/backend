// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      "no-console": ["error"],
      "no-async-promise-executor": ["error"],
      "getter-return": ["error"],
      "no-compare-neg-zero": ["error"],
      "no-cond-assign": ["error", "except-parens"],
      "no-debugger": ["error"],
      "no-dupe-args": ["error"],
      "no-dupe-keys": ["error"],
      "no-duplicate-case": ["error"],
      "no-empty": [
      "warn",
        {
          allowEmptyCatch: true,
        },
      ],
      "no-ex-assign": ["error"],
      "no-sparse-arrays": ["error"],
      "no-template-curly-in-string": ["warn"],
      "no-unreachable": ["error"],
      "valid-typeof": [
      "warn",
        {
          requireStringLiterals: true,
        },
      ],
      "array-callback-return": ["warn"],
      "dot-notation": ["warn"],
      eqeqeq: [
      "warn",
      "always",
        {
          null: "ignore",
        },
      ],
      "max-classes-per-file": ["off"],
      "no-alert": ["error"],
      "no-else-return": [
      "warn",
        {
          allowElseIf: true,
        },
      ],
      "no-eval": ["error"],
      "no-extra-label": ["warn"],
      "no-fallthrough": ["error"],
      "no-global-assign": ["error"],
      "no-implied-eval": ["error"],
      "no-invalid-this": ["error"],
      "no-magic-numbers": [
        "warn",
        {
          ignoreClassFieldInitialValues: true,
          ignoreDefaultValues: true,
          ignoreArrayIndexes: true,
          ignore: [0, 1],
        },
      ],
      "no-octal": ["error"],
      "no-param-reassign": ["warn"],
      "no-return-assign": ["error"],
      "no-script-url": ["error"],
      "no-self-assign": ["warn"],
      "no-self-compare": ["error"],
      "no-sequences": ["error"],
      "no-throw-literal": ["error"],
      "no-unused-labels": ["warn"],
      "no-useless-concat": ["warn"],
      "no-delete-var": ["error"],
      "no-shadow-restricted-names": ["error"],
      "no-undef": ["error"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
        },
      ],
      "no-array-constructor": ["error"],
      "no-this-before-super": ["error"],
      "no-var": ["error"],
      "prefer-const": ["warn"],
      "prefer-spread": ["error"],
      "prefer-rest-params": ["error"],
      "prefer-template": ["warn"],
      "require-yield": ["error"],
      "prettier/prettier": [
        "error",
        {
          "endOfLine": "auto"
        }
      ],
    },
  },
);
