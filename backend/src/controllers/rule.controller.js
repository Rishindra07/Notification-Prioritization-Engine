const Rule = require("../models/Rule");

exports.createRule = async (req, res) => {
  try {
    const rule = await Rule.create(req.body);
    res.json(rule);
  } catch (error) {
    console.error('Error in createRule:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};