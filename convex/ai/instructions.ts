import { Doc } from "../_generated/dataModel";
import { ParticipantUserOrAgent } from "../conversationParticipants/model";
import { MessageHistory } from "./history";

const referenceAgentInstructions = `You can reference an agent in your output using the following special syntax: 
@[AGENT_NAME](agent:AGENT_ID) 
so for example:
"Hey @[John](agent:abc123) can you take a look at this?"

A referenced agent will then pick that up later. They will be able to see the message history and the message that referenced them.`;

const triageInstructions = `You are a helpful agent that triages conversations.

You will be given a conversation message and its up to you to determine what agent you should route this message to.

YOU SHOULD NOT RESPOND TO THE QUERY DIRECTLY, ONLY TRIAGE THE MESSAGE.

You can use the tools to find out who the participants in the conversation are.

If there are no agent provided then you should send a message to the channel along the lines of "No agents available to handle this message, would you like me to see if there are any agents you have that might be suited?".

${referenceAgentInstructions}`;

const agentReplyInstructions = `You are an agent that is part of a conversation. You will be given a message and your job is to respond to the message. You can use the tools provided to you to help you respond to the message.

${referenceAgentInstructions}

You should respond with a reference to another agent if asked or if you think the other agent could help.
`;

type Args = {
  message: Doc<"conversationMessages">;
  messageAuthor: ParticipantUserOrAgent;
  conversation: Doc<"conversations">;
  agent: Doc<"agents">;
  participant: Doc<"conversationParticipants">;
  messageHistory: any[];
};

export const constructAdditionalInstructionContext = ({
  conversation,
  message,
  messageAuthor,
  agent,
  participant,
  messageHistory,
}: Args) => `Here is some extra info about you the agent:
${JSON.stringify(agent, null, 2)}

Here is some extra info about you as a participant in the conversation:
${JSON.stringify(participant, null, 2)}

Here is the message:
${JSON.stringify(message, null, 2)}

Here is some information about the message author:
${JSON.stringify(messageAuthor, null, 2)}

Here is some information about the conversation:
${JSON.stringify(conversation, null, 2)}

Here is the message history:
${JSON.stringify(messageHistory, null, 2)}
`;

export const constructTriageInstructions = (args: Args) =>
  `${triageInstructions}\n\n${constructAdditionalInstructionContext(args)}`;

export const constructAgentReplyInstructions = (args: Args) =>
  `${agentReplyInstructions}\n\n${constructAdditionalInstructionContext(args)}`;
