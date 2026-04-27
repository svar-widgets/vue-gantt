import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import globals from 'globals'

const vueConfigs = [...vue.configs["flat/recommended"], {
  rules: {
    'vue/html-indent': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/attributes-order': 'off',
    'vue/require-prop-types': 'off',
    'vue/require-default-prop': 'off',
    'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
  },
}];

export default [
  {
    ignores: ['dist', 'dist-demos', 'dist-full', 'src/libs', 'vite.config.js'],
  },
  ...vueConfigs,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    plugins: {
      vue
    },
    rules: {
      ...js.configs.recommended.rules,

      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
        },
      ],
    },
  },
];
