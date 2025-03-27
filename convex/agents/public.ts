import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import * as Agents from "./model";
import { pick } from "convex-helpers";

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
  handler: async (ctx, args) => {
    const agent = await Agents.getMine(ctx, { agentId: args.agentId });
    if (agent.kind != "user_agent")
      throw new Error("Cannot update non user_agent");
    return Agents.updateMine(ctx, args);
  },
});

export const removeMine = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await Agents.getMine(ctx, { agentId: args.agentId });
    if (agent.kind != "user_agent")
      throw new Error("Cannot delete non user_agent");
    return Agents.remove(ctx, args);
  },
});

export const shuffleAvatar = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await Agents.getMine(ctx, args);
    return await ctx.db.patch(args.agentId, {
      avatarUrl: Agents.createAgentAvatarUrl(`${agent.name}-${Date.now()}`),
    });
  },
});

export const getForMention = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");
    return pick(agent, ["name", "_id", "avatarUrl"]);
  },
});
