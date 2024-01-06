const withPWA = require('next-pwa')
const { withAxiom } = require('next-axiom')
const runtimeCaching = require('next-pwa/cache.js')

const isProduction = process.env.NODE_ENV === 'production';

const pwaConfig = {
  dest: 'public',
  disable: false,
  runtimeCaching
}

module.exports = withPWA({...pwaConfig})(withAxiom(
    {
      experimental: { serverActions: {allowedOrigins: ["*"]}},
      ...pwaConfig,
    }
))
