var express = require('express')
var winston = require('winston')

var db = require('database')
var Controller = require('util/controller')

var router = module.exports = express.Router()

var doorController = new Controller({
  model: db.Door,
  key: 'door',
  errorLogger: winston.error
})

router.use(function (req, res, next) {
  res.tags.push('doors')
  next()
})

// Parse ID
router.param('door', doorController.param)

router.route('/')
  .get(doorController.list)
  .post(doorController.create)

router.route('/:door')
  .get(doorController.show)
  .put(doorController.update)
  .delete(doorController.delete)
