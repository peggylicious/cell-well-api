const mongoose = require("mongoose");
const remoteDB = mongoose.connect(`${process.env.MONGODB_URI}`, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});
module.exports = remoteDB