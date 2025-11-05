import { Router } from "express";
import validate from "../middleware/validate.js";
import idempotency from "../middleware/idempotency.js";
import { createSchema, deploySchema } from "../validators/contracts.schemas.js";
import {
  createContract,
  deployContract,
  getContracts,
} from "../controllers/contracts.controller.js";

const r = Router();

r.get("/", getContracts);
r.post("/create", validate(createSchema), createContract);
r.post("/deploy", idempotency, validate(deploySchema), deployContract);

export default r;
