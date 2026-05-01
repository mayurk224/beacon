import express from "express";
import cors from "cors";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to handle URL-encoded data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173", // Your React app URL
    credentials: true, // CRITICAL: Allows cookies to be sent
  }),
);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is awake" });
});

export default app;
