"use node";
import { ActionCtx } from "../_generated/server";
import * as Agents from "../agents/model";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { storage, memory } from "./mastra";
import { Mastra } from "@mastra/core/mastra";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { createTools } from "./tools";
import { z } from "zod";
import { pick } from "convex-helpers";
import { createLogger } from "@mastra/core/logger";

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

    const messageHistory = await ctx.runQuery(
      internal.conversationMessages.private
        .listMessagesHistoryForAgentGeneration,
      { conversationId: args.conversation._id, count: 10 },
    );

    const allTools = createTools({ ctx, agent });

    const triageAgentInstructions = `You are a helpful agent that triages conversations.
  
You will be given a conversation message and its up to you to determine what agent you should route this message to.

YOU SHOULD NOT RESPOND TO THE QUERY DIRECTLY, ONLY TRIAGE THE MESSAGE.

You must select one of the agents from the list of agents that I will provide.

If there are no agent provided then you should respond along the lines of "No agents available to handle this message, would you like me to see if there are any agents you have that might be suited?".

To reference an agent in your response use the following format: @[AGENT_NAME](agent:AGENT_ID) so for example @[John](agent:abc123)

If there is an agent that can handle the message then you should respond in a casual friendly manner. "Hey @[AGENT_NAME](agent:abc123) can you take a look at this?" or "Hey @[AGENT_NAME](agent:abc123) this seems like its a good one for you" feel free to be creative.

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

Here is the conversation history:
${JSON.stringify(messageHistory, null, 2)}
`;

    console.log(`Triage agent instructions: ${triageAgentInstructions}`);
    console.log(`Triage agent history`, messageHistory);

    const triageAgent = new Agent({
      name: "Conversation Triage Agent",
      instructions: triageAgentInstructions,
      model: openai("gpt-4o-mini"),
      memory,
    });

    const mastra = new Mastra({
      agents: { triageAgent },
      storage,
      logger: createLogger({
        level: "debug",
        name: "triage-agent-mastra",
      }),
    });

    const result = await mastra.getAgent("triageAgent").generate(
      [
        {
          role: "user",
          content: `${args.message.content}`,
        },
      ],
      {
        output: z.object({
          messageContent: z.string(),
          agentId: z.optional(z.string()),
        }),
      },
    );

    console.log(`Triage agent result:`, result);

    await ctx.runMutation(
      internal.conversationMessages.private.sendFromTriageAgent,
      {
        conversationId: args.conversation._id,
        content: result.object.messageContent,
      },
    );
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
