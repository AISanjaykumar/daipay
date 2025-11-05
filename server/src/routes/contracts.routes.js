import { Router } from "express";
import {
  createContract,
  deployContract,
} from "../controllers/contracts.controller.js";
import validate from "../middleware/validate.js";
import idempotency from "../middleware/idempotency.js";
import { createSchema, deploySchema } from "../validators/contracts.schemas.js";

const r = Router();

r.post("/create", validate(createSchema), createContract);
r.post("/deploy", idempotency, validate(deploySchema), deployContract);

export default r;
