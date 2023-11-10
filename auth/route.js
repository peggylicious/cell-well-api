const express = require("express");
// const mongoose = require("mongoose");
// const User = require("../models/user");
const { register, login, update, deleteUser } = require("./auth");
// const bcrypt = require("bcrypt");
// var jwt = require("jsonwebtoken");
const adminGuard = require('../middleware/admin-auth')
const router = express.Router({ mergeParams: true });
router.post("/register", register);
router.post("/login", login);
router.put("/update", update);
router.delete("/delete-user", adminGuard, deleteUser);

module.exports = router