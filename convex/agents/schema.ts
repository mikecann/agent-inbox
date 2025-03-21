import { v } from "convex/values";

const common = {
  name: v.string(),
  description: v.string(),
  personality: v.string(),
  avatarUrl: v.string(),
  tools: v.array(v.string()),
  lastActiveTime: v.number(),
};

export const agentsSchemaValidator = v.union(
  v.object({
    ...common,
    kind: v.literal("user_agent"),
    createdBy: v.id("users"),
  }),
  v.object({
    ...common,
    kind: v.literal("system_agent"),
  }),
);
