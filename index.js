require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')


const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))



app.get('/', (req, res) => {
  res.send('<h1>Loading...</h1>')
})

app.get('/api/notes', (req, res, next) => {
  Note
    .find({})
    .then(notes => {
      res.json(notes)
    })
    .catch(err => next(err))
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

app.post('/api/notes', (req, res, next) => {
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
    .catch(err => next(err))
})

app.delete('/api/notes/:id', (req, res, next) => {
  Note
    .findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err))
})

app.put('/api/notes/:id', (req, res, next) => {
  const note = {
    content: req.body.content,
    important: req.body.important,
  }

  Note
    .findByIdAndUpdate(
      req.params.id,
      note,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    )
    .then(updatedNote => res.json(updatedNote))
    .catch(err => next(err))
})

const errorHandler = (err, req, res, next) => {
  console.log(`errorHandler for '${err.name}': `, err.message)
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}
app.use(errorHandler)

const unknownEndpoint = (req, res) => res.status(404).send({ error: 'unknown endpoint' })
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})