const Mongoose = require("mongoose");

const doctorSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    first_name: String,
    last_name: String,
    specialization: String,
    contact_number: String,
    address: String,
  });

  const Doctor = Mongoose.model("Doctor", doctorSchema)
  module.exports = Doctor