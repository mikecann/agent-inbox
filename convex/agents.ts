import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import * as Agents from "./model/agents";

export const create = mutation({
  args: {},
  handler: async (ctx) => Agents.createAgent(ctx),
});

export const listMine = query({
  args: {},
  handler: async (ctx) => Agents.listMine(ctx),
});

export const getMine = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => Agents.getMine(ctx, args),
});

export const findMine = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => Agents.findMine(ctx, args),
});

export const updateMine = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.string(),
    description: v.string(),
    personality: v.string(),
    tools: v.array(v.string()),
  },
  handler: async (ctx, args) => Agents.updateMine(ctx, args),
});

export const removeMine = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => Agents.deleteMine(ctx, args),
});

export const updateStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("processing"),
    ),
  },
  handler: async (ctx, args) => Agents.updateStatus(ctx, args),
});

export const shuffleAvatar = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await Agents.getMine(ctx, args);
    return await ctx.db.patch(args.agentId, {
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}-${Date.now()}`,
    });
  },
});
