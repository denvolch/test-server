// const http = require('http')
const express = require('express')
const cors = require('cors')

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id)
  const note = notes.find(note => {
    console.log(note.id, typeof note.id, id, typeof id, note.id === id)
    return note.id === id
  })
  if (note) {
    console.log(note)
    res.json(note)
  } else {
    res.statusMessage = "This Note is not created on server";
    res.status(404).end()
  }
})

const generatedId = (arr) => {
  if (arr) {
    const maxId = arr.length > 0
      ? Math.max(...arr.map(n => Number(n.id)))
      : 0
    return maxId + 1
  }
}

app.post('/api/notes/', (req, res) => {
  const body = req.body

  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    important: Boolean(body.important) || false,
    id: generatedId(notes)
  }

  console.log(note)
  notes = notes.concat(note)
  res.json(note)
})

app.delete('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id)
  notes = notes.filter(note => note.id !== id)

  res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
// app.listen(PORT)

// console.log(`Server running on port ${PORT}`)