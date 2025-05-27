import { getManyFrom } from 'convex-helpers/server/relationships';
import { v, ConvexError } from 'convex/values';
import { query, mutation } from './_generated/server';
import { mustGetCurrentUser } from './model/user';
import { ensureIsWorkspaceOwner } from './model/workspace';

export const getLabelsByWorkspace = query({
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
