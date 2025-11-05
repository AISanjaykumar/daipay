// controller/contracts.controller.js
import Contract from "../db/models/Contract.js";
import { queueDeployment } from "../services/contracts.service.js";

export async function getContracts(req, res, next) {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json(contracts);
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

    const { signature } = await queueDeployment(contractHash);
    ctr.signature = signature;
    ctr.status = "deployed";
    await ctr.save();

    res.json({ signature });
  } catch (e) {
    next(e);
  }
}
