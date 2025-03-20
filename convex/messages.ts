import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import * as Messages from "./model/messages";

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) =>
    Messages.addMessageToConversationFromMe(ctx, args),
});

export const list = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => Messages.listMessages(ctx, args),
});
