import { defineConfig } from 'vitest/config';
import path from 'path';

const ROOT = path.resolve(__dirname);
const PKG = (p: string) => path.resolve(ROOT, p);

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@webos/kernel': PKG('kernel/bridge'),
      '@webos/kernel/types': PKG('kernel/bridge/types.ts'),
      '@webos/kernel/core': PKG('kernel/bridge/core'),
      '@webos/drivers': PKG('drivers/src'),
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
      '@webos/apps': PKG('apps'),
      '@webos/i18n': PKG('i18n/src'),
      '@webos/oobe': PKG('oobe/src'),
      '@webos/recovery': PKG('recovery/src'),
    },
  },
});
