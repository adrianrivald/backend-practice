import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import apiRoutes from "./routes/index.js";
import authRouter from "./routes/auth.js";
import bannersRouter from "./routes/banners.js";
import tripsRouter from "./routes/trips.js";
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

// UnAuthenticated Routes
app.use("/api/auth", authRouter);
app.use("/api/banners", bannersRouter);

//Authenticated Routes
app.use("/api/trips", authenticateToken, tripsRouter);

const port = process.env.PORT || 3010;
app.listen(port, () => console.log(`Listening ${port}`));
