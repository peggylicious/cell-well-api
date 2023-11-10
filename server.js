const express = require("express");
const mongoose = require('mongoose');
const app = express()
const PORT = 5000;
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(`${process.env.MONGODB_URI}`, {
    // useMongoClient: true
    // useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

app.use(express.json())
app.use("/api/auth", require("./auth/route"))
const server = app.listen(PORT, () => console.log(`Server Connected to port ${PORT}`));
// Handling Error
process.on("unhandledRejection", err => {
    console.log(`An error occurred: ${err.message}`)
    server.close(() => process.exit(1))
  })

