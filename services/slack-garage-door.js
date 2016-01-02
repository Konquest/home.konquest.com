module.exports = function (options) {
  this.options = options || {}
  this.options.eventBus = options.eventBus || new EventEmitter()

  if (!this.options.slackUrl) {
    throw new Error('Missing slackUrl parameter.')
  }

  var self = this
  var eventBus = this.options.eventBus
  eventBus.on(['doors', 'changed'], function (args) {
    var door = args[0]
    if (door.slug !== 'garage') {
      return
    }

    var oldDoor = args[1]

    if (oldDoor)
    var changedKeys = Object.keys(previous)
  })
}
