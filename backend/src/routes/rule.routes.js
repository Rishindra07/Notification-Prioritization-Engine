const express = require("express");
const router = express.Router();
const ruleController = require("../controllers/rule.controller.js");

/**
 * Create a new rule
 * POST /api/rules
 */

// Create a new rule
router.post("/", ruleController.createRule);

// Get all rules
router.get("/", ruleController.getRules);

// Update a rule
router.put("/:id", ruleController.updateRule);

// Delete a rule
router.delete("/:id", ruleController.deleteRule);

module.exports = router;