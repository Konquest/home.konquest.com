
/**
  Sequelize Model Stub

  The model will have a special `lastCall` property that tracks the last method call.

  Options:
  * error - (bool) Whether to respond with an error.
  * result - (obj) Response to return.
  * trackReload - (bool) Tracks model.reload method calls.
*/
var Model = module.exports = function (options) {
  var opts = options || {}
  this.error = !!opts.error
  this.result = opts.result
  this.trackReload = opts.trackReload

  var model = this
  this.result.update = function () {
    model.lastCall = 'update'
    return new Promise(function (resolve, reject) {
      (model.error ? reject : resolve)(model.result)
    })
  }
  this.result.destroy = function () {
    model.lastCall = 'destroy'
    return new Promise(function (resolve, reject) {
      (model.error ? reject : resolve)(model.result)
    })
  }
  this.result.reload = function () {
    if (model.trackReload) {
      model.lastCall = 'reload'
    }
    return new Promise(function (resolve, reject) {
      (model.error ? reject : resolve)(model.result)
    })
  }
}

Model.prototype = ['findAll', 'findOne', 'create', 'update', 'destroy'].reduce(function (proto, method) {
  proto[method] = function () {
    var self = this
    this.lastCall = method
    return new Promise(function (resolve, reject) {
      (self.error ? reject : resolve)(self.result)
    })
  }
  return proto
}, {})
