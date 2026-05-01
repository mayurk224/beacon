import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./config/db.js";
import config from "./config/config.js";
dotenv.config();

const PORT = config.PORT;

app.listen(PORT, () => {
  try {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
  }
});

