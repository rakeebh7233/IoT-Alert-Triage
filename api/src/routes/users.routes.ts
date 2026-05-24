import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    where: {
      company: req.user!.company,
    },
    select: {
      id: true,
      name: true,
      role: true,
      company: true,
    },
  });
  res.json(users);
});

export default router;