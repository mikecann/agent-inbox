import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { agentsSchemaValidator } from "./agents/schema";
import {
  conversationParticipantsSchemaValidator,
  conversationParticipantsSchema,
} from "./conversationParticipants/schema";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  conversations: defineTable({
    title: v.string(),
    createdBy: v.id("users"),
    lastMessageTime: v.number(),
  }).index("by_user_and_time", ["createdBy", "lastMessageTime"]),

  agents: defineTable(agentsSchemaValidator)
    .index("by_creator", ["createdBy"])
    .index("by_name", ["name"])
    .index("by_system_agent_kind", ["systemAgentKind"]),

  conversationParticipants: conversationParticipantsSchema,

  conversationMessages: defineTable({
    conversationId: v.id("conversations"),
    content: v.string(),
    author: v.union(
      v.object({
        kind: v.literal("user"),
        userId: v.id("users"),
      }),
      v.object({
        kind: v.literal("agent"),
        agentId: v.id("agents"),
      }),
      v.object({
        kind: v.literal("system"),
      }),
    ),
    references: v.array(
      v.union(
        v.object({
          kind: v.literal("agent"),
          agentId: v.id("agents"),
          startIndex: v.number(),
          endIndex: v.number(),
        }),
      ),
    ),
  }).index("by_conversationId", ["conversationId"]),
});
