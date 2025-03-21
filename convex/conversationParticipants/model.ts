import { DatabaseReader, DatabaseWriter } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import * as Agents from "../agents/model";
import * as Users from "../users/model";
import { exhaustiveCheck } from "../../shared/misc";

export const getParticipants = async (
  db: DatabaseReader,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  const participants = await db
    .query("conversationParticipants")
    .withIndex("by_conversationId", (q) =>
      q.eq("conversationId", conversationId),
    )
    .collect();

  return participants;
};

export const findParticipant = async (
  db: DatabaseReader,
  { participantId }: { participantId: Id<"conversationParticipants"> },
) => {
  return await db.get(participantId);
};

export const getParticipant = async (
  db: DatabaseReader,
  { participantId }: { participantId: Id<"conversationParticipants"> },
) => {
  const participant = await findParticipant(db, { participantId });
  if (!participant) throw new Error(`Participant not found ${participantId}`);
  return participant;
};

export const getParticipantUserOrAgent = async (
  db: DatabaseReader,
  { participantId }: { participantId: Id<"conversationParticipants"> },
): Promise<Doc<"agents"> | Doc<"users">> => {
  const participant = await getParticipant(db, { participantId });
  if (participant.kind === "agent")
    return await Agents.get(db, { agentId: participant.agentId });
  if (participant.kind === "user")
    return await Users.get(db, { userId: participant.userId });
  exhaustiveCheck(participant);
};

export const addAgent = async (
  db: DatabaseWriter,
  {
    conversationId,
    agentId,
  }: { conversationId: Id<"conversations">; agentId: Id<"agents"> },
) => {
  const existing = await db
    .query("conversationParticipants")
    .withIndex("by_conversationId_kind_agentId", (q) =>
      q
        .eq("conversationId", conversationId)
        .eq("kind", "agent")
        .eq("agentId", agentId),
    )
    .first();

  if (existing) return existing._id;

  return db.insert("conversationParticipants", {
    conversationId,
    agentId,
    kind: "agent",
    addedAt: Date.now(),
    status: "none",
  });
};

export const addUser = async (
  db: DatabaseWriter,
  {
    conversationId,
    userId,
  }: { conversationId: Id<"conversations">; userId: Id<"users"> },
) => {
  const existing = await db
    .query("conversationParticipants")
    .withIndex("by_conversationId_kind_userId", (q) =>
      q
        .eq("conversationId", conversationId)
        .eq("kind", "user")
        .eq("userId", userId),
    )
    .first();

  if (existing) return existing._id;

  return db.insert("conversationParticipants", {
    conversationId,
    userId,
    kind: "user",
    addedAt: Date.now(),
    status: "none",
  });
};

export const removeParticipant = async (
  db: DatabaseWriter,
  { participantId }: { participantId: Id<"conversationParticipants"> },
) => {
  await db.delete(participantId);
};

export const doesHaveAgent = async (
  db: DatabaseReader,
  {
    conversationId,
    agentId,
  }: { conversationId: Id<"conversations">; agentId: Id<"agents"> },
) => {
  const conversationParticipants = await db
    .query("conversationParticipants")
    .withIndex("by_conversationId_kind_agentId", (q) =>
      q
        .eq("conversationId", conversationId)
        .eq("kind", "agent")
        .eq("agentId", agentId),
    )
    .first();

  return !!conversationParticipants;
};

export const doesHaveTriageAgent = async (
  db: DatabaseReader,
  { conversationId }: { conversationId: Id<"conversations"> },
) => {
  const triageAgent = await Agents.getTriageAgent(db);
  return doesHaveAgent(db, { conversationId, agentId: triageAgent._id });
};
