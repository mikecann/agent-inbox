import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import * as Users from "./users";

export const createThread = async (
  { title }: { title: string },
  ctx: MutationCtx,
) => {
  const userId = await Users.getMyId(ctx);
  return await ctx.db.insert("threads", {
    title,
    createdBy: userId,
    lastMessageTime: Date.now(),
  });
};

export const getMyThreads = async (ctx: QueryCtx) => {
  const userId = await Users.getMyId(ctx);

  return await ctx.db
    .query("threads")
    .withIndex("by_user_and_time", (q) => q.eq("createdBy", userId))
    .order("desc")
    .collect();
};

export const getMyThread = async (ctx: QueryCtx, threadId: Id<"threads">) => {
  const userId = await Users.getMyId(ctx);
  const thread = await ctx.db.get(threadId);
  if (!thread) throw new Error("Thread not found");
  if (thread.createdBy !== userId)
    throw new Error(`Cannot access thread that doesnt belong to you`);
  return thread;
};
