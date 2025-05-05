import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { mustGetCurrentUser } from './users';
import { getManyFrom } from 'convex-helpers/server/relationships';

export const createBoard = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, boardData) => {
    const currentUser = await mustGetCurrentUser(ctx);
    const userWorkspaces = await getManyFrom(
      ctx.db,
      'userWorkspaces',
      'by_userId',
      currentUser._id,
    );

    const userIsOwnerOfWorkspace = userWorkspaces.some(
      (workSpace) => workSpace.workspaceId === boardData.workspaceId,
    );

    if (!userIsOwnerOfWorkspace) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.insert('boards', boardData);
  },
});
