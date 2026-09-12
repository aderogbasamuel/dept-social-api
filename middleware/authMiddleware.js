const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(500).json({
      err: "Server error, could not validate token",
    });
  }
};

module.exports = protect;
