import { ConvexError, v } from 'convex/values';
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
      'by_userId_boardId',
      currentUser._id,
      'userId',
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

export const getWorkspace = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    await mustGetCurrentUser(ctx);
    return await ctx.db.get(workspaceId);
  },
});

/* Labels */

export const getWorkspaceLabels = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    await mustGetCurrentUser(ctx);
    return await getManyFrom(ctx.db, 'labels', 'by_workspaceId', workspaceId);
  },
});

export const createLabel = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, data) => {
    await ensureIsWorkspaceOwner(ctx, data.workspaceId);
    ctx.db.insert('labels', data);
  },
});

export const updateLabel = mutation({
  args: {
    labelId: v.id('labels'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { labelId, color, name }) => {
    const found = await ctx.db.get(labelId);

    if (!found) {
      throw new ConvexError('Label not found');
    }
    await ensureIsWorkspaceOwner(ctx, found.workspaceId);

    ctx.db.patch(found._id, { color, name });
  },
});

export const deleteLabel = mutation({
  args: {
    labelId: v.id('labels'),
  },
  handler: async (ctx, { labelId }) => {
    const found = await ctx.db.get(labelId);

    if (!found) {
      throw new ConvexError('Label not found');
    }

    await ensureIsWorkspaceOwner(ctx, found.workspaceId);
    ctx.db.delete(labelId);
  },
});

export const setLabelToTask = mutation({
  args: {
    labelId: v.id('labels'),
    taskId: v.id('tasks'),
  },
  handler: async (ctx, data) => {
    await mustGetCurrentUser(ctx);

    const existingLinks = await ctx.db
      .query('taskLabels')
      .withIndex('by_taskId_labelId', (q) =>
        q.eq('taskId', data.taskId).eq('labelId', data.labelId),
      )
      .collect();

    if (existingLinks.length !== 0) {
      for (const link of existingLinks) {
        ctx.db.delete(link._id);
      }
    } else {
      await ctx.db.insert('taskLabels', data);
    }
  },
});
