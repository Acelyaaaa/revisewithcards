// lib/rate-limit.ts
interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  check: (token: string, limit: number) => Promise<boolean>;
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const tokens = new Map<string, number[]>();

  return {
    check: async (token: string, limit: number): Promise<boolean> => {
      const now = Date.now();
      const windowStart = now - options.interval;

      // Get token history
      const tokenHistory = tokens.get(token) || [];
      
      // Filter out old requests
      const requestsWithinWindow = tokenHistory.filter((timestamp) => {
        return timestamp > windowStart;
      });

      // Check if limit exceeded
      if (requestsWithinWindow.length >= limit) {
        return false;
      }

      // Add current request
      requestsWithinWindow.push(now);
      tokens.set(token, requestsWithinWindow);

      return true;
    },
  };
}