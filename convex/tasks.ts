import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { mustGetCurrentUser } from './model/user';
import {
  ensureIsBoardWorkspaceOwner,
  ensureIsWorkspaceOwner,
} from './model/workspace';
import { ensureIsBoardMember } from './model/board';

export const createTask = mutation({
  args: {
    columnId: v.id('columns'),
    position: v.float64(),
    name: v.string(),
  },
  handler: async (ctx, taskData) => {
    const user = await mustGetCurrentUser(ctx);
    await ctx.db.insert('tasks', { ...taskData, createdBy: user._id });
  },
});
