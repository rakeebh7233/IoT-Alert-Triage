// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddleware } from "./middleware/auth.middleware.js";
import alertRoutes from "./routes/alerts.routes.js";
import deviceRoutes from "./routes/devices.routes.js";
import userRoutes from "./routes/users.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/alerts", authMiddleware, alertRoutes);
app.use("/devices", authMiddleware, deviceRoutes);
app.use("/users", authMiddleware, userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});