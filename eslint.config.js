import pluginRouter from '@tanstack/eslint-plugin-router'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginReact from 'eslint-plugin-react'
import tseslint from 'typescript-eslint';

export default tseslint.config(
    ...pluginRouter.configs['flat/recommended'],
    ...pluginQuery.configs['flat/recommended'],
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn", {
                    "args": "all",
                    "argsIgnorePattern": "^_",
                    "caughtErrors": "all",
                    "caughtErrorsIgnorePattern": "^_",
                    "destructuredArrayIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "ignoreRestSiblings": true
                }
            ]
        }
    }
);