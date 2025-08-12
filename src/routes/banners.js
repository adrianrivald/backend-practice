import express from "express";
import prisma from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: { position: "asc" },
  });
  res.json(banners);
});

export default router;
