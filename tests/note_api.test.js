const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Note = require('../models/note')

describe('initializing and getting all notes', () => {
  beforeEach(async () => {
    await Note.deleteMany({})

    const noteObj = helper.initialNotes.map(note => new Note(note))
    const promiseArr = noteObj.map(note => note.save())

    await Promise.all(promiseArr)
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two notes', async () => {
    const res = await api.get('/api/notes')

    assert.strictEqual(res.body.length, helper.initialNotes.length)
  })

  test('the first note is about HTTP methods', async () => {
    const res = await api.get('/api/notes')

    const contents = res.body.map(e => e.content)
    assert.strictEqual(contents.includes('HTML is easy'), true)
  })

  describe('getting and view a specific note', () => {
    test('a specific note can be viewed', async () => {
      const notesAtStart = await helper.noteInDb()

      const noteToView = notesAtStart[0]

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultNote.body, noteToView)
    })
  })

  describe('adding a new note', () => {
    test('note w/o content isn\'t added', async () => {
      const newNote = {
        important: true,
      }

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)

      const notesAtEnd = await helper.noteInDb()
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
    })

    test('a valid note can be added', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      }

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await helper.noteInDb()
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

      const contents = await notesAtEnd.map(n => n.content)
      assert(contents.includes('async/await simplifies making async calls'))
    })
  })

  describe('note deleting', () => {
    test('successed with code 204 if \'id\' is valid', async () => {
      const notesAtStart = await helper.noteInDb()
      const noteToDelete = notesAtStart[0]

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)

      const notesAtEnd = await helper.noteInDb()

      const contents = notesAtEnd.map(n => n.content)
      assert(!contents.includes(noteToDelete.content))

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})