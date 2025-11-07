import { Router } from "express";
import validate from "../middleware/validate.js";
import idempotency from "../middleware/idempotency.js";
import { createSchema, deploySchema } from "../validators/contracts.schemas.js";
import {
  acceptContract,
  createContract,
  deployContract,
  getContracts,
} from "../controllers/contracts.controller.js";

const r = Router();

r.get("/", getContracts);
r.post("/create", validate(createSchema), createContract);
r.post("/deploy", idempotency, validate(deploySchema), deployContract);
r.post("/accept", async (req, res, next) => {
  try {
    await acceptContract(req, res);
  } catch (e) {
    next(e);
  }
});

export default r;
