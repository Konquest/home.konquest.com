var dotenv = require('dotenv')
dotenv.load()

var winston = require('winston')
winston.level = 'error'

var db = require('database')

describe('Home', function () {
  before(function (next) {
    db.sequelize.sync()
      .then(function () {
        next()
      })
  })

  require('./util')
  require('./server')
})
