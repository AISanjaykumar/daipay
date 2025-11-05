// server/src/services/contracts.service.js
import { createHash } from "crypto";

async function hashContract(obj) {
  const payload = JSON.stringify(obj);
  return createHash("sha256").update(payload).digest("hex");
}

// TODO: replace with your DB model (e.g., Contract collection)
async function persistContract(doc) {
  // placeholder: in real code, insert into Mongo and return the created doc
  return { id: "ctr_" + doc.hash.slice(0, 8), ...doc };
}

// TODO: enqueue deterministic execution via TxQueue / scheduler
async function queueDeployment(contractHash, user) {
  const signature = `sig_${contractHash.slice(0, 12)}_${Date.now()}`;
  return { signature, queuedAt: new Date().toISOString() };
}

export { hashContract, persistContract, queueDeployment };
