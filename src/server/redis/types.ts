export type CacheOptions = {
  expirationInSeconds?: number;
};

export type RateLimitOptions = {
  limit: number;
  windowInSeconds: number;
};

export type SessionData = Record<string, any>;

export type SessionOptions = {
  expirationInSeconds?: number;
};