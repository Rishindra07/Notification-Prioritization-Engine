const Rule = require("../models/Rule");

exports.createRule = async (req, res) => {
  const rule = await Rule.create(req.body);
  res.json(rule);
};