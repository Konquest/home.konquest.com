var assert = require('assert')
var request = require('supertest')
var fake = require('test/fixtures')

var db = require('database')
var Server = require('server')

describe('Doors', function() {
  var server
  var doors

  before(function (next) {
    server = new Server()
    doors = fake.doors(10)

    db.Door.destroy({truncate: true})
      .then(function () {
        return db.Door.bulkCreate(doors, {validate: true, individualHooks: true})
          .then(function (records) {
            for (var i = 0; i < records.length; i++) {
              doors[i].id = records[i].id
              doors[i].slug = records[i].slug
            }
          })
      })
      .then(function () {
        next()
      })
      .catch(function (err) {
        throw err
      })
  })

  describe('GET /api/doors', function () {
    it('should list', function (done) {
      request(server)
        .get('/api/doors')
        .set('Access-Key', 'qwerty')
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err)

          res.body.should.be.an.Array
          for (var i = 0; i < doors.length; i++) {
            res.body[i].should.have.property('name').and.equal(doors[i].name)
            res.body[i].should.have.property('isOpen').and.equal(doors[i].isOpen)
          }

          done()
        })
    })
  })

  describe('POST /api/doors', function () {
    // TODO test to fail creation
    it('should create', function (done) {
      var newDoor = fake.door()

      request(server)
        .post('/api/doors')
        .set('Access-Key', 'qwerty')
        .send(newDoor)
        .expect(201)
        .end(function (err, res) {
          assert.ifError(err)

          res.body.should.be.an.Object
          res.body.should.have.property('name').and.equal(newDoor.name)
          res.body.should.have.property('isOpen').and.equal(newDoor.isOpen)

          done()
        })
    })

    it('should trigger event doors:created', function (done) {
      var newDoor = fake.door()
      var triggered = false

      request(server)
        .post('/api/doors')
        .set('Access-Key', 'qwerty')
        .send(newDoor)
        .expect(201)
        .end(function (err, res) {
          assert.ifError(err)

          triggered.should.equal(true)

          done()
        })

      var eventBus = server.get('event bus')
      eventBus.on(['doors', 'created'], function (door) {
        door.should.be.an.Object
        door.should.have.property('name').and.equal(newDoor.name)
        door.should.have.property('isOpen').and.equal(newDoor.isOpen)

        triggered = true
      })
    })
  })

  describe('GET /api/doors/:door', function () {
    it('should show by id', function (done) {
      request(server)
        .get('/api/doors/' + doors[0].id)
        .set('Access-Key', 'qwerty')
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err)

          res.body.should.be.an.Object
          res.body.should.have.property('id').and.equal(doors[0].id)
          res.body.should.have.property('name').and.equal(doors[0].name)

          done()
        })
    })

    it('should show by slug', function (done) {
      request(server)
        .get('/api/doors/' + doors[0].slug)
        .set('Access-Key', 'qwerty')
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err)

          res.body.should.be.an.Object
          res.body.should.have.property('id').and.equal(doors[0].id)
          res.body.should.have.property('slug').and.equal(doors[0].slug)
          res.body.should.have.property('name').and.equal(doors[0].name)

          done()
        })
    })
  })

  describe('PUT /api/doors/:door', function () {
    // TODO test to fail update
    it('should update', function (done) {
      var changedIsOpen = !doors[0].isOpen

      request(server)
        .put('/api/doors/' + doors[0].id)
        .set('Access-Key', 'qwerty')
        .send({ isOpen: changedIsOpen })
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err)

          res.body.should.be.an.Object
          res.body.should.have.property('id').and.equal(doors[0].id)
          res.body.should.have.property('slug').and.equal(doors[0].slug)
          res.body.should.have.property('name').and.equal(doors[0].name)
          res.body.should.have.property('isOpen').and.not.equal(doors[0].isOpen)
          res.body.should.have.property('isOpen').and.equal(changedIsOpen)

          done()
        })
    })

    it('should trigger event doors:changed', function (done) {
      var changedIsOpen = !doors[0].isOpen
      var triggered = false

      request(server)
        .put('/api/doors/' + doors[0].id)
        .set('Access-Key', 'qwerty')
        .send({ isOpen: changedIsOpen })
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err)


          triggered.should.equal(true)
          done()
        })

      var eventBus = server.get('event bus')
      eventBus.on(['doors', 'changed'], function (door) {
        door.should.be.an.Object
        door.should.have.property('id').and.equal(doors[0].id)
        door.should.have.property('slug').and.equal(doors[0].slug)
        door.should.have.property('name').and.equal(doors[0].name)
        door.should.have.property('isOpen').and.not.equal(doors[0].isOpen)
        door.should.have.property('isOpen').and.equal(changedIsOpen)

        triggered = true
      })
    })
  })

  describe('DELETE /api/doors/:door', function () {
    it('should destroy', function (done) {
      request(server)
        .delete('/api/doors/' + doors[0].id)
        .set('Access-Key', 'qwerty')
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err)

          res.text.should.equal('')

          done()
        })
    })

    it.skip('should trigger event doors:deleted', function (done) {
      var triggered = false
      request(server)
        .delete('/api/doors/' + doors[0].id)
        .set('Access-Key', 'qwerty')
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err)

          triggered.should.equal(true)

          done()
        })

      var eventBus = server.get('event bus')
      eventBus.on(['doors', 'deleted'], function (door) {

        // console.log(door)
        door.should.be.an.Object
        door.should.have.property('id').and.equal(doors[0].id)

        triggered = true
      })
    })
  })
})
