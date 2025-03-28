import { z } from "zod";
import { Id } from "../convex/_generated/dataModel";

export const toolDefinitions = {
  listConversationParticipants: {
    name: "listConversationParticipants",
    description: "A tool for listing the participants in a conversation.",
    parameters: z.object({
      conversationId: z
        .string()
        .describe("The ID of the conversation to list participants for"),
    }),
  },
  listAgents: {
    name: "listAgents",
    description: "Allows listing of all of a user's agents",
    parameters: z.object({
      userId: z.string().describe("The ID of the user whose agents to list"),
    }),
  },
  messageAnotherAgent: {
    name: "messageAnotherAgent",
    description: "Allows sending of a message to another agent",
    parameters: z.object({
      target: z
        .object({
          agentId: z.string(),
          agentName: z.string(),
        })
        .describe("The target agent to message"),
      content: z.string().describe("The message content to send"),
    }),
  },
  noOutput: {
    name: "noOutput",
    description: "Use this tool if you dont want to return any output",
    parameters: z.object({
      reasoning: z.string().describe("The reason for not returning output"),
    }),
  },
  webSearch: {
    name: "webSearch",
    description: "Use this tool to search the web for information",
    parameters: z.object({
      query: z.string().describe("The search query to execute"),
    }),
  },
  scheduleTask: {
    name: "scheduleTask",
    description: "Allows scheduling of a task to be completed at a later time.",
    parameters: z.object({
      target: z
        .object({
          agentId: z.string(),
          agentName: z.string(),
        })
        .describe("The target agent for the scheduled task"),
      title: z.string().describe("The title of the scheduled task"),
      content: z.string().describe("The content of the scheduled task"),
      secondsFromNow: z
        .number()
        .describe("When to schedule the task for (in seconds from now)"),
    }),
  },
} as const;

export type AvailableToolName = keyof typeof toolDefinitions;
