import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/daipay";

const connectWithRetry = async (retries = 5, delay = 3000) => {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error(`❌ MongoDB connection failed (${retries} retries left):`, err.message);
    if (retries > 0) {
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      setTimeout(() => connectWithRetry(retries - 1, delay * 2), delay); // exponential backoff
    } else {
      console.error("🚫 Could not connect to MongoDB after multiple attempts. Exiting...");
      process.exit(1);
    }
  }
};

connectWithRetry();

// Start the server only after a successful connection
mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`🚀 DAIPay API running on port ${PORT}`));
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});
