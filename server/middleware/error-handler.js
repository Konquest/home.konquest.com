var winston = require('winston')

module.exports = function (err, req, res, next) {
  err.status = err.status || 500

  if (err.status >= 500) {
    winston.error(err.message, {
      id: req.id,
      stack: err.stack
    })
  }

  var response = {
    code: err.code,
    message: err.message
  }

  if (err.errors) {
    response.errors = err.errors
  }

  res
    .status(err.status)
    .send(response)
}
