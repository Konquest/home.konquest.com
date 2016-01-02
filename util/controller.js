var isUUID = require('util/uuid').isUUID
var ValidationError = require('sequelize').ValidationError

var routify = function (method, obj) {
  var actualMethod = '_' + method
  obj[actualMethod] = obj[method] // Backup
  obj[method] = function () { // Replace
    return obj[actualMethod].apply(obj, arguments)  // Call real method
  }
}


/**
  Creates basic controllers

  Parameters:
  model - Sequelize Model class
  key - field to save in `res.locals` hash for single records (create, show, update)
  keys - field to save in `res.locals` hash for multiple records (list)

  Note: Upon update, `{key}_old` will be used to store the old record as JSON
*/
var Controller = module.exports = function (options) {
  var opts = options || {}
  opts.list = opts.list || {}
  opts.create = opts.create || {}
  opts.show = opts.show || {}
  opts.update = opts.update || {}
  opts.delete = opts.delete || {}

  // Validation
  if (!opts.model) {
    throw new Error('Missing model paramter.')
  }
  if (!opts.key) {
    throw new Error('Missing key paramter.')
  }
  if (!opts.keys) {
    throw new Error('Missing keys paramter.')
  }

  // Default handlers
  opts.onError = function (err, req, res) {
    if (err instanceof ValidationError) {
      err.status = 400
    }
  }.bind(this)
  opts.onSuccess = function (record, req, res) {}

  this.options = opts

  // Change functions to be able to be routed in express
  routify('param', this)
  routify('list', this)
  routify('create', this)
  routify('show', this)
  routify('update', this)
  routify('delete', this)
}

Controller.prototype.param = function (req, res, next, id) {
  var where = {}
  if (isUUID(id)) {
    where.id = id
  } else {
    where.slug = id
  }

  var self = this
  this.options.model.findOne({ where: where })
    .then(function (record) {
      res.locals[self.options.key] = record
      next()
    }).catch(next)
}

Controller.prototype.list = function (req, res, next) {
  // TODO better querying (pagination, fields)
  var self = this
  this.options.model.findAll()
    .then(function (records) {
      res.locals[self.options.keys] = records
      self.options.onSuccess(records, req, res)
    })
    .then(next)
    .catch(function (err) {
      self.options.onError(records, req, res)
      next(err)
    })
}

Controller.prototype.create = function (req, res, next) {
  var self = this
  this.options.model.create(req.body)
    .then(function (record) {
      return record.reload()
    })
    .then(function (record) {
      res.locals[self.options.key] = record
      self.options.onSuccess(record, req, res)
    })
    .then(next)
    .catch(function (err) {
      self.options.onError(err, req, res)
      next(err)
    })
}

Controller.prototype.show = function (req, res, next) {
  if (!res.locals[this.options.key]) {
    return next()
  }

  this.options.onSuccess(res.locals[this.options.key], req, res)
  next()
}

Controller.prototype.update = function (req, res, next) {
  if (!res.locals[this.options.key]) {
    return next()
  }

  var self = this

  res.locals[this.options.key + '_old'] = JSON.parse(JSON.stringify(res.locals[this.options.key].toJSON())) // Store old record

  res.locals[this.options.key].update(req.body, {limit: 1})
    .then(function (record) {
      return record.reload()
    })
    .then(function (record) {
      res.locals[self.options.key] = record
      self.options.onSuccess(record, req, res)
    })
    .then(next)
    .catch(function (err) {
      self.options.onError(err, req, res)
      next(err)
    })
}

Controller.prototype.delete = function (req, res, next) {
  if (!res.locals[this.options.key]) {
    return next()
  }

  var self = this
  res.locals[this.options.key].destroy()
    .then(function (record) {
      // console.log(record.toJSON())
      res.locals[self.options.key] = record
      self.options.onSuccess(record, req, res)
    })
    .then(next)
    .catch(function (err) {
      self.options.onError(err, req, res)
      next(err)
    })
}
