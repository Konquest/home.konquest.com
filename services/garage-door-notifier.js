var EventEmitter = require('eventemitter2').EventEmitter2
var format = require('printf')
var request = require('superagent')
var winston = require('winston')

var MINUTE = 1000 * 60

var GarageDoorNotifier = module.exports = function (options) {
  this.options = options || {}
  this.options.eventBus = options.eventBus || new EventEmitter()
  this.options.notifyAfter = options.notifyAfter || (MINUTE * 15) // Defaults to 15 minutes
  this.options.slackUrl = options.slackUrl || 'https://hooks.slack.com/services/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'
  this.options.notification = '@kenneth: Garage door has been open for %(timeMin)s mins'
  this.dict = {}

  if (!this.options.slackUrl) {
    throw new Error('Missing slackUrl parameter.')
  }

  var self = this
  var eventBus = this.options.eventBus
  eventBus.on(['doors', 'changed'], function (args) {
    var door = args[0]
    if (door.slug !== 'garage') {
      return
    }

    var oldDoor = args[1]

    if (!oldDoor.isOpen && door.isOpen) {
      // Door just opened
      self.startOpenTime = Date.now()
      self.timeout = setTimeout(self.notify.bind(self), self.options.nofityAfter)
      self.dict = JSON.parse(JSON.stringify(door)) // Clone door
    }
    var changedKeys = Object.keys(previous)
  })
}

GarageDoorNotifier.prototype.notify = function () {
  this.dict.timeMin = Math.round((Date.now() - this.startOpenTime) / MINUTE)
  request
    .post(this.options.slackUrl)
    .type('form')
    .send({
      payload: JSON.stringify({
        text: format(this.options.notification, this.dict)
      })
    })
    .end(function (res) {
      // Ummm now what?
      winston.info('Notified slack that door was open for ' + this.dict.timeMin + 'mins')
    })
}
