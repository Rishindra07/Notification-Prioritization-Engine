const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");

router.post("/evaluate", controller.evaluateNotification);
router.get("/audit-logs", controller.getAuditLogs);
router.get("/metrics", controller.getMetrics);
router.get("/later-queue", controller.getLaterQueue);
router.post("/later-queue/retry", controller.retryLaterQueueNow);
router.get("/events", controller.getEvents);
router.get("/stream", controller.stream);

module.exports = router;
