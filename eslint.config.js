// Lint for the TypeScript and React sources, and the build/test scripts.
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr-home', 'dist-ssr-dashboard', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node }
  }
)
