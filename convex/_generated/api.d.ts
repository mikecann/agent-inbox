/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents_constants from "../agents/constants.js";
import type * as agents_model from "../agents/model.js";
import type * as agents_public from "../agents/public.js";
import type * as auth from "../auth.js";
import type * as conversationMessages from "../conversationMessages.js";
import type * as conversationParticipants from "../conversationParticipants.js";
import type * as conversations from "../conversations.js";
import type * as http from "../http.js";
import type * as mastra_lib_storage from "../mastra/lib/storage.js";
import type * as mastra_lib_vector from "../mastra/lib/vector.js";
import type * as mastra_mastra from "../mastra/mastra.js";
import type * as mastra_tools from "../mastra/tools.js";
import type * as mastra_triage from "../mastra/triage.js";
import type * as mastra__ from "../mastra/_.js";
import type * as model_conversationMessages from "../model/conversationMessages.js";
import type * as model_conversationParticipants from "../model/conversationParticipants.js";
import type * as model_conversations from "../model/conversations.js";
import type * as model_users from "../model/users.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "agents/constants": typeof agents_constants;
  "agents/model": typeof agents_model;
  "agents/public": typeof agents_public;
  auth: typeof auth;
  conversationMessages: typeof conversationMessages;
  conversationParticipants: typeof conversationParticipants;
  conversations: typeof conversations;
  http: typeof http;
  "mastra/lib/storage": typeof mastra_lib_storage;
  "mastra/lib/vector": typeof mastra_lib_vector;
  "mastra/mastra": typeof mastra_mastra;
  "mastra/tools": typeof mastra_tools;
  "mastra/triage": typeof mastra_triage;
  "mastra/_": typeof mastra__;
  "model/conversationMessages": typeof model_conversationMessages;
  "model/conversationParticipants": typeof model_conversationParticipants;
  "model/conversations": typeof model_conversations;
  "model/users": typeof model_users;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
