const jwt = require("jsonwebtoken");
function catchError() {
  if (req.header("authorization") === undefined) {
    const error = new Error("Not logged in");
    error.statusCode = 401;
    throw error;
  }
}
module.exports = (req, res, next) => {
  let authorizationHeader = req.header("authorization");
    console.log(authorizationHeader);
  if (req.header("authorization") === undefined) {
    const error = new Error("No header provided");
    error.statusCode = 401;
    error.status = 401;
    error.message = "Undefined header";
    // res.status(401).json({error})
    // next(error);
    // return res.status(401).json({ message: 'Not authorized' })

    throw error;
  }
  let token = authorizationHeader.split(" ")[1];
  //   console.log(token)
  //   console.log(jwt.verify(token, "sh"))
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
  } catch (error) {
    // console.log(decoded);

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
  if(decoded.role !== 'admin'){
    return res.status(401).json({ message: "Only admin is authorized" })
  }
  req.userId = decoded.tid
  next();
};