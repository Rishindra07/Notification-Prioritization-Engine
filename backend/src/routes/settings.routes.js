const express = require("express");
const { getFatigue, updateFatigue } = require("../controllers/settings.controller");

const router = express.Router();

router.get("/fatigue", getFatigue);
router.put("/fatigue", updateFatigue);

module.exports = router;
