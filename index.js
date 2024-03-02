require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

const unknownEndpoint = (req, res) => res.status(404).send({ error: 'unknown endpoint' })
app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.log(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  next(err)
}
app.use(errorHandler)

app.get('/', (req, res) => {
  res.send('<h1>Loading...</h1>')
})

app.get('/api/notes', (req, res) => {
  Note
    .find({})
    .then(notes => {
      res.json(notes)
    })
})

app.get('/api/notes/:id', (req, res, next) => {
  Note
    .findById(req.params.id)
    .then(note => {
      if (note) {
        console.log(note)
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch(err => next(err))
})

app.post('/api/notes/', (req, res) => {
  const body = req.body

  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false
  })
  note
    .save()  
    .then(result => {
      console.log('new note is saved')
      res.json(result)
    })
})

app.delete('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id)
  notes = notes.filter(note => note.id !== id)

  res.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})