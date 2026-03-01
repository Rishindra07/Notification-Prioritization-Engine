const Rule = require("../models/Rule");

exports.createRule = async (req, res) => {
  try {
    if (!req.body.name || !req.body.decision || !req.body.reason_template) {
      return res.status(400).json({ error: "name, decision, reason_template are required" });
    }
    const rule = await Rule.create(req.body);
    return res.status(201).json(rule);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.getRules = async (req, res) => {
  try {
    const rules = await Rule.find({ is_deleted: false }).sort({ priority: 1, createdAt: 1 });
    return res.json(rules);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await Rule.findOneAndUpdate({ _id: req.params.id, is_deleted: false }, req.body, { new: true });
    if (!rule) return res.status(404).json({ error: "Rule not found" });
    return res.json(rule);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findOneAndUpdate(
      { _id: req.params.id, is_deleted: false },
      { is_deleted: true, is_active: false },
      { new: true }
    );
    if (!rule) return res.status(404).json({ error: "Rule not found" });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
