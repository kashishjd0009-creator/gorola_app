import { Redis } from "ioredis";

let redisSingleton: Redis | null = null;

export function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (!redisSingleton) {
    redisSingleton = new Redis(redisUrl, {
      lazyConnect: true
    });
  }

  return redisSingleton;
}

export async function disconnectRedis(): Promise<void> {
  if (redisSingleton) {
    await redisSingleton.quit();
    redisSingleton = null;
  }
}
