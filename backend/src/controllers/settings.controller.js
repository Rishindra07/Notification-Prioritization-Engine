const { getFatigueSettings, updateFatigueSettings } = require("../services/settings.service");

exports.getFatigue = async (req, res) => {
  const value = await getFatigueSettings();
  return res.json(value);
};

exports.updateFatigue = async (req, res) => {
  const body = req.body || {};
  const sanitized = {
    limit_10min: Number(body.limit_10min || 8),
    limit_24h: Number(body.limit_24h || 50),
    min_gap_seconds: Number(body.min_gap_seconds || 20)
  };
  const value = await updateFatigueSettings(sanitized);
  return res.json(value);
};
