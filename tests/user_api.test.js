const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  after(async () => await mongoose.connection.close())
  test('creqtion succeeds with a fresh username', async () => {
    const usersAtStart = await helper.userInDb()

    const newUser = {
      username: 'pagon',
      name: 'Petr Agonov',
      password: 'paGryuO32',
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.userInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('if username already exists, failure occurs with status code & message', async () => {
    const usersAtStart = await helper.userInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'sekret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const userAtEnd = await helper.userInDb()
    assert.strictEqual(userAtEnd.length, usersAtStart.length)

    assert(result.body.error.includes('expected `username` to be unique'))
  })
})
