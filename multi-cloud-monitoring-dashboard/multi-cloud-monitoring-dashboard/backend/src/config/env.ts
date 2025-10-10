import dotenv from "dotenv";
dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 4000),
    DEMO_TOKEN: process.env.DEMO_TOKEN || "demo-token",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "*"
};