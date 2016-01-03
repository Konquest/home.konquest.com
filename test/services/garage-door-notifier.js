var express = require('express')
var Notifier = require('services/garage-door-notifier')

describe('Garage Door Notifier', function () {
  var server
  var baseUrl

  before(function (next) {
    server = express()
    var listener = server.listen(0)
    baseUrl = 'http://127.0.0.1:' + listener.address().port
    next()
  })

  it.skip('should notify slack url', function (next) {
    server.post('/notify', function (req, res) {
      console.log(req)

      res.send(req.body)
      next()
    })

    var notifier = new Notifier({
      slackUrl: baseUrl + '/notify'
    })

    notifier.notify()
  })
})
