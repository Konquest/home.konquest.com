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
    server.post('/notify', function (req, res) {
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
      slackUrl: baseUrl + '/notify'
    })
    notifier.startOpenTime = Date.now() - 120000 // 2 minute

    notifier.notify()
  })

  it('should notify on garage door update event', function (next) {
    var eventBus = new EventEmitter()
    server.post('/garage-open-notify', function (req, res) {
      next()
    })

    var notifier = new Notifier({
      eventBus: eventBus,
      notifyAfter: 100, // 100 ms
      slackUrl: baseUrl + '/garage-open-notify'
    })

    var newDoor = {slug: 'garage', isOpen: true}
    var oldDoor = {slug: 'garage', isOpen: false}
    eventBus.emit(['doors', 'updated'], newDoor, oldDoor)
  })
})
