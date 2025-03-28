import {
  internalMutation,
  internalQuery,
  mutation,
} from "../_generated/server";
import { v } from "convex/values";
import * as Conversations from "./model";

export const isTriageAgentJoined = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await Conversations.isTriageAgentJoined(ctx.db, args);
  },
});

export const joinTriageAgentToConversationIfNotAlreadyJoined = internalMutation(
  {
    args: {
      conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
      return await Conversations.joinTriageAgentToConversationIfNotAlreadyJoined(
        ctx.db,
        args,
      );
    },
  },
);

export const update = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => Conversations.update(ctx, args),
});
