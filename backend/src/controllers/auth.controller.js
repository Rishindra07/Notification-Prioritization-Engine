const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { user_id: user._id.toString(), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "12h" }
  );
}

exports.register = async (req, res) => {
  try {
    const { email, name, password, role = "operator" } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "email, name, password are required" });
    }

    const existing = await User.findOne({ email, is_deleted: false });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, password_hash, role });

    return res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to register user", details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, is_deleted: false });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to login", details: err.message });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};

exports.seedDemoUsers = async () => {
  const users = [
    {
      email: process.env.DEMO_ADMIN_EMAIL || "admin@demo.com",
      name: "Demo Admin",
      password: process.env.DEMO_ADMIN_PASSWORD || "Admin@123",
      role: "admin"
    },
    {
      email: process.env.DEMO_OPERATOR_EMAIL || "operator@demo.com",
      name: "Demo Operator",
      password: process.env.DEMO_OPERATOR_PASSWORD || "Operator@123",
      role: "operator"
    }
  ];

  for (const candidate of users) {
    const existing = await User.findOne({ email: candidate.email });
    if (existing) {
      continue;
    }
    const password_hash = await bcrypt.hash(candidate.password, 10);
    await User.create({
      email: candidate.email,
      name: candidate.name,
      password_hash,
      role: candidate.role
    });
  }
};
