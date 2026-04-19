// @ts-check

// Import validated env at build time; fails fast if required vars are missing.
import './src/lib/env.mjs';

/**
 * Strict Content-Security-Policy. We serve only our own scripts + Stripe.
 * Inline scripts are blocked in production; Next.js injects a nonce via its
 * built-in runtime.
 */
// Clerk loads JS from its frontend API domain (configured per instance). During
// dev this is https://*.clerk.accounts.dev; in prod it is typically
// clerk.<your-domain>. We allow both. Clerk CAPTCHA (Cloudflare Turnstile) is
// iframed from challenges.cloudflare.com.
const cspProd = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'", // Tailwind injects inline styles at build time
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.clerk.accounts.dev https://*.clerk.com wss://*.clerk.accounts.dev https://*.posthog.com https://*.sentry.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspProd },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typedRoutes: true,
  transpilePackages: ['@privaforge/encryption', '@privaforge/api-types'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
