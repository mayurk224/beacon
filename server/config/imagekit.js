import ImageKit from "imagekit";
import dotenv from "dotenv";
import config from "./config.js";

dotenv.config();

export const imagekit = new ImageKit({
  publicKey: config.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: config.IMAGEKIT_URL_ENDPOINT
});