// Root dispatcher for /api/platform -> /api/platform/[...path].js
const handler = require('./platform/[...path].js');

module.exports = async (req, res) => {
  return handler(req, res);
};
