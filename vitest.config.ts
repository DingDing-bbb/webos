import { defineConfig } from 'vitest/config';
import path from 'path';

const PKG = (p: string) => path.resolve(__dirname, 'packages', p);

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
      '@webos/kernel': PKG('kernel/src'),
      '@webos/kernel/types': PKG('kernel/src/types.ts'),
      '@webos/kernel/core': PKG('kernel/src/core'),
      '@webos/ui': PKG('ui/src'),
      '@webos/ui/base': PKG('ui/src/base'),
      '@webos/ui/theme': PKG('ui/src/theme'),
      '@webos/ui/display': PKG('ui/src/display'),
      '@webos/ui/feedback': PKG('ui/src/feedback'),
      '@webos/ui/input': PKG('ui/src/input'),
      '@webos/ui/layout': PKG('ui/src/layout'),
      '@webos/ui/navigation': PKG('ui/src/navigation'),
      '@webos/ui/components': PKG('ui/src/components'),
      '@webos/ui/hooks': PKG('ui/src/hooks'),
      '@webos/ui/utils': PKG('ui/src/utils'),
      '@webos/bootloader': PKG('bootloader/src'),
      '@webos/i18n': PKG('i18n/src'),
      '@webos/oobe': PKG('oobe/src'),
      '@webos/recovery': PKG('recovery/src'),
      '@webos/apps': PKG('apps'),
      '@webos/sdk': PKG('sdk/src'),
    },
  },
});
