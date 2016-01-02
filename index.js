var dotenv = require('dotenv')
dotenv.load()

var winston = require('winston')
winston.level = process.env.LOG_LEVEL

var EventEmitter = require('eventemitter2').EventEmitter2
var format = require('util').format
var Server = require('server')
var db = require('database')
var Publisher = require('services/iot-publisher')

var eventBus = new EventEmitter()
var server = new Server({eventBus})
// var iot = new Publisher({eventBus})

db.sequelize.sync()
  .then(function () {
    server.listen(process.env.PORT, function () {
      winston.info(format('Started %s server on port %d', server.get('env'), process.env.PORT))
    })
  })
