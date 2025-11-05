// server/src/validators/contracts.schemas.js
import { z } from "zod";

const createSchema = z.object({
  template: z.enum(["escrow", "scheduled", "reward"]),
  sender: z.string().min(1),
  receiver: z.string().min(1),
  amount: z.number().nonnegative(),
  trigger: z.string().min(1),
  cooldown: z.boolean().default(false),
  guardian: z.boolean().default(false),
  summary: z.string().min(1),
});

const deploySchema = z.object({
  contractHash: z.string().length(64), // sha-256 hex
});

export { createSchema, deploySchema };
