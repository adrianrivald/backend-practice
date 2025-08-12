import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();

// Allow frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Register all routes automatically
app.use(apiRoutes);

// app.use("/api/banners", bannersRouter);
// app.use("/api/trips", tripsRouter);

const port = process.env.PORT || 3010;
app.listen(port, () => console.log(`Listening ${port}`));
