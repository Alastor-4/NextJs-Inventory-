const { withAxiom } = require('next-axiom');

module.exports = withAxiom({
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '',
      },
    ],
  }
})


