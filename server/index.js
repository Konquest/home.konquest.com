var compression = require('compression')
var bodyParser = require('body-parser')
var express = require('express')
var helmet = require('helmet')
var cors = require('cors')
var EventEmitter = require('eventemitter2').EventEmitter2

var express = require('express')
var routes = require('./routes')
var errorHandler = require('./middleware/error-handler')
var logger = require('./middleware/logger')

var Server = module.exports = function (options) {
  var opts = options || {}
  var app = express()
  var eventBus = opts.eventBus || new EventEmitter()

  app.set('event bus', eventBus)
  app.set('x-powered-by', false)
  app.set('trust proxy', process.env.TRUST_PROXY.toLowerCase() === 'true')
  app.use(compression())
  app.use(logger)
  app.use(helmet.xframe())
  app.use(helmet.nosniff())
  app.use(cors())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  // Pass event bus to request obj
  app.use(function (req, res, next) {
    req.eventBus = eventBus
    next()
  })

  routes(app)

  app.use(errorHandler)

  return app
}
