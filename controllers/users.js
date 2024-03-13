const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

userRouter.get('/', async (req, res) => {
  const users = await User.find({})

  res.json(users)
})

userRouter.post('/',  async (req, res) => {
  const { username, name, password } = req.body

  const saltRound = 10
  const passwordHash = await bcrypt.hash(password, saltRound)
  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = userRouter