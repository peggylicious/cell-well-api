const express = require("express");
// const mongoose = require("mongoose");
// const User = require("../models/user");
const { register, login, resetPassword, verifyOtp, updatePassword, deleteUser, sendOtp, updateRole } = require("./auth");
// const bcrypt = require("bcrypt");
// var jwt = require("jsonwebtoken");
const adminGuard = require('../middleware/admin-auth')
const router = express.Router({ mergeParams: true });
router.post("/register", register);
router.post("/login", login);
router.post("/resetpassword", resetPassword);
router.post("/verifyOtp", verifyOtp);
router.post("/updatePassword", updatePassword);
router.post("/sendOtp", sendOtp);




router.put("/updateRole", updateRole);
router.delete("/delete-user", adminGuard, deleteUser);

module.exports = router