const { withAxiom } = require('next-axiom');

module.exports = withAxiom({
  experimental: {
    serverActions: {allowedOrigins: ["*"]},
  }
})
