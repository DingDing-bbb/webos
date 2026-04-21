import { defineConfig } from 'vitest/config';
import path from 'path';

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
      '@kernel': path.resolve(__dirname, 'packages/os/packages/kernel/src'),
      '@ui': path.resolve(__dirname, 'packages/os/packages/ui/src'),
      '@i18n': path.resolve(__dirname, 'packages/os/packages/i18n/src'),
      '@oobe': path.resolve(__dirname, 'packages/os/packages/oobe/src'),
      '@bootloader': path.resolve(__dirname, 'packages/os/packages/bootloader/src'),
      '@recovery': path.resolve(__dirname, 'packages/os/packages/recovery/src'),
      '@tablet': path.resolve(__dirname, 'packages/os/packages/tablet/src'),
      '@apps': path.resolve(__dirname, 'packages/os/packages/apps'),
      '@app': path.resolve(__dirname, 'packages/os/packages/apps'),
    },
  },
});
