/**
  Notification CRUD hooks
**/

exports.created = function hookCreate (req, res, next) {
  req.eventBus.emit(['doors', 'created'], res.locals.door.toJSON())
  next()
}

exports.changed = function hookChanged (req, res, next) {
  var keys = Object.keys(res.locals.door.dataValues)

  // Assume newer object has more fields
  var changed = keys.some(function (key) {
    return res.locals.door[key] !== res.locals.door_old[key]  // True if field has changed
  })

  if (changed) {
    req.eventBus.emit(['doors', 'changed'], res.locals.door.toJSON(), res.locals.door_old)  // door_old is already json since record doesn't actually exist
  }
  next()
}

exports.deleted = function hookDelete (req, res, next) {
  // console.log(res.locals.door)
  req.eventBus.emit(['doors', 'deleted'], res.locals.door.toJSON())
  next()
}
