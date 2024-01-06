const { withAxiom } = require('next-axiom')
const runtimeCaching = require('next-pwa/cache.js')

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
    swcMinify: true,      // Enable SWC minification for improved performance
    compiler: {
        removeConsole: process.env.NODE_ENV !== "development", // Remove console.log in production
    },
    serverActions: {allowedOrigins: ["*"]}
};

const withPWA = require("next-pwa")({
    dest: "public", // Destination directory for the PWA files
    //disable: !isProduction,
    disable: false,
    register: true, // Register the PWA service worker
    skipWaiting: true, // Skip waiting for service worker activation
    runtimeCaching,
});

module.exports = withPWA(withAxiom(nextConfig))
