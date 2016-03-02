var express = require('express')
var winston = require('winston')

var db = require('database')
var hook = require('./hooks')
var Controller = require('util/controller')

var router = module.exports = express.Router()

var doorController = new Controller({
  model: db.Door,
  key: 'door',
  keys: 'doors',
  errorLogger: winston.error
})

router.use(function (req, res, next) {
  res.tags.push('doors')
  next()
})

// Door views
function renderList (req, res, next) {
  res.send(res.locals.doors.map(function (door) {
    return door.toJSON()
  }))
}
function renderSingle (req, res, next) {
  res.send(res.locals.door.toJSON())
}
function statusCreated (req, res, next) {
  res.status(201)
  next()
}
function renderEmpty (req, res, next) {
  res.status(204)
  res.end()
}

// Routes with controllers and views
router.param('door', doorController.param)
router.route('/')
  .get(doorController.list, renderList)
  .post(doorController.create, hook.created, statusCreated, renderSingle)
router.route('/:door')
  .get(doorController.show, renderSingle)
  .put(doorController.update, hook.updated, renderSingle)
  .delete(doorController.delete, hook.deleted, renderEmpty)
