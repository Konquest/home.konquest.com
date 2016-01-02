var api = require('./api')
var access = require('../middleware/access')

module.exports = function (app) {
  app.use('/api', access, api)

  // TODO frontend stuffage
}
