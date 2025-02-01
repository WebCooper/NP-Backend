const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
  try {
    // Check for Authorization header
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Invalid authorization header" });
    }

    // Extract token from Authorization header
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "You are not authenticated!" });
    }

    // Verify token and decode payload
    const decode = jwt.verify(token, process.env.JWT); // Ensure `JWT_SECRET` is set

    // Attach the user ID from the token to req.userId
    req.userId = decode.id;

    return next(); // Pass control to the next middleware
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    next(err); // Pass other errors to the error-handling middleware
  }
};

module.exports = verifyToken;
