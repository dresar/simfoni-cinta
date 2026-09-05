import 'dotenv/config';
import * as esbuild from 'esbuild';

const define = {};

const envKeys = [
  'DATABASE_URL',
  'NEON_AUTH_URL',
  'NEON_AUTH_BASE_URL',
  'NEON_AUTH_COOKIE_SECRET',
  'NEXT_PUBLIC_NEON_AUTH_BASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'MAYAR_API_KEY',
  'MAYAR_WEBHOOK_TOKEN',
  'MAYAR_BASE_URL',
  'CLOUDFLARE_TURNSTILE_SECRET_KEY',
  'TURNSTILE_SECRET',
  'TURNSTILE_SITE_KEY',
  'CLOUDFLARE_TURNSTILE_SITE_KEY',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'VITE_TURNSTILE_SITE_KEY',
  'TURNSTILE_HOSTNAMES',
  'NEXT_PUBLIC_APP_URL',
  'GITHUB_STORAGE_TOKEN',
  'GITHUB_STORAGE_OWNER',
  'GITHUB_STORAGE_REPO',
  'GITHUB_STORAGE_BRANCH',
  'GITHUB_STORAGE_CDN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
  'HOLVERAI_API_KEY',
  'HOLVERAI_BASE_URL',
];

for (const key of envKeys) {
  if (process.env[key]) {
    define[`process.env.${key}`] = JSON.stringify(process.env[key]);
  }
}

await esbuild.build({
  entryPoints: ['dist/server/server.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/client/_worker.js',
  target: 'es2022',
  mainFields: ['module', 'main'],
  define,
  alias: {
    'react-dom/server.node': 'react-dom/server.edge',
    'react-dom/server': 'react-dom/server.edge',
  },
  external: [
    'node:*',
    'util',
    'crypto',
    'buffer',
    'stream',
    'events',
    'async_hooks',
    'fs',
    'fs/promises',
    'path',
    'os',
    'url',
    'http',
    'https',
    'net',
    'tls',
    'zlib',
  ],
});
