const User = require("../model/user");

exports.findUser = async(req, res, next) => {
    // Find user

    try {
        const user = await User.findOne({_id: req.userId}, {password: 0});
        res.status(200).json({ message: "User  found", user: user })

    }catch(err){
        res.status(400).json({ message: "User not found" })
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const user = await User.find({},  {password: 0})
        console.log(user)
        res.status(200).json({ message: "Users  found", user: user })

    }catch(err){
        res.status(400).json({ message: "User not found" })
    } 
}