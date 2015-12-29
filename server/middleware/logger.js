var pkg = require('package.json')
var winston = require('winston')
var uuid = require('uuid')

module.exports = function (req, res, next) {
  req.id = req.header('x-request-id') || uuid.v4()
  req.startTime = process.hrtime()
  res.tags = []

  res.on('finish', function () {
    var diff = process.hrtime(req.startTime)

    // The log is done in a particular order
    var log = {
      id: req.id,
      ip: req.ip,

      method: req.method,
      url: req.originalUrl,
      agent: req.get('user-agent')
    }

    if (req.header('content-type')) {
      log.reqType = req.header('content-type')
      log.reqSize = req.header('content-length')
    }

    log.status = res.statusCode

    if (res.get('content-type')) {
      log.type = res.get('content-type')
      log.size = res.get('content-length')
    }

    log.tags = res.tags
    log.took = diff[0] * 1e3 + diff[1] * 1e-6

    winston.info('http', log)
  })

  next()
}
