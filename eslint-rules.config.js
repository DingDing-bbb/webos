/**
 * WebOS ESLint 规则增强配置
 * 
 * 此文件包含额外的ESLint规则配置，用于强化代码质量检查
 */

export const reactRules = {
  // React Hooks 规则
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
  
  // React 最佳实践
  'react/jsx-uses-react': 'off', // React 17+ 不需要显式导入
  'react/react-in-jsx-scope': 'off', // React 17+ 不需要显式导入
  'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
  'react/jsx-props-no-spreading': 'warn',
  'react/prop-types': 'off', // 使用 TypeScript 代替
  
  // JSX 风格
  'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
  'react/jsx-boolean-value': ['warn', 'never'],
  'react/jsx-no-useless-fragment': 'warn',
  'react/jsx-no-comment-textnodes': 'warn',
  
  // 性能相关
  'react/jsx-no-constructed-context-values': 'warn',
  'react/no-unstable-nested-components': 'warn',
  
  // 可访问性
  'react/button-has-type': 'warn',
  'react/no-array-index-key': 'warn',
};

export const typescriptRules = {
  // TypeScript 最佳实践
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/explicit-function-return-type': 'off', // 允许类型推断
  '@typescript-eslint/explicit-module-boundary-types': 'off', // 允许类型推断
  
  // 代码质量
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'warn',
    { 
      prefer: 'type-imports',
      disallowTypeAnnotations: false 
    }
  ],
  
  // 命名约定
  '@typescript-eslint/naming-convention': [
    'warn',
    // 接口和类型使用 PascalCase
    {
      selector: ['interface', 'typeAlias'],
      format: ['PascalCase'],
      prefix: ['I', 'T'] // 可选：接口加 I 前缀，类型别名加 T 前缀
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
      leadingUnderscore: 'allow' // 允许 _ 前缀表示未使用参数
    },
    // 类使用 PascalCase
    {
      selector: 'class',
      format: ['PascalCase']
    },
    // React 组件使用 PascalCase
    {
      selector: 'variable',
      modifiers: ['const', 'exported'],
      format: ['PascalCase', 'camelCase'],
      filter: {
        regex: '^(?!use)[A-Z].*Component$',
        match: true
      }
    }
  ],
  
  // 安全相关
  '@typescript-eslint/no-unsafe-assignment': 'warn',
  '@typescript-eslint/no-unsafe-member-access': 'warn',
  '@typescript-eslint/no-unsafe-call': 'warn',
  '@typescript-eslint/no-unsafe-return': 'warn',
  
  // 代码组织
  '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
};

export const importRules = {
  // 导入组织
  'import/order': [
    'warn',
    {
      groups: [
        'builtin',    // Node.js 内置模块
        'external',   // 外部依赖
        'internal',   // 内部别名 (@kernel, @ui 等)
        'parent',     // 父目录
        'sibling',    // 同级目录
        'index',      // 当前目录的 index 文件
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
  
  // 导入规范
  'import/no-unresolved': 'off', // 由 TypeScript 处理
  'import/named': 'off', // 由 TypeScript 处理
  'import/namespace': 'off', // 由 TypeScript 处理
  'import/default': 'off', // 由 TypeScript 处理
  'import/no-named-as-default': 'warn',
  'import/no-duplicates': 'warn',
  'import/no-cycle': 'error',
  'import/no-self-import': 'error',
  'import/no-useless-path-segments': 'warn',
  'import/export': 'error',
  'import/no-mutable-exports': 'warn',
  'import/no-unused-modules': 'warn',
  'import/no-deprecated': 'warn',
};

export const generalRules = {
  // 代码风格
  'curly': ['error', 'all'],
  'eqeqeq': ['error', 'always', { null: 'ignore' }],
  'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  'no-debugger': 'warn',
  'no-alert': 'warn',
  
  // 最佳实践
  'no-var': 'error',
  'prefer-const': 'warn',
  'prefer-template': 'warn',
  'object-shorthand': 'warn',
  'arrow-body-style': ['warn', 'as-needed'],
  
  // 错误处理
  'no-throw-literal': 'error',
  'no-unused-expressions': 'error',
  
  // 复杂度
  'complexity': ['warn', 15], // 圈复杂度警告阈值
  'max-depth': ['warn', 4], // 最大嵌套深度
  'max-params': ['warn', 4], // 函数最多参数数
  'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
  
  // 安全
  'no-eval': 'error',
  'no-implied-eval': 'error',
  
  // 可读性
  'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1, maxBOF: 0 }],
  'no-trailing-spaces': 'warn',
  'semi': ['error', 'always'],
  'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  
  // 命名
  'camelcase': 'off', // 由 @typescript-eslint/naming-convention 处理
  
  // 注释
  'capitalized-comments': ['warn', 'always', { ignoreConsecutiveComments: true }],
  'multiline-comment-style': ['warn', 'starred-block'],
};

export const testingRules = {
  // 测试相关规则（如果使用 Vitest/Jest）
  'testing-library/prefer-screen-queries': 'warn',
  'testing-library/no-wait-for-multiple-assertions': 'warn',
  'testing-library/no-debugging-utils': 'warn',
  'testing-library/prefer-presence-queries': 'warn',
  'testing-library/prefer-find-by': 'warn',
};

/**
 * 获取完整的规则配置
 */
export function getEnhancedRules() {
  return {
    ...generalRules,
    ...typescriptRules,
    ...reactRules,
    ...importRules,
    ...testingRules,
  };
}

/**
 * 特定环境的规则覆盖
 */
export const envOverrides = {
  // 开发环境
  development: {
    'no-console': 'off',
    'no-debugger': 'off',
  },
  
  // 测试环境
  test: {
    'no-console': 'off',
    'max-lines-per-function': 'off',
    'max-depth': 'off',
    'complexity': 'off',
  },
  
  // 生产环境
  production: {
    'no-console': ['error', { allow: ['error'] }],
    'no-debugger': 'error',
  },
};

export default {
  reactRules,
  typescriptRules,
  importRules,
  generalRules,
  testingRules,
  getEnhancedRules,
  envOverrides,
};