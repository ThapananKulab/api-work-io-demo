const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const auth = require('./middleware/auth')
const cors = require('cors')

const app = express()
const port = 3000
const secret = 'fullstack'

app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://nicekrubma123:kulab12345@atlascluster.rieucoy.mongodb.net'
)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB')
})

app.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      firstname,
      lastname,
      line,
      linename,
    } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'พนักงาน',
      phone,
      firstname,
      lastname,
      line,
      linename,
    })

    await newUser.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/login', async (req, res) => {
  const { name, password } = req.body
  try {
    const user = await User.findOne({ name })
    if (!user) {
      return res.status(400).send('success')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).send('Invalid email or password')
    }
    const payload = {
      id: user._id,
      name: user.name,
      role: user.role,
    }
    await user.save()

    const token = jwt.sign(payload, secret, { expiresIn: '7h' })
    res.status(200).json({ token })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// User logout
app.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()

    res.send('Logged out successfully')
  } catch (error) {
    console.error('Error during logout:', error.message)
    res.status(500).send('Internal server error')
  }
})

app.post('/profile', auth, (req, res) => {
  res.send(req.user)
})

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/profile', auth, (req, res) => {
  res.send(req.user)
})

app.get('/', (req, res) => {
  res.json('test')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
