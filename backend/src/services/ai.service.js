const NotificationEvent = require("../models/NotificationEvent");
const AuditLog = require("../models/AuditLog");
const { publish } = require("./realtime.service");
const { calculateScore, scoreToDecision } = require("./scoring.service");

const circuitState = {
  status: "CLOSED",
  failureCount: 0,
  openedAt: null,
  lastError: null
};

function getConfig() {
  return {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    siteUrl: process.env.OPENROUTER_SITE_URL || "",
    appName: process.env.OPENROUTER_APP_NAME || "notification-prioritization-engine",
     timeoutMs: Number(process.env.AI_TIMEOUT_MS || 10000),
    maxRetries: Number(process.env.AI_MAX_RETRIES || 3),
    circuitFailureThreshold: Number(process.env.AI_CIRCUIT_FAILURE_THRESHOLD || 5),
    circuitResetMs: Number(process.env.AI_CIRCUIT_RESET_MS || 120000)
  };
}

function getAIHealth() {
  const config = getConfig();
  if (!config.apiKey) {
    return {
      status: "DEGRADED",
      reason: "OPENROUTER_API_KEY missing",
      circuit: circuitState
    };
  }

  if (circuitState.status === "OPEN") {
    const elapsed = Date.now() - new Date(circuitState.openedAt).getTime();
    if (elapsed >= config.circuitResetMs) {
      circuitState.status = "HALF_OPEN";
    }
  }

  return {
    status: circuitState.status === "CLOSED" ? "UP" : "DEGRADED",
    circuit: circuitState
  };
}

function openCircuit(error) {
  circuitState.status = "OPEN";
  circuitState.openedAt = new Date().toISOString();
  circuitState.lastError = error?.message || String(error);
}

function markSuccess() {
  circuitState.status = "CLOSED";
  circuitState.failureCount = 0;
  circuitState.openedAt = null;
  circuitState.lastError = null;
}

function markFailure(err) {
  circuitState.failureCount += 1;
  circuitState.lastError = err?.message || String(err);
  const config = getConfig();
  if (circuitState.failureCount >= config.circuitFailureThreshold) {
    openCircuit(err);
  }
}

function buildPrompt(event) {
  return `Classify this notification as NOW, LATER, or NEVER.
Return strict JSON with keys: decision, confidence, reason.
Event:
${JSON.stringify({
  user_id: event.user_id,
  event_type: event.event_type,
  title: event.title || "",
  message: event.message,
  source: event.source,
  priority_hint: event.priority_hint,
  channel: event.channel,
  metadata: event.metadata || {}
})}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callLLM(event) {
  const config = getConfig();
  if (!config.apiKey) {
    throw new Error("OPENROUTER_API_KEY missing");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const headers = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    };

    if (config.siteUrl) {
      headers["HTTP-Referer"] = config.siteUrl;
    }
    if (config.appName) {
      headers["X-Title"] = config.appName;
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        messages: [
          { role: "system", content: "You are a notification triage assistant." },
          { role: "user", content: buildPrompt(event) }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent || {});
    if (!content) {
      throw new Error("OpenRouter returned empty content");
    }

    const normalized = content.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(normalized);
    return {
      decision: ["NOW", "LATER", "NEVER"].includes(parsed.decision) ? parsed.decision : "LATER",
      confidence: Number(parsed.confidence || 0.5),
      reason: String(parsed.reason || "AI classification"),
      model: data?.model || config.model,
      raw: data
    };
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackAnalysis(event, reason) {
  const score = calculateScore(event);
  return {
    decision: scoreToDecision(score),
    confidence: 0.3,
    reason: `Fallback classification: ${reason}`,
    model: "fallback-score",
    usedFallback: true,
    raw: { score }
  };
}

async function analyzeEvent(event) {
  const config = getConfig();
  const health = getAIHealth();

  if (health.circuit.status === "OPEN") {
    return fallbackAnalysis(event, "AI circuit open");
  }

  let lastError;
  for (let attempt = 0; attempt < config.maxRetries; attempt += 1) {
    try {
      const aiResult = await callLLM(event);
      markSuccess();
      return { ...aiResult, usedFallback: false };
    } catch (err) {
      lastError = err;
      markFailure(err);
      const backoff = Math.min(1000 * (attempt + 1) * (attempt + 1), 5000);
      await sleep(backoff);
    }
  }

  return fallbackAnalysis(event, `AI retries exhausted: ${lastError?.message || "unknown error"}`);
}

async function analyzeAndApply(eventDoc) {
  const event = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
  const result = await analyzeEvent(event);

  const update = {
    ai_status: result.usedFallback ? "FALLBACK" : "DONE",
    ai_analysis: {
      model: result.model,
      confidence: result.confidence,
      reason: result.reason,
      used_fallback: !!result.usedFallback,
      raw: result.raw
    }
  };

  const canOverride = ["SCORING", "AI", "FALLBACK"].includes(event.decision_source);
  if (canOverride && ["NOW", "LATER", "NEVER"].includes(result.decision)) {
    update.status = result.decision;
    update.decision_reason = result.reason;
    update.decision_source = result.usedFallback ? "FALLBACK" : "AI";
  }

  await NotificationEvent.findByIdAndUpdate(event._id, update, { new: true });

  await AuditLog.create({
    event_id: event._id.toString(),
    user_id: event.user_id,
    event_type: event.event_type,
    decision: update.status || event.status,
    reason: result.reason,
    decision_source: result.usedFallback ? "FALLBACK" : "AI",
    ai_model: result.model,
    ai_confidence: result.confidence,
    ai_fallback_used: !!result.usedFallback
  });

  publish("event.updated", {
    event_id: event._id.toString(),
    status: update.status || event.status,
    decision_source: update.decision_source || event.decision_source
  });
}

module.exports = {
  analyzeEvent,
  analyzeAndApply,
  getAIHealth
};
