// user.js
const Mongoose = require("mongoose")
const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    // required: true,
    required: false,
    
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  }
})

const User = Mongoose.model("user", UserSchema)
module.exports = User