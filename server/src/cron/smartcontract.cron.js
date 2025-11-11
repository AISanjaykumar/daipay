import cron from "node-cron";

import Contract from "../db/models/Contract.js";
import { queueDeployment } from "../services/contracts.service.js";
import { canonical } from "../crypto/canonical.js";
import { h512 } from "../crypto/hash.js";
import { appendReceipt } from "../services/ledger.service.js";


export function startSmartContractCron() {
  console.log("⏱️ Smart Contract cron job initialized (runs every hour)");

  // Run every minute
  cron.schedule("0 * * * *", async () => {
    console.log("⏱️ Running scheduled contract deployment check...");
    const now = new Date().toISOString();

    try {
      // 1️⃣ Find all eligible contracts
      const contracts = await Contract.find({
        status: "pending",
        senderAccepted: true,
        receiverAccepted: true,
        deploy_time: { $exists: true },
      });

      if (!contracts.length) {
        console.log("No pending accepted contracts found.");
        return;
      }
      console.log(`⏱️ Found ${contracts.length} contracts:`);

      // 2️⃣ Filter contracts that are ready to deploy
      const now = new Date();

      const readyContracts = contracts.filter((ctr) => {
        const deployAt = new Date(ctr.deploy_time);

        if (ctr.template === "scheduled" && deployAt)
          return deployAt.getTime() <= now.getTime();

        if (ctr.trigger === "24h")
          return (
            now.getTime() - new Date(ctr.createdAt).getTime() >=
            24 * 60 * 60 * 1000
          );

        if (ctr.trigger === "auto")
          return (
            now.getTime() - new Date(ctr.createdAt).getTime() >=
            48 * 60 * 60 * 1000
          );

        return false;
      });

      if (!readyContracts.length) {
        console.log("No contracts ready for deployment yet.");
        return;
      }

      console.log(
        `🚀 ${readyContracts.length} contracts ready for deployment.`
      );

      // 3️⃣ Deploy all ready contracts in parallel
      await Promise.allSettled(
        readyContracts.map(async (ctr) => {
          try {
            // re-fetch for safety
            const freshCtr = await Contract.findOne({
              contractHash: ctr.contractHash,
            });
            if (!freshCtr)
              return console.warn("Contract not found:", ctr.contractHash);

            // Debit + Credit in parallel
            await Promise.all([
              debit(freshCtr.sender, freshCtr.amount, "Debit fee for contract"),
              credit(freshCtr.receiver, freshCtr.amount, "Credit for contract"),
            ]);

            // Queue deployment
            const { signature } = await queueDeployment(freshCtr.contractHash);
            freshCtr.signature = signature;
            freshCtr.status = "deployed";
            freshCtr.deployedAt = new Date();
            await freshCtr.save();

            const c = canonical(freshCtr);

            const digest = h512(c);

            const contract_id = h512(
              `contract|${digest}|${freshCtr.contractHash}`
            );
            await appendReceipt({
              type: "smartcontract_deploy",
              ref_id: contract_id,
              timestamp: new Date(),
            });

            // console.log(`✅ Deployed contract ${freshCtr.contractHash}`);
          } catch (err) {
            console.error(
              `❌ Failed to deploy ${ctr.contractHash}:`,
              err.message
            );
          }
        })
      );

      console.log("✅ Deployment check completed.\n");
    } catch (err) {
      console.error("❌ Cron error:", err);
    }
  });
}
