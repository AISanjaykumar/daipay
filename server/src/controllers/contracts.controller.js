// controller/contracts.controller.js
import { h512 } from "../crypto/hash.js";
import Contract from "../db/models/Contract.js";
import { canonical } from "../crypto/canonical.js";
import { appendReceipt } from "../services/ledger.service.js";
import { credit, debit } from "../services/wallet.service.js";
import { queueDeployment } from "../services/contracts.service.js";

export async function getContracts(req, res, next) {
  try {
    const walletId = req.query.wallet_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!walletId) {
      return res
        .status(400)
        .json({ success: false, message: "wallet_id required" });
    }

    const filter = {
      $or: [{ sender: walletId }, { receiver: walletId }],
    };

    const total = await Contract.countDocuments(filter);
    const contracts = await Contract.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: contracts.length,
      items: contracts,
    });
  } catch (e) {
    next(e);
  }
}

export async function createContract(req, res, next) {
  try {
    const contract = await Contract.create({ ...req.body });
    res.json(contract);
  } catch (e) {
    next(e);
  }
}

export async function deployContract(req, res, next) {
  try {
    const { contractHash } = req.body;
    const ctr = await Contract.findOne({ contractHash });
    if (!ctr) return res.status(404).json({ message: "Contract not found" });

    await debit(ctr.sender, ctr.amount, `Debit fee for contract`);
    await credit(ctr.receiver, ctr.amount, `Credit for contract`);

    const { signature } = await queueDeployment(contractHash);
    ctr.signature = signature;
    ctr.status = "deployed";
    await ctr.save();

    const c = canonical(ctr);

    const digest = h512(c);

    const contract_id = h512(`contract|${digest}|${ctr.contractHash}`);

    await appendReceipt({
      type: "smartcontract_deploy",
      ref_id: contract_id,
      timestamp: new Date(),
    });

    res.json({ signature });
  } catch (e) {
    next(e);
  }
}

export async function acceptContract(req, res, next) {
  try {
    const { wallet_id, contractHash } = req.body;

    if (!wallet_id)
      return res.status(400).json({ message: "wallet_id required" });

    const ctr = await Contract.findOne({ contractHash });
    if (!ctr) return res.status(404).json({ message: "Contract not found" });

    let modified = false;
    if (ctr.sender === wallet_id && !ctr.senderAccepted) {
      ctr.senderAccepted = true;
      modified = true;
    }
    if (ctr.receiver === wallet_id && !ctr.receiverAccepted) {
      ctr.receiverAccepted = true;
      modified = true;
    }

    if (!modified)
      return res.json({ message: "Already accepted or not a party" });

    // If both accepted now, set deploy_time depending on trigger and possibly queue
    if (ctr.senderAccepted && ctr.receiverAccepted) {
      if (ctr.trigger === "24h") {
        ctr.deploy_time = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      } else if (ctr.trigger === "auto") {
        // set 48 hr and queue it
        ctr.deploy_time = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        await ctr.save();
        return res.json({
          message: "Accepted and queued for auto deployment",
          contract: ctr,
        });
      }
    }

    await ctr.save();
    res.json({ message: "Accepted", contract: ctr });
  } catch (e) {
    next(e);
  }
}
