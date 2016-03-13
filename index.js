require('dotenv').load()
var winston = require('winston')

var EventEmitter = require('eventemitter2').EventEmitter2
var format = require('util').format
var Server = require('server')
var db = require('database')

// var Publisher = require('services/iot-publisher')
var GarageDoorNotifier = require('services/garage-door-notifier')

winston.level = process.env.LOG_LEVEL

var eventBus = new EventEmitter()
var server = new Server({eventBus})
var notifier = new GarageDoorNotifier({eventBus})
// var iot = new Publisher({eventBus})  // For distributed

db.sequelize.sync() // not wise, but small project. so whatevs
  .then(function () {
    server.listen(process.env.PORT, function () {
      winston.info(format('Started %s server on port %d', server.get('env'), process.env.PORT))
    })
  })
