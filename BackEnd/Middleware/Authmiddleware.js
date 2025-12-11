const jwt = require("jsonwebtoken");
const User = require("../Models/User");

// Middleware to authenticate the user using JWT

const authenticateJWT = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }
    
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("User roles form auth middleware:", roles); 
    try{
    if (!req.user ) {
      return res.status(403).json({ message: "Authorization error", error: "User not found" });
      } else if (!req.user.roles) {
      return res.status(403).json({ message: "Authorization error", error: "Roles not found" });
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    next();
       }catch(error){
    console.error("Authorization error:", error.message);
    res.status(403).json({ message: "Authorization error", error: error.message });
    };
  };
};

module.exports = { authenticateJWT, authorizeRoles };