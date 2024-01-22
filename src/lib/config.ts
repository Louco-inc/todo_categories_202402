export const config = {
  apiPrefix: process.env.NEXT_PUBLIC_API_PREFIX ?? "http://",
  apiHost: process.env.NEXT_PUBLIC_VERCEL_URL ?? "localhost:3001",
};
