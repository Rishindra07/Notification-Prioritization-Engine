const express = require("express");
const app = express();

const notification_routes = require("./routes/notification.routes.js");
const rule_routes = require("./routes/rule.routes.js");
app.use(express.json());

app.use("/api/notifications", notification_routes);
app.use("/api/rules",rule_routes );

module.exports = app;