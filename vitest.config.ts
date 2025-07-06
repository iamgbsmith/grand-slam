import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// This merges the plugins and other settings from your main vite.config.ts
// with your test-specific configuration.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Your existing test configuration goes here.
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setupTests.ts',
    },
  })
);