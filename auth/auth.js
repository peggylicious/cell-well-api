const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
require("dotenv").config()
const UserVerification = require('../model/userVerification')
const nodemailer = require('nodemailer')
const {v4: uuidv4} = require('uuid');
// const { GoogleApis } = require("googleapis");
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// const sendMail = (to, subject, message) =>{
//     const transporter = nodemailer.createTransport({
//         // host: "smtp-mail.outlook.com",
//         // port: 587,
//         // secure: false, // STARTTLS

//         service: 'gmail',
//         // host: "smtp-mail.outlook.com",
//         // port: 587,
//         // tls: {
//         //     ciphers: "SSLv3",
//         //     rejectUnauthorized: false,
//         // },
//         auth : {
//             user : process.env.EMAIL_FROM,
//             pass : process.env.EMAIL_PASSWORD
//         }
//     })

//     const options = {
//         from : process.env.EMAIL_FROM, 
//         to, 
//         subject, 
//         text: message,
//     }

//     transporter.sendMail(options, (error, info) =>{
//         if(error) console.log(error)
//         else console.log(info)
//     })

// }
const sendMail = async () => {
    try {
      const mailOptions = {
        from: process.env.USER_EMAIL,
        to: 'p.asq@live.com',
        subject: "Test",
        text: "Hi, this is a test email",
      }
 
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(mailOptions);
    } catch (err) {
      console.log("ERROR: ", err)
    }
  };
 
const createTransporter = async () => {
    try {
      const oauth2Client = new OAuth2(
          process.env.CLIENT_ID,
          process.env.CLIENT_SECRET,
          "http://localhost:5000"
        );
 
        oauth2Client.setCredentials({
          refresh_token: process.env.REFRESH_TOKEN,
        });
 
        const accessToken = await new Promise((resolve, reject) => {
          oauth2Client.getAccessToken((err, token) => {
            if (err) {
              console.log("*ERR: ", err)
              reject();
            }
            resolve(token); 
          });
        });
 
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.USER_EMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
          },
        });
        return transporter;
    } catch (err) {
      return err
    }
  };
  sendMail()

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


exports.resetPassword = async (req, res, next) => {
    const { email } = req.body
    // Check if username and password is provided
    // if (!username || !password) {
    //     return res.status(400).json({
    //         message: "Username or Password not present",
    //     })
    // }

    // try {
    //     const user = await User.findOne({ email })
    //     if (!user) {
    //       res.status(400).json({
    //         message: "Password reset not successful",
    //         error: "User not found",
    //       })
    //     } else {
    //       // comparing given password with hashed password
    //     //   bcrypt.compare(password, user.password).then(function (result) {
    //     //     if(result) {
    //     //         const maxAge = 6*60*60;
    //     //         const token = jwt.sign({id: user._id, username, role: user.role}, jwtSecret, {expiresIn: maxAge})
    //     //         res.status(200).json({
    //     //             message: "Login successful",
    //     //             user,
    //     //             access_token: token
    //     //         })
    //     //     } else {
    //     //         res.status(400).json({ message: "Login not succesful" })
    //     //     }
    //     //     // result
    //     //     //   ? res.status(200).json({
    //     //     //       message: "Login successful",
    //     //     //       user,
    //     //     //       access_token: token
    //     //     //     })
    //     //     //   : res.status(400).json({ message: "Login not succesful" })
    //     //   })
    //         sendMail('aashish@mozej.com', 'Thank you!', 'Thank you so much for sticking with me');
    //     }
    //   } catch (error) {
    //     res.status(400).json({
    //       message: "An error occurred",
    //       error: error.message,
    //     })
    //   }
    sendMail('aashish@mozej.com', 'Thank you!', 'Thank you so much for sticking with me');

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