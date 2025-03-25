"use node";
import { ActionCtx } from "../_generated/server";
import * as Agents from "../agents/model";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { storage, memory } from "./mastra";
import { Mastra } from "@mastra/core/mastra";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { pick } from "../../shared/misc";
import { createTools } from "./tools";

const getTriageAgent = async (ctx: ActionCtx) => {
  const agent = await ctx.runQuery(
    internal.agents.private.findSystemAgentByKind,
    { systemAgentKind: "triage" },
  );
  if (agent) return agent;
  return await ctx.runMutation(internal.agents.private.createSystemAgent, {
    systemAgentKind: "triage",
    name: "System Triage Agent",
    description: `Triage messages to the correct agent`,
    personality: `Helpful, concise`,
    avatarUrl: Agents.createAgentAvatarUrl(`system-triage`),
    tools: [],
    lastActiveTime: Date.now(),
    kind: "system_agent",
  });
};

const getTriageAgentAndEnsureItIsJoinedToConversation = async (
  ctx: ActionCtx,
  conversationId: Id<"conversations">,
) => {
  const agent = await getTriageAgent(ctx);

  const participant = await ctx.runMutation(
    internal.conversations.private
      .joinTriageAgentToConversationIfNotAlreadyJoined,
    {
      conversationId,
    },
  );

  if (participant.kind != "agent")
    throw new Error(
      `Participant is not an agent, it should be as it is the triage agent`,
    );

  return { agent, participant };
};

export const triageMessage = async (
  ctx: ActionCtx,
  args: {
    message: Doc<"conversationMessages">;
    conversation: Doc<"conversations">;
  },
) => {
  const { agent, participant } =
    await getTriageAgentAndEnsureItIsJoinedToConversation(
      ctx,
      args.conversation._id,
    );

  // Set the triage agent's status to thinking
  await ctx.runMutation(
    internal.conversationParticipants.private.updateParticipantStatus,
    {
      participantId: participant._id,
      status: "thinking",
    },
  );

  try {
    // Get available non-system agents in the conversation
    const otherParticipants = await ctx.runQuery(
      internal.conversationParticipants.private.listNonSystemAgentParticipants,
      { conversationId: args.conversation._id },
    );

    const allTools = createTools(ctx);

    const triageAgentInstructions = `You are a helpful agent that triages conversations.
  
You will be given a conversation message and its up to you to determine what agent you should route this message to.
You must select one of the agents from the list of agents that I will provide.
If there are no agent provided then you should send a message to the conversation stating that there are no agents available to handle the message.
If there is an agent that can handle the message then you should send a message to the conversation stating that the message has been routed to the agent.

The availabe agents are:
${JSON.stringify(
  otherParticipants.map((p) => ({
    name: p.agent.name,
    description: p.agent.description,
    personality: p.agent.personality,
    tools: p.agent.tools,
    participantId: p.participant._id,
    id: p.agent._id,
  })),
  null,
  2,
)}

The current conversationId is: ${args.conversation._id}
  
`;

    const triageAgent = new Agent({
      name: "Conversation Triage Agent",
      instructions: triageAgentInstructions,
      model: openai("gpt-4o-mini"),
      tools: pick(allTools, "sendMessageToConversation"),
      memory,
    });

    const mastra = new Mastra({
      agents: { triageAgent },
      storage,
    });

    // Format agent information for the system message

    await mastra.getAgent("triageAgent").generate([
      {
        role: "user",
        content: `${args.message.content}`,
      },
    ]);
  } catch (error) {
    // we should add a message to the conversation to notify the user that the triage agent has errored
  } finally {
    // No longer thinking
    await ctx.runMutation(
      internal.conversationParticipants.private.updateParticipantStatus,
      {
        participantId: participant._id,
        status: "inactive",
      },
    );
  }
};
