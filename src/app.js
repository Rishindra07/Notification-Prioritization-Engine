const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/rules", require("./routes/rule.routes"));

module.exports = app;