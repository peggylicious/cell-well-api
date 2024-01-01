const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let authorizationHeader = req.header("authorization");
    console.log(authorizationHeader);
  if (req.header("authorization") === undefined) {
    const error = new Error("No header provided");
    error.statusCode = 401;
    error.status = 401;
    error.message = "Undefined header";
    throw error;
  }
  let token = authorizationHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
  } catch (error) {
    error.statusCode = 401;
    error.status = 401;
    error.message = "Unauthorized user";
    throw error;
  }
  if (!decoded) {
    const err = new Error(
      "Something went wrong while trying to decode. Please try again"
    );
    err.statusCode = 401;
    err.stack = 401;
    throw err;
  }
  if(decoded.role !== 'Basic'){
    return res.status(401).json({ message: "Only registered user is allowed" })
  }
  req.userId = decoded._id
  // req.email = de
  next();
};