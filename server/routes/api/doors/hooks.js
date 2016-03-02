/**
  Notification CRUD hooks
**/

exports.created = function hookCreate (req, res, next) {
  req.eventBus.emit(['doors', 'created'], res.locals.door.toJSON())
  next()
}

exports.updated = function hookUpdated (req, res, next) {
  var keysNew = Object.keys(res.locals.door.dataValues)
  var keysOld = Object.keys(res.locals.door_old)

  var changedNew = keysNew.some(function (key) {
    if (key === 'updatedAt' || key === 'createdAt') return false
    return res.locals.door[key] !== res.locals.door_old[key]  // True if field has changed
  })

  var changedOld = keysOld.some(function (key) {
    if (key === 'updatedAt' || key === 'createdAt') return false
    return res.locals.door[key] !== res.locals.door_old[key]  // True if field has changed
  })

  if (changedNew || changedOld) {
    req.eventBus.emit(['doors', 'updated'], res.locals.door.toJSON(), res.locals.door_old)  // door_old is already json since record doesn't actually exist
  }
  next()
}

exports.deleted = function hookDelete (req, res, next) {
  req.eventBus.emit(['doors', 'deleted'], res.locals.door.toJSON())
  next()
}
