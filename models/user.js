const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'พนักงาน' },
  phone: { type: String }, // เพิ่มในส่วนนี้
  firstname: { type: String },
  lastname: { type: String },
  line: { type: String },
  linename: { type: String },
})

const User = mongoose.model('User', userSchema)

module.exports = User
