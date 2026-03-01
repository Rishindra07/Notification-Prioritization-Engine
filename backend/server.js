require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { seedDemoUsers } = require("./src/controllers/auth.controller");
const { startLaterQueueProcessor } = require("./src/services/laterQueue.service");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  await seedDemoUsers();
  startLaterQueueProcessor();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to bootstrap server:", err);
  process.exit(1);
});
