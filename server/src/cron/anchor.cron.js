import cron from "node-cron";
import { anchorBlocks } from "../services/anchor.service.js";

/**
 * Runs every hour at minute 0
 * Example: 00:00, 01:00, 02:00, ...
 */
export function startAnchorCron() {
  console.log("⏱️ Anchor cron job initialized (runs every hour)");

  cron.schedule("0 * * * *", async () => {
    console.log("🕐 Running hourly anchor job...");
    try {
      const result = await anchorBlocks();
      // console.log("Anchor Job Result:", result);
    } catch (err) {
      console.error("Anchor Cron Error:", err);
    }
  });
}
