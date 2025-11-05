import {
  hashContract,
  persistContract,
  queueDeployment,
} from "../services/contracts.service.js";

export const createContract = async (req, res, next) => {
  try {
    const {
      template,
      sender,
      receiver,
      amount,
      trigger,
      cooldown,
      guardian,
      summary,
    } = req.body;
    const contract = {
      template,
      sender,
      receiver,
      amount,
      trigger,
      cooldown,
      guardian,
      summary,
    };
    const hash = await hashContract(contract);
    const doc = await persistContract({ ...contract, hash, status: "draft" });
    res.status(201).json({ id: doc.id, hash, status: doc.status });
  } catch (e) {
    next(e);
  }
};

export const deployContract = async (req, res, next) => {
  try {
    const { contractHash } = req.body;
    const result = await queueDeployment(contractHash, req.user);
    res.status(202).json({
      ok: true,
      signature: result.signature,
      queuedAt: result.queuedAt,
    });
  } catch (e) {
    next(e);
  }
};
