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


// Send Mail function in use
const sendMail = async (otp, email) => {
    try {
      const mailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: "Test",
            html: `<p>Your otp from cell-well <b>${otp}</b></p>`
        }
 
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(mailOptions);
    } catch (err) {
      console.log("ERROR: ", err)
    }
};

const sendOtpVerification = async ({_id, email}, res) => {

    console.log(_id, email)
    try {
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        const hashedOtp  = await bcrypt.hash(otp, 10);
        const date = new Date()
        const newUserToken = await new UserVerification({
            userId: _id,
            uniqueString: hashedOtp,
            createdAt: new Date(),
            expiresAt: date.setDate(date.getDate()+1)
        })
        await newUserToken.save() // Save token to db
        await sendMail(otp, email) // Send mail to user
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
    const { username, email, password } = req.body
    // if (password.length < 6) {
    //     return res.status(400).json({ message: "Password less than 6 characters" })
    // }
    try{
        console.log('trying...')
        const user = await User.findOne({ email })
        if (user) {
          res.status(400).json({
            message: "User already exists",
            error: "User already exists",
          })
        } else{
            bcrypt.hash(password, 10).then(async (hash) => {
                await User.create({
                    username,
                    email,
                    password: hash,
                    verified: false
                })
                .then(result => {
                    // Send verification Email
                    console.log('Result', result)
                    const userDetails = {_id: result._id, email}
                    sendOtpVerification(userDetails, res)
                })
            })
        }
    }catch(err){
        res.status(400).json({
            message: "User not successful created",
            error: err.message,
          })
    }
    
}


// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body
    // Check if username and password is provided
    if (!email || !password) {
        return res.status(400).json({
            message: "Username or Password not present",
        })
    }

    try {
        const user = await User.findOne({ email })
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
                const token = jwt.sign({_id: user._id, email, role: user.role}, jwtSecret, {expiresIn: maxAge})
                const loggedInUser = {_id: user._id, email, role: user.role};
                res.status(200).json({
                    message: "Login successful",
                    loggedInUser,
                    access_token: token,
                    verified: user.verified
                })
            } else {
                res.status(400).json({ message: "Login not succesful" })
            }
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
        console.log('User ', user)
        if (!user) {
            
            // sendMail();

          res.status(400).json({
            message: "User does not exist",
            error: "User not found",
          })
        } else {
            // Generate OTP
            // Send OTP to email
            sendOtpVerification(user, res)
        }
      } catch (error) {
        res.status(400).json({
          message: "An error occurred",
          error: error.message,
        })
      }

}
exports.sendOtp = async (req, res, next) => {
   const email = req.body.email
    try{
        console.log('trying...')
        const user = await User.findOne({ email })
        console.log(user)
        if (user) {
        //   res.status(400).json({
        //     message: "User already exists",
        //     error: "User lready exists",
        //   })
        console.log('If')
        const userDetails = {_id: user._id, email}
        sendOtpVerification(userDetails, res)

        }else{
            throw new Error('User does not exist')

        }
    }catch(err){
        res.status(400).json({
            // message: "User not successful created",
            message: err.message,
            error: err.message,
          })
    }
    // sendOtpVerification(req.body.email, res)
}
exports.verifyOtp = async (req, res, next) => {
    const { otp, userId, verified } = req.body;
    
    try{
        if(!otp){
            res.status(400).json({
                message: "Empty Otp",
                error: "Empty Otp",
              })   
        }else {
            // Get Otp from DB
           const userOtpVerificationRecords = await UserVerification.findOne({userId})
           console.log(!userOtpVerificationRecords)

           if(!userOtpVerificationRecords){ 
                throw new Error('Otp not found. Please signup or login.')  
           }
           
           if(userOtpVerificationRecords?.expiresAt < Date.now()){
                await UserVerification.deleteMany({userId})
                throw new Error('Otp has expired')
           }
            // Decode Otp
            const verifiedOtp = await bcrypt.compare(otp, userOtpVerificationRecords.uniqueString);
            if(!verifiedOtp){
                throw new Error('You entered an incorrecct otp')
            }else{
                await UserVerification.deleteMany({userId})
                if(!verified){
                    const user = await User.findOne({ _id: userId });
                    await User.updateOne({_id: userId}, {verified: true}) ;
                    console.log(user)
                    const maxAge = 6*60*60;
                    const token = jwt.sign({id: user._id, username: user.username, email: user.email, role: user.role}, jwtSecret, {expiresIn: maxAge})
                    res.status(200).json({
                        message: "User successfully created",
                        user,
                        access_token: token
                    })  
                }
                if(verified){
                    res.status(200).json({
                        message: "Email has been verified successfully.",
                    })  
                }
                 
            }
        }
    }catch(err){
        throw Error(err)
        // res.status(400).json({
        //     // message: "User not successful created",
        //     message: err.message,
        //     error: err.message,
        //   })
    }
}

exports.updatePassword = async (req, res, next) => {
    // User.updateOne({_id: userId}, {})
    const { otp, userId, password, confirmPassword } = req.body;
    console.log(otp)
    try{
        if(!password || !confirmPassword){
            // res.status(400).json({
            //     message: "Password field is empty",
            //     error: "Password field is empty",
            //   })  
        throw new Error('Password field is empty')

        }
        if(password !== confirmPassword){
            // res.status(400).json({
            //     message: "Password field mismatch",
            //     error: "Password field mismatch",
            //   })  
        throw new Error('Password field mismatch')
        }
        if(!otp){
            res.status(400).json({
                message: "Empty Otp",
                error: "Empty Otp",
              })   
        }else {
            // Get user otp record from DB
           const userOtpVerificationRecords = await UserVerification.findOne({userId})
           console.log('UV',userOtpVerificationRecords)

           if(!userOtpVerificationRecords){ // Checks if otp record is found
                // res.status(400).json({
                //     message: "Otp not found. Please signup or login.",
                //     error: ""Otp not found. Please signup or login.",
                // }) ]
                throw new Error('"Otp not found. Please signup or login.')
           }
           console.log(otp)
            // Decode Otp
            const verifiedOtp = await bcrypt.compare(otp, userOtpVerificationRecords.uniqueString);
            console.log('verifiedOtp', verifiedOtp)
            if(!verifiedOtp){
                throw new Error('You entered an incorrecct otp')
            }else{
                // Update password
                if(userOtpVerificationRecords.expiresAt < Date.now()){ // Checks if otp is expired
                    // await UserVerification.deleteMany({userId})
                    throw new Error('Otp has expired')
               }
               const hashedPassword = await bcrypt.hash(password, 10)
               console.log(hashedPassword)
                await User.updateOne(
                    { _id: userId },
                    { $set: { password: hashedPassword } },
                    { new: true }
                  );
                await UserVerification.deleteMany({userId})
                res.status(200).json({
                    message: "Password has been updated successfully.",
                })   
            }
        }
    }catch(err){
        res.status(400).json({   
                error: err.message,
        }) 
    }
}
//auth.js
exports.updateRole = async (req, res, next) => {
    const { id, role } = req.body;
    console.log(req.body)

    try{
        if (!role || !id) {
            throw new Error('Role or Id not present')
        }

        if(role === 'Admin'){
            const user = await User.findById(id);
            if (user.role !== "Admin") {
                user.role = role;
                await user.save()
                res.status(201).json({ message: "Update successful", user });
            } else {
                throw new Error('User is already an Admin')
            }
        }else{
            throw new Error('Cannot set role')
        }

    }catch(err){
        res.status(400).json({ message: err })
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