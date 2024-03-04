const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (req, res, next) => {
  Note
    .find({})
    .then(notes => {
      res.json(notes)
    })
    .catch(err => next(err))
})

notesRouter.get('/:id', (req, res, next) => {
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

notesRouter.post('/', (req, res, next) => {
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

notesRouter.delete('/:id', (req, res, next) => {
  Note
    .findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err))
})

notesRouter.put('/:id', (req, res, next) => {
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

module.exports = notesRouter