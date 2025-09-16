import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL as string, {
   tls: {}, // required for Upstash TLS
  connectTimeout: 10000, // 10s
});

redis.on("connect", () => {
  console.log("🔗 Redis connected");
});

redis.on("error", (err: any) => {
  console.error("❌ Redis error:", err);
});

export default redis;
