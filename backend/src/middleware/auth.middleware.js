const jwt = require("jsonwebtoken");

function authMiddleware(allowedRoles = ["admin", "operator"]) {
  return (req, res, next) => {
    const auth = req.headers.authorization || "";
    const tokenFromHeader = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const token = tokenFromHeader || req.query.token || "";
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      if (!allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

module.exports = { authMiddleware };
