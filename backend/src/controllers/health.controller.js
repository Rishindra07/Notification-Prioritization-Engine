const mongoose = require("mongoose");
const { getAIHealth } = require("../services/ai.service");
const { getQueueHealth } = require("../services/laterQueue.service");

exports.getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  const ai = getAIHealth();
  const queue = getQueueHealth();

  const overall = dbState === "UP" && ai.status !== "DOWN" ? "ok" : "degraded";
  return res.json({
    status: overall,
    timestamp: new Date().toISOString(),
    db: { status: dbState },
    ai,
    queue
  });
};
