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
  this.startOpenTime = 0

  if (!this.options.slackUrl) {
    throw new Error('Missing slackUrl parameter.')
  }

  var self = this
  var eventBus = this.options.eventBus
  eventBus.on(['doors', 'updated'], function (newDoor, oldDoor) {
    if (newDoor.slug !== 'garage') {
      return
    }

    if (!oldDoor.isOpen && newDoor.isOpen) {
      // Door just opened
      winston.verbose('Garage door just opened.')
      self.startOpenTime = Date.now()
      self.timeout = setTimeout(self.notify.bind(self), self.options.notifyAfter)
      self.dict = JSON.parse(JSON.stringify(newDoor)) // Clone door
    }

    if (oldDoor.isOpen && !newDoor.isOpen) {
      // Door just closed
      winston.verbose('Garage door just closed.')
      clearTimeout(self.timeout)
    }
  })
}

GarageDoorNotifier.prototype.notify = function () {
  var self = this
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
      winston.info('Notified slack that door was open for ' + self.dict.timeMin + 'mins')
    })
}
