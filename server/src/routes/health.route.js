import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

export default router;
