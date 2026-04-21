import { defineConfig } from 'vitest/config';
import path from 'path';

const PKG = (p: string) => path.resolve(__dirname, 'packages/os/packages', p);

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/*.test.{ts,tsx}', 'site/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@kernel': PKG('kernel/src'),
      '@kernel/types': PKG('kernel/src/types.ts'),
      '@kernel/core': PKG('kernel/src/core'),
      '@ui': PKG('ui/src'),
      '@ui/base': PKG('ui/src/base'),
      '@ui/theme': PKG('ui/src/theme'),
      '@ui/display': PKG('ui/src/display'),
      '@ui/feedback': PKG('ui/src/feedback'),
      '@ui/input': PKG('ui/src/input'),
      '@ui/layout': PKG('ui/src/layout'),
      '@ui/navigation': PKG('ui/src/navigation'),
      '@ui/components': PKG('ui/src/components'),
      '@ui/hooks': PKG('ui/src/hooks'),
      '@ui/utils': PKG('ui/src/utils'),
      '@webos/ui': PKG('ui/src'),
      '@i18n': PKG('i18n/src'),
      '@oobe': PKG('oobe/src'),
      '@bootloader': PKG('bootloader/src'),
      '@recovery': PKG('recovery/src'),
      '@tablet': PKG('tablet/src'),
      '@apps': PKG('apps'),
      '@app': PKG('apps'),
      '@webos/sdk': PKG('sdk/src'),
    },
  },
});
