import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // 忽略目录必须放在最前面
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.next/**',
      'site/.next/**',
      'site/public/**', // 构建输出
      '**/*.config.js',
      '**/*.config.ts',
      '**/next-env.d.ts',
      '**/*.d.ts', // 类型声明文件
      // Skills 目录的脚本文件（独立工具，非核心代码）
      'skills/**/*.js',
      'skills/**/*.ts',
      // packages/os 可能存在老的脚本
      'packages/os/**/*.js',
      'upload/**',
      // 生成的文件
      '**/coverage/**',
      '**/.tmp/**',
      '**/.cache/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'import': importPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        customElements: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        TouchEvent: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        process: 'readonly',
        caches: 'readonly',
        self: 'readonly',
        location: 'readonly',
        clients: 'readonly',
        importScripts: 'readonly',
      },
    },
    rules: {
      ...eslintConfigPrettier.rules,
      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // React 最佳实践
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
      'react/jsx-props-no-spreading': 'warn',
      'react/prop-types': 'off',
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-no-useless-fragment': 'warn',
      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', disallowTypeAnnotations: false }
      ],
      '@typescript-eslint/naming-convention': [
        'warn',
        // 接口和类型使用 PascalCase
        {
          selector: ['interface', 'typeAlias'],
          format: ['PascalCase'],
        },
        // 枚举使用 PascalCase
        {
          selector: 'enum',
          format: ['PascalCase']
        },
        // 枚举成员使用 UPPER_CASE
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        },
        // 变量和函数使用 camelCase
        {
          selector: ['variable', 'function'],
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        // 类使用 PascalCase
        {
          selector: 'class',
          format: ['PascalCase']
        },
      ],
      // 导入组织
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@{kernel,ui,i18n,oobe,bootloader,recovery,tablet,apps}/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@webos/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'import/no-duplicates': 'warn',
      'import/no-self-import': 'error',
      'import/no-cycle': 'error',
      // 一般规则
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      // 复杂度控制
      'complexity': ['warn', 15],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      // 代码风格
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1, maxBOF: 0 }],
      'no-trailing-spaces': 'warn',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    },
  },
  {
    files: ['**/sw.js', '**/service-worker.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        location: 'readonly',
        console: 'readonly',
        event: 'readonly',
        importScripts: 'readonly',
      },
    },
  }
);
