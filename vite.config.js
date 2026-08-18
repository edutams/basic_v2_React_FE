import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

/**
 * Dev-only plugin to strip Content-Security-Policy headers.
 * When behind a reverse proxy that injects CSP with `script-src 'none'`,
 * this middleware strips those headers so Vite scripts can load.
 */
function stripCspPlugin() {
  return {
    name: 'strip-csp-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Strip restrictive CSP headers from upstream/proxy responses
        const origSetHeader = res.setHeader.bind(res);
        res.setHeader = (name, value) => {
          if (
            typeof name === 'string' &&
            /^content-security-policy$/i.test(name)
          ) {
            // Replace with a permissive CSP for dev
            return origSetHeader(name, "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; style-src 'self' 'unsafe-inline' https: data:; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https: ws: wss: data: blob:;");
          }
          return origSetHeader(name, value);
        };
        // Also delete any already-set CSP headers before they reach the browser
        const origRemoveHeader = res.removeHeader.bind(res);
        res.removeHeader = (name) => {
          if (typeof name === 'string' && /^content-security-policy$/i.test(name)) {
            return;
          }
          return origRemoveHeader(name);
        };
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      '@': resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
              loader: 'jsx',
              contents: await fs.readFile(args.path, 'utf8'),
            }));
          },
        },
      ],
    },
  },


  build: {
    target: 'esnext', // enables top-level await
  },
  plugins: [svgr(), react(), stripCspPlugin()],
  server: {
    host: true,
    strictPort: true,
    allowedHosts: true,
  },
});
