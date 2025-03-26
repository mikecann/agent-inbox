import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { v } from "convex/values";
import * as Messages from "./model";
import * as Agents from "../agents/model";
import * as ConversationParticipants from "../conversationParticipants/model";
import { internal } from "../_generated/api";
import { ensureFP } from "../../shared/ensure";

export const sendFromTriageAgent = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.id("conversationMessages"),
  handler: async (ctx, args) => {
    const triageAgent = await Agents.getTriageAgent(ctx.db);
    const triageAgentParticipant =
      await ConversationParticipants.getParticipantByConversationIdAndIdentifier(
        ctx.db,
        {
          conversationId: args.conversationId,
          identifier: {
            kind: "agent",
            agentId: triageAgent._id,
          },
        },
      );
    const messageId = await Messages.addMessageToConversationFromAgent(ctx, {
      conversationId: args.conversationId,
      content: args.content,
      agentId: triageAgent._id,
      author: triageAgentParticipant._id,
    });

    // Schedule a task to process the message
    await ctx.scheduler.runAfter(
      0,
      internal.conversationMessages.internalActions.processMessage,
      {
        message: await ctx.db.get(messageId).then(ensureFP()),
        conversation: await ctx.db.get(args.conversationId).then(ensureFP()),
        disableTriage: true,
      },
    );

    return messageId;
  },
});

export const sendFromAgent = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    agentId: v.id("agents"),
    content: v.string(),
    author: v.id("conversationParticipants"),
  },
  returns: v.id("conversationMessages"),
  handler: async (ctx, args) => {
    return await Messages.addMessageToConversationFromAgent(ctx, args);
  },
});

export const sendSystemMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.id("conversationMessages"),
  handler: async (ctx, args) => {
    return await Messages.addMessageToConversationFromSystem(ctx.db, args);
  },
});

export const listMessages = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    return await Messages.listMessages(ctx.db, {
      conversationId: args.conversationId,
      limit: args.count,
    });
  },
});

export const listMessagesHistoryForAgentGeneration = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await Messages.listMessages(ctx.db, {
      conversationId: args.conversationId,
      limit: args.count,
      kind: "participant",
    });

    const messagesWithAuthorDetails = await Promise.all(
      messages
        .filter((m) => m.kind == "participant")
        .map(async (message) => {
          const userOrAgent =
            await ConversationParticipants.getParticipantUserOrAgent(ctx.db, {
              participantId: message.author,
            });
          return { message, author: userOrAgent };
        }),
    );

    return messagesWithAuthorDetails.map(
      ({ author, message }) =>
        ({
          id: message._id,
          author: {
            name: author.kind == "agent" ? author.agent.name : author.user.name,
            kind: author.kind,
          },
          role: author.kind == "agent" ? "assistant" : "user",
          content: message.content,
        }) as const,
    );
  },
});
