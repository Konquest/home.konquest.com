var dotenv = require('dotenv')
dotenv.load()

var winston = require('winston')
winston.level = process.env.LOG_LEVEL

var format = require('util').format
var Server = require('server')
var db = require('database')

var server = new Server()

db.sequelize.sync()
  .then(function () {
    server.listen(process.env.PORT, function () {
      winston.info(format('Started %s server on port %d', server.get('env'), process.env.PORT))
    })
  })
