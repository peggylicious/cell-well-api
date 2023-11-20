// user.js
const Mongoose = require("mongoose");
const { Schema } = Mongoose;
const UserVerificationSchema = new Mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  uniqueString: String,
  createdAt: Date,
  expiresAt: Date
})

const UserVerification = Mongoose.model("userVerification", UserVerificationSchema)
module.exports = UserVerification