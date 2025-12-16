const jwt = require("jsonwebtoken");

// Middleware to authenticate the user using JWT

const authenticateJWT = (req, res, next) => {
  try {

    const token = req.header("Authorization")?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};


const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !Array.isArray(req.user.roles)) {
        return res.status(403).json({
          message: "Authorization error",
          error: "Invalid user or roles",
        });
      }

      const userRoles = req.user.roles
        .filter(r => typeof r === "string")
        .map(r => r.toUpperCase());

      const requiredRoles = allowedRoles
        .filter(r => typeof r === "string")
        .map(r => r.toUpperCase());
      // console.log("user roles:", userRoles);
      
      if (requiredRoles.length === 0) {
        return res.status(403).json({
          message: "Authorization error",
          error: "No roles specified for route",
        });
      }

      const hasRole = requiredRoles.some(role =>
        userRoles.includes(role)
      );

      if (!hasRole) {
        return res.status(403).json({
          message: "Access denied: insufficient permissions",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error.message);
      res.status(403).json({
        message: "Authorization error",
        error: error.message,
      });
    }
  };
};


module.exports = { authenticateJWT, authorizeRoles };