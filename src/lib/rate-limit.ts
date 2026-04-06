import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { hasUpstashRateLimitEnv } from "@/lib/env";

let ratelimit: Ratelimit | null = null;

export function getRateLimit() {
  if (!hasUpstashRateLimitEnv()) {
    return null;
  }

  if (ratelimit) {
    return ratelimit;
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "digital-birthday-reminder:api",
  });

  return ratelimit;
}
