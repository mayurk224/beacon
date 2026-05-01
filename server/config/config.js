import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  GOOGLE_USER: process.env.GOOGLE_USER,
  GOOGLE_APP_PASS: process.env.GOOGLE_APP_PASS,
};

export default config;
