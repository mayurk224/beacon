import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  GOOGLE_USER: process.env.GOOGLE_USER,
  GOOGLE_APP_PASS: process.env.GOOGLE_APP_PASS,
  CLIENT_URL: process.env.CLIENT_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};

export default config;
