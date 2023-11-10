const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
// Register
exports.register = async (req, res, next) => {
    const { username, password } = req.body
    if (password.length < 6) {
        return res.status(400).json({ message: "Password less than 6 characters" })
    }
    bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
        username,
        password: hash,
      })
        .then((user) =>{
            const maxAge = 6*60*60;
            const token = jwt.sign({id: user._id, username, role: user.role}, jwtSecret, {expiresIn: maxAge})
            res.status(200).json({
                message: "User successfully created",
                user,
                access_token: token
            })
        })
        .catch((error) =>
          res.status(400).json({
            message: "User not successful created",
            error: error.message,
          })
        );
        })
    // try {
    //     await User.create({
    //         username,
    //         password,
    //     }).then(user =>
    //         res.status(200).json({
    //             message: "User successfully created",
    //             user,
    //         })
    //     )
    // } catch (err) {
    //     res.status(401).json({
    //         message: "User not successful created",
    //         error: error.mesage,
    //     })
    // }
}


// Login
exports.login = async (req, res, next) => {
    const { username, password } = req.body
    // Check if username and password is provided
    if (!username || !password) {
        return res.status(400).json({
            message: "Username or Password not present",
        })
    }

    try {
        const user = await User.findOne({ username })
        if (!user) {
          res.status(400).json({
            message: "Login not successful",
            error: "User not found",
          })
        } else {
          // comparing given password with hashed password
          bcrypt.compare(password, user.password).then(function (result) {
            if(result) {
                const maxAge = 6*60*60;
                const token = jwt.sign({id: user._id, username, role: user.role}, jwtSecret, {expiresIn: maxAge})
                res.status(200).json({
                    message: "Login successful",
                    user,
                    access_token: token
                })
            } else {
                res.status(400).json({ message: "Login not succesful" })
            }
            // result
            //   ? res.status(200).json({
            //       message: "Login successful",
            //       user,
            //       access_token: token
            //     })
            //   : res.status(400).json({ message: "Login not succesful" })
          })
        }
      } catch (error) {
        res.status(400).json({
          message: "An error occurred",
          error: error.message,
        })
      }
}


//auth.js
exports.update = async (req, res, next) => {
    const { role, id } = req.body;
    // First - Verifying if role and id is presnt
    if (role && id) {
        // Second - Verifying if the value of role is admin
        if (role === "admin") {
            // Finds the user with the id
            await User.findById(id)
                .then((user) => {
                    // Third - Verifies the user is not an admin
                    if (user.role !== "admin") {
                        user.role = role;
                        user.save().then((res) => {
                            res.status("201").json({ message: "Update successful", user });
                        }).catch(err => {
                            res.status("400").json({ message: "An error occurred", error: err.message });
                            process.exit(1);
                        })
                    } else {
                        res.status(400).json({ message: "User is already an Admin" });
                    }
                })
                .catch((error) => {
                    res
                        .status(400)
                        .json({ message: "An error occurred", error: error.message });
                });
        }
    } else {
        res.status(400).json({ message: "Role or Id not present" })
    }
}

exports.deleteUser = async (req, res, next) => {
    const { id } = req.body
    await User.findById(id)
        .then(user => user.deleteOne())
        .then(user =>
            res.status(201).json({ message: "User successfully deleted", user })
        )
        .catch(error =>
            res
                .status(400)
                .json({ message: "An error occurred", error: error.message })
        )
}