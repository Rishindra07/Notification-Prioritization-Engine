const Setting = require("../models/Setting");

const DEFAULT_FATIGUE_SETTINGS = {
  limit_10min: 8,
  limit_24h: 50,
  min_gap_seconds: 20
};

const DEFAULT_QUEUE_SETTINGS = {
  interval_seconds: 30,
  max_retries: 5,
  retry_backoff_seconds: 20
};

async function getOrCreateSetting(key, defaultValue) {
  let setting = await Setting.findOne({ key });
  if (!setting) {
    setting = await Setting.create({ key, value: defaultValue });
  }
  return setting.value;
}

async function getFatigueSettings() {
  return getOrCreateSetting("fatigue", DEFAULT_FATIGUE_SETTINGS);
}

async function updateFatigueSettings(value) {
  const updated = await Setting.findOneAndUpdate(
    { key: "fatigue" },
    { key: "fatigue", value },
    { new: true, upsert: true }
  );
  return updated.value;
}

async function getQueueSettings() {
  return getOrCreateSetting("queue", DEFAULT_QUEUE_SETTINGS);
}

module.exports = {
  DEFAULT_FATIGUE_SETTINGS,
  DEFAULT_QUEUE_SETTINGS,
  getFatigueSettings,
  updateFatigueSettings,
  getQueueSettings
};
