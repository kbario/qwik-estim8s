export const ShardMapKeys = {
  adminDB: "adminDB",
  adminAuth: "adminAuth",
  userId: "userId",
} as const;
export type ShardMapKeys = (typeof ShardMapKeys)[keyof typeof ShardMapKeys];
