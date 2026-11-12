
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

      
      const tokenHistory = tokens.get(token) || [];
      
      
      const requestsWithinWindow = tokenHistory.filter((timestamp) => {
        return timestamp > windowStart;
      });

      
      if (requestsWithinWindow.length >= limit) {
        return false;
      }

      
      requestsWithinWindow.push(now);
      tokens.set(token, requestsWithinWindow);

      return true;
    },
  };
}