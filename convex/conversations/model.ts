import { DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import * as Users from "../users/model";
import * as ConversationParticipants from "../conversationParticipants/model";
import * as Agents from "../agents/model";
import { doesHaveTriageAgent } from "../conversationParticipants/model";
import * as ConversationMessages from "../conversationMessages/model";

export const ensureICanAccessConversation = async (
  ctx: QueryCtx | MutationCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  const userId = await Users.getMyId(ctx);
  const conversation = await ctx.db.get(conversationId);

  if (!conversation) throw new Error("Conversation not found");
  if (conversation.createdBy !== userId) throw new Error("Access denied");

  return conversation;
};

export const createConversation = async (
  ctx: MutationCtx,
  { title }: { title: string },
) => {
  const userId = await Users.getMyId(ctx);
  const conversationId = await ctx.db.insert("conversations", {
    title,
    createdBy: userId,
    lastMessageTime: Date.now(),
  });

  // Add the creator as a participant
  await ConversationParticipants.addUser(ctx.db, { conversationId, userId });

  return conversationId;
};

export const listMine = async (ctx: QueryCtx) => {
  const userId = await Users.getMyId(ctx);

  return await ctx.db
    .query("conversations")
    .withIndex("by_user_and_time", (q) => q.eq("createdBy", userId))
    .order("desc")
    .collect();
};

export const findMine = async (
  ctx: QueryCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  const userId = await Users.getMyId(ctx);
  const conversation = await ctx.db.get(conversationId);
  if (conversation && conversation.createdBy !== userId)
    throw new Error("Access denied");
  return conversation;
};

export const getMine = async (
  ctx: QueryCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  const conversation = await findMine(ctx, { conversationId });
  if (!conversation) throw new Error("Conversation not found");
  return conversation;
};

export const updateMine = async (
  ctx: MutationCtx,
  {
    conversationId,
    title,
  }: { conversationId: Id<"conversations">; title: string },
) => {
  await ensureICanAccessConversation(ctx, { conversationId });
  return await ctx.db.patch(conversationId, { title });
};

export const removeMine = async (
  ctx: MutationCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  await ensureICanAccessConversation(ctx, { conversationId });
  await ctx.db.delete(conversationId);
};

export const isTriageAgentJoined = async (
  db: DatabaseReader,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  return await doesHaveTriageAgent(db, { conversationId });
};

export const joinTriageAgentToConversationIfNotAlreadyJoined = async (
  db: DatabaseWriter,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  const agent = await Agents.getSystemAgentByKind(db, {
    systemAgentKind: "triage",
  });
  const conversation = await db.get(conversationId);
  if (!conversation)
    throw new Error(`Conversation not found ${conversationId}`);
  if (await doesHaveTriageAgent(db, { conversationId })) return;
  await ConversationParticipants.addAgent(db, {
    conversationId,
    agentId: agent._id,
  });
  const triageAgent = await Agents.getTriageAgent(db);
  await ConversationMessages.createParticipantJoinedConversationMessage(db, {
    conversationId,
    agentOrUser: triageAgent,
  });
};
