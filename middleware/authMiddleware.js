const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // lowercase
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ msg: "No token, authorization denied" });

  const token = authHeader.split(" ")[1]; // get token after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ msg: "Admin access required" });
  next();
};

module.exports = { authMiddleware, adminMiddleware };
