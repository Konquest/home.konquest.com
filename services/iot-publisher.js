var EventEmitter = require('eventemitter2').EventEmitter2
var Redis = require('redis')

var Publisher = module.exports = function (options) {
  this.options = options || {}
  this.options.eventBus = options.eventBus || new EventEmitter()

  if (!this.options.redisUrl) {
    throw new Error('Missing redisUrl parameter.')
  }

  this.pub = Redis.createClient(this.options.redisUrl)
  var eventBus = this.options.eventBus

  eventBus.on('*', function () {
    var args = arguments.length > 1 ? Array.prototype.slice.call(arguments) : arguments[0]
    pub.publish(this.event, JSON.stringify(args))
  })
}
