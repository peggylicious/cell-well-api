const express = require("express");
// const mongoose = require("mongoose");
// const User = require("../models/user");
const { findUser, getAllUsers } = require("./user");
// const bcrypt = require("bcrypt");
// var jwt = require("jsonwebtoken");
const adminGuard = require('../middleware/admin-auth')
const router = express.Router({ mergeParams: true });
router.get("/find", findUser);
router.get("/getAllUsers", getAllUsers);



module.exports = router