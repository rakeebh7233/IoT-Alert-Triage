import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const token = authHeader.replace("Bearer ", "");

  const user = await prisma.user.findUnique({
    where: { bearerToken: token },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid bearer token" });
  }

  req.user = user;
  next();
}