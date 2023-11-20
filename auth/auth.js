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
const otpGenerator = require('otp-generator');


const sendMail = async (otp) => {
    try {
      const mailOptions = {
            from: process.env.USER_EMAIL,
            to: 'p.asq@live.com',
            subject: "Test",
            html: `<p>Your otp from cell-well <b>${otp}</b></p>`
        }
 
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(mailOptions);
    } catch (err) {
      console.log("ERROR: ", err)
    }
};

const sendOtpVerification = async ({_id}, res) => {

    console.log(_id)
    try {
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        const hashedOtp  = await bcrypt.hash(otp, 10);
        const newUserToken = await new UserVerification({
            userId: _id,
            uniqueString: hashedOtp,
            createdAt: new Date(),
            expiresAt: new Date() + 3600000
        })
        await newUserToken.save() // Send mail to DB
        await sendMail(otp) // Send mail to user
        res.json({
            status: 'PENDING',
            message: 'Otp verification sent',
            data: {
                userId: _id,
            }
        })
    }catch(err){
        console.log(err)
        res.json({err})
    }
}
 
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

    try {
        const user = await User.findOne({ email })
        if (!user) {
            // Generate OTP
            // Send OTP to email
            sendMail();

          res.status(400).json({
            message: "Password reset not successful",
            error: "User not found",
          })
        } else {
            sendOtpVerification(user, res)
            // console.log(user)
            // const newUserToken = new UserVerification({
            //     userId: user._id,
            //     uniqueString: 'xxx',
            //     createdAt: new Date(),
            //     expiresAt: ''
            // })
            // // UserVerification.create({uniqueString: 'xxx'})
            // newUserToken.save().then(x => {
            //     res.status(200).json({
            //                     message: "Password reset successful",
            //                 })
            // }).catch((err) => {
            //     res.status(500).json(err);
            //   });
            // sendMail().then(res => {
            //     alert('A token has been sent to your account')
            // })
          // comparing given password with hashed password
        //   bcrypt.compare(password, user.password).then(function (result) {
        //     if(result) {
        //         const maxAge = 6*60*60;
        //         const token = jwt.sign({id: user._id, username, role: user.role}, jwtSecret, {expiresIn: maxAge})
        //         res.status(200).json({
        //             message: "Login successful",
        //             user,
        //             access_token: token
        //         })
        //     } else {
        //         res.status(400).json({ message: "Login not succesful" })
        //     }
        //     // result
        //     //   ? res.status(200).json({
        //     //       message: "Login successful",
        //     //       user,
        //     //       access_token: token
        //     //     })
        //     //   : res.status(400).json({ message: "Login not succesful" })
        //   })
            // sendMail('aashish@mozej.com', 'Thank you!', 'Thank you so much for sticking with me');
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