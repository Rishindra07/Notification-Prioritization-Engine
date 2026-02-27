const express = require("express");
const router = express.Router();
const ruleController = require("../controllers/rule.controller.js");

/**
 * Create a new rule
 * POST /api/rules
 */
router.post("/", ruleController.createRule);

module.exports = router;