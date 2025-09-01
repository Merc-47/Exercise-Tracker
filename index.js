const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))//
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//
let users = []

app.post('/api/users', (req, res) => {
  const username = req.body.username
  if (!username) return res.json({ error: 'UserName required!' })

  const _id = Date.now().toString()
  const newUser = { username, _id, log: [] }
  users.push(newUser)

  res.json({ username, _id })
})

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ username: u.username, _id: u._id })))
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.json({ error: 'User not found!' })

  const exerciseDate = date ? new Date(date) : new Date()
  const exercise = {
    description: description,
    duration: Number(duration),
    date: exerciseDate.toDateString()
  }

  user.log.push(exercise)

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.json({ error: 'User not found!' })

  let log = [...user.log]

  if (from) {
    const fromDate = new Date(from)
    log = log.filter(e => new Date(e.date) >= fromDate)
  }
  if (to) {
    const toDate = new Date(to)
    log = log.filter(e => new Date(e.date) <= toDate)
  }
  if (limit) {
    log = log.slice(0, Number(limit))
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
