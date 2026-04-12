import { execSync } from 'node:child_process';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveBuildId() {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA.slice(0, 7);
  }

  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return `dev-${Date.now().toString(36)}`;
  }
}

function createVersionManifestPlugin(buildId: string, builtAt: string): Plugin {
  return {
    name: 'emit-version-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(
          {
            buildId,
            builtAt,
          },
          null,
          2,
        ),
      });
    },
  };
}

const buildId = resolveBuildId();
const builtAt = new Date().toISOString();

export default defineConfig({
  plugins: [react(), createVersionManifestPlugin(buildId, builtAt)],
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
    __APP_BUILT_AT__: JSON.stringify(builtAt),
  },
});
