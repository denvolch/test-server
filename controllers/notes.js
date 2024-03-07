const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find({})
    res.json(notes)
  } catch(expection) {
    next(expection)
  }
})

notesRouter.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (note) {
      res.status(200).json(note)
    } else {
      res.status(404).end()
    }
  } catch(expection) {
    next(expection)
  }
})

notesRouter.post('/', async (req, res, next) => {
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

  try {
    const savedNote = await note.save()
    res.status(201).json(savedNote)
  } catch(expection) {
    next(expection)
  }
})

notesRouter.delete('/:id', async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch(expection) {
    next(expection)
  }
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