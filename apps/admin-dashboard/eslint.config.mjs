import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],

  {
    files: ['**/*.ts'],
    rules: {
      // Angular selector rules
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],

      // Optional: Prettier squiggles in TS
      'prettier/prettier': 'error',
      // Optional: Angular best practices
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
      'import/order': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },

  {
    files: ['**/*.html'],
    rules: {
      // Prettier + Angular template best practices
      'prettier/prettier': ['error', { parser: 'angular' }],
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
];
