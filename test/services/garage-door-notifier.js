var express = require('express')
var EventEmitter = require('eventemitter2').EventEmitter2
var Notifier = require('services/garage-door-notifier')

describe('Garage Door Notifier', function () {
  var server
  var baseUrl

  before(function (next) {
    server = express()
    server.listen(function () {
      baseUrl = 'http://127.0.0.1:' + this.address().port
      next()
    })
  })

  it('should notify slack url', function (next) {
    server.post('/notify2', function (req, res) {
      var body = []
      req
        .on('error', next)
        .on('data', chunk => { body.push(chunk) })
        .on('end', function() {
          var payload = JSON.parse(unescape(Buffer.concat(body).toString().split('=')[1]))

          payload.should.have.property('text').and.equal('@kenneth: Garage door has been open for 2 mins')

          next()
        })
    })

    var notifier = new Notifier({
      slackUrl: baseUrl + '/notify2',
      notifyAfter: 0
    })
    notifier.startOpenTime = Date.now() - 120000 // 2 minute

    notifier.notify()
  })

  it('should notify slack url in default 15 minutes', function (next) {
    server.post('/notify15', function (req, res) {
      var body = []
      req
        .on('error', next)
        .on('data', chunk => { body.push(chunk) })
        .on('end', function() {
          var payload = JSON.parse(unescape(Buffer.concat(body).toString().split('=')[1]))

          payload.should.have.property('text').and.equal('@kenneth: Garage door has been open for 15 mins')

          next()
        })
    })

    var notifier = new Notifier({
      slackUrl: baseUrl + '/notify15',
      // notifyAfter: 15 * 60 * 1000  // Default is 15 minutes
    })
    notifier.startOpenTime = Date.now() - 900000 + 50 // 15 minute

    notifier.notify()
  })

  it('should notify on garage door update event', function (next) {
    var eventBus = new EventEmitter()
    var now

    server.post('/garage-open-notify', function (req, res) {
      (Date.now() - now).should.be.approximately(100, 5)
      next()
    })

    var notifier = new Notifier({
      eventBus: eventBus,
      notifyAfter: 100, // 100 ms
      slackUrl: baseUrl + '/garage-open-notify'
    })

    var openedDoor = {slug: 'garage', isOpen: true}
    var closedDoor = {slug: 'garage', isOpen: false}

    now = Date.now()
    eventBus.emit(['doors', 'updated'], openedDoor, closedDoor) // args: event, new door, old door
  })

  it('should not notify if garage door closed in time', function (next) {
    var eventBus = new EventEmitter()
    var notified = false

    server.post('/garage-open-notify', function (req, res) {
      notified = true
      next(new Error('Notified. This should not have happened.'))
    })

    var notifier = new Notifier({
      eventBus: eventBus,
      notifyAfter: 100, // 100 ms
      slackUrl: baseUrl + '/garage-open-notify'
    })

    var openedDoor = {slug: 'garage', isOpen: true}
    var closedDoor = {slug: 'garage', isOpen: false}

    now = Date.now()
    eventBus.emit(['doors', 'updated'], openedDoor, closedDoor)

    setTimeout(function () {
      // Close the door
      eventBus.emit(['doors', 'updated'], closedDoor, openedDoor) // args: event, new door, old door
    }, 50)

    setTimeout(function () {
      if (!notified) {
        next()
      }
    }, 150)
  })
})
