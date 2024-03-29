const express = require("express");
const mongoose = require('mongoose');
const app = express()
const PORT = 5000;
const cors = require('cors')
const dotenv = require('dotenv');
const basicAuth = require("./middleware/basic-auth");
const adminAuth = require("./middleware/admin-auth");
dotenv.config();

mongoose.connect(`${process.env.MONGODB_URI}`, {
    // useMongoClient: true
    // useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

app.use(cors())

app.use(express.json())

app.use("/api/auth", require("./auth/route"))
app.use("/api/users", adminAuth, require("./core/route"))



const server = app.listen(PORT, () => console.log(`Server Connected to port ${PORT}`));
// Handling Error
process.on("unhandledRejection", err => {
    console.log(`An error occurred: ${err.message}`)
    server.close(() => process.exit(1))
  })
// error handler middleware
app.use((error, req, res, next) => {
    console.log(error)
      res.status(error.status || 500).json({
        // error: {
          status: error.status || 500,
          message: error.message || 'Internal Server Error',
        // },
      });
    });
