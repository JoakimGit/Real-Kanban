import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { mustGetCurrentUser } from './users';

export const createWorkspace = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const currentUser = await mustGetCurrentUser(ctx);

    const workspaceId = await ctx.db.insert('workspaces', { name });

    await ctx.db.insert('userWorkspaces', {
      userId: currentUser._id,
      workspaceId,
    });

    return workspaceId;
  },
});
