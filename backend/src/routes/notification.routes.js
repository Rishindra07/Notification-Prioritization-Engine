const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");

router.post("/evaluate", controller.evaluateNotification);

module.exports = router;