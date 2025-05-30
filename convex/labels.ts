import { getManyFrom } from 'convex-helpers/server/relationships';
import { v, ConvexError } from 'convex/values';
import { query, mutation } from './_generated/server';
import { ensureIsWorkspaceMember } from './model/workspace';

export const getLabelsByWorkspace = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, { workspaceId }) => {
    await ensureIsWorkspaceMember(ctx, workspaceId);
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
    await ensureIsWorkspaceMember(ctx, data.workspaceId);
    await ctx.db.insert('labels', data);
  },
});

export const updateLabel = mutation({
  args: {
    labelId: v.id('labels'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { labelId, color, name }) => {
    const label = await ctx.db.get(labelId);
    if (!label) throw new ConvexError('Label not found');

    await ensureIsWorkspaceMember(ctx, label.workspaceId);
    await ctx.db.patch(label._id, { color, name });
  },
});

export const deleteLabel = mutation({
  args: {
    labelId: v.id('labels'),
  },
  handler: async (ctx, { labelId }) => {
    const label = await ctx.db.get(labelId);
    if (!label) throw new ConvexError('Label not found');

    await ensureIsWorkspaceMember(ctx, label.workspaceId);
    await ctx.db.delete(labelId);
  },
});

export const setLabelToTask = mutation({
  args: {
    labelId: v.id('labels'),
    taskId: v.id('tasks'),
  },
  handler: async (ctx, data) => {
    const label = await ctx.db.get(data.labelId);
    if (!label) throw new ConvexError('Label not found');

    await ensureIsWorkspaceMember(ctx, label.workspaceId);

    const existingLink = await ctx.db
      .query('taskLabels')
      .withIndex('by_taskId_labelId', (q) =>
        q.eq('taskId', data.taskId).eq('labelId', data.labelId),
      )
      .first();

    if (existingLink) {
      await ctx.db.delete(existingLink._id);
    } else {
      await ctx.db.insert('taskLabels', data);
    }
  },
});
