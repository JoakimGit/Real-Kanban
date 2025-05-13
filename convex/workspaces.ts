import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { mustGetCurrentUser } from './model/user';
import { getManyFrom, getManyVia } from 'convex-helpers/server/relationships';
import { Doc } from './_generated/dataModel';
import { ensureIsWorkspaceOwner } from './model/workspace';

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, workspace) => {
    const currentUser = await mustGetCurrentUser(ctx);

    const workspaceId = await ctx.db.insert('workspaces', workspace);

    await ctx.db.insert('userWorkspaces', {
      userId: currentUser._id,
      workspaceId,
    });

    return workspaceId;
  },
});

export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, ...updatedWs }) => {
    await ensureIsWorkspaceOwner(ctx, workspaceId);
    await ctx.db.patch(workspaceId, updatedWs);
  },
});

export const getUserWorkspaces = query({
  handler: async (ctx) => {
    const currentUser = await mustGetCurrentUser(ctx);

    const userOwnedWorkspaces = await ctx.db
      .query('userWorkspaces')
      .withIndex('by_userId_workspaceId', (q) =>
        q.eq('userId', currentUser._id),
      )
      .collect();

    const workspaceIds = userOwnedWorkspaces.map((ws) => ws.workspaceId);
    const uniqueWorkspaceIds = new Set(workspaceIds);

    const userBoards = await getManyVia(
      ctx.db,
      'boardMembers',
      'boardId',
      'by_userId',
      currentUser._id,
    );

    userBoards.forEach((board) =>
      board ? uniqueWorkspaceIds.add(board?.workspaceId) : null,
    );

    const result = await Promise.all(
      Array.from(uniqueWorkspaceIds).map(async (id) => {
        const workspace = (await ctx.db.get(id)) as Doc<'workspaces'>;
        const boards = await getManyFrom(
          ctx.db,
          'boards',
          'by_workspaceId',
          id,
        );

        return { workspace, boards };
      }),
    );

    return result;
  },
});
