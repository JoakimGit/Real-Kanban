import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { ensureIsBoardMember } from './model/board';
import { deleteTaskWithRelatedData } from './model/task';
import { mustGetCurrentUser } from './model/user';

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

export const updateTask = mutation({
  args: {
    taskId: v.id('tasks'),
    name: v.optional(v.string()),
    position: v.optional(v.float64()),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('critical'),
      ),
    ),
    estimate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id('users')),
  },
  handler: async (ctx, { taskId, ...updatedTask }) => {
    await ensureIsBoardMember(ctx, { fromTaskId: taskId });
    await ctx.db.patch(taskId, { ...updatedTask });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, { taskId }) => {
    await ensureIsBoardMember(ctx, { fromTaskId: taskId });
    await deleteTaskWithRelatedData(ctx, taskId);
  },
});

export const assignUserToTask = mutation({
  args: {
    taskId: v.id('tasks'),
    assignedTo: v.id('users'),
  },
  handler: async (ctx, { taskId, assignedTo }) => {
    await ensureIsBoardMember(ctx, { fromTaskId: taskId });
    await ctx.db.patch(taskId, { assignedTo });
  },
});

export const addLabelToTask = mutation({
  args: {
    taskId: v.id('tasks'),
    labelId: v.id('labels'),
  },
  handler: async (ctx, { taskId, labelId }) => {
    await ensureIsBoardMember(ctx, { fromTaskId: taskId });
    await ctx.db.insert('taskLabels', { taskId, labelId });
  },
});

export const removeLabelFromTask = mutation({
  args: {
    taskId: v.id('tasks'),
    labelId: v.id('labels'),
  },
  handler: async (ctx, { taskId, labelId }) => {
    await ensureIsBoardMember(ctx, { fromTaskId: taskId });

    for await (const link of ctx.db
      .query('taskLabels')
      .withIndex('by_taskId_labelId', (q) =>
        q.eq('taskId', taskId).eq('labelId', labelId),
      )) {
      await ctx.db.delete(link._id);
    }
  },
});
