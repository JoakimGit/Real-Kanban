import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { ensureIsWorkspaceMember } from './model/board';
import { deleteTaskWithRelatedData } from './model/task';
import { mustGetCurrentUser } from './model/user';

export const createTask = mutation({
  args: {
    columnId: v.id('columns'),
    workspaceId: v.id('workspaces'),
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
    columnId: v.optional(v.id('columns')),
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
    await ensureIsWorkspaceMember(ctx, { fromTaskId: taskId });
    await ctx.db.patch(taskId, { ...updatedTask });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, { taskId }) => {
    await ensureIsWorkspaceMember(ctx, { fromTaskId: taskId });
    await deleteTaskWithRelatedData(ctx, taskId);
  },
});

export const duplicateTask = mutation({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, { taskId }) => {
    const user = await ensureIsWorkspaceMember(ctx, { fromTaskId: taskId });
    const task = await ctx.db.get(taskId);

    if (!task) {
      throw new ConvexError("Task doesn't exist");
    }

    const [taskLabels, checklistItems, comments] = await Promise.all([
      ctx.db
        .query('taskLabels')
        .withIndex('by_taskId_labelId', (q) => q.eq('taskId', taskId))
        .collect(),
      ctx.db
        .query('checklistItems')
        .withIndex('by_taskId_workspaceId', (q) => q.eq('taskId', taskId))
        .collect(),
      ctx.db
        .query('comments')
        .withIndex('by_taskId', (q) => q.eq('taskId', taskId))
        .collect(),
    ]);

    const { _id, createdBy, _creationTime, name, position, ...rest } = task;
    const newTaskId = await ctx.db.insert('tasks', {
      ...rest,
      createdBy: user._id,
      position: position + 0.01,
      name: `${name} (Copy)`,
    });

    for (const taskLabel of taskLabels) {
      await ctx.db.insert('taskLabels', {
        taskId: newTaskId,
        labelId: taskLabel.labelId,
      });
    }

    for (const item of checklistItems) {
      const { _id, _creationTime, taskId: _, ...itemData } = item;
      await ctx.db.insert('checklistItems', {
        ...itemData,
        taskId: newTaskId,
      });
    }

    for (const comment of comments) {
      const { _id, _creationTime, taskId: _, ...commentData } = comment;
      await ctx.db.insert('comments', {
        ...commentData,
        taskId: newTaskId,
      });
    }
  },
});

export const assignUserToTask = mutation({
  args: {
    taskId: v.id('tasks'),
    assignedTo: v.id('users'),
  },
  handler: async (ctx, { taskId, assignedTo }) => {
    await ensureIsWorkspaceMember(ctx, { fromTaskId: taskId });
    await ctx.db.patch(taskId, { assignedTo });
  },
});

export const addLabelToTask = mutation({
  args: {
    taskId: v.id('tasks'),
    labelId: v.id('labels'),
  },
  handler: async (ctx, { taskId, labelId }) => {
    await ensureIsWorkspaceMember(ctx, { fromTaskId: taskId });
    await ctx.db.insert('taskLabels', { taskId, labelId });
  },
});

export const removeLabelFromTask = mutation({
  args: {
    taskId: v.id('tasks'),
    labelId: v.id('labels'),
  },
  handler: async (ctx, { taskId, labelId }) => {
    await ensureIsWorkspaceMember(ctx, { fromTaskId: taskId });

    for await (const link of ctx.db
      .query('taskLabels')
      .withIndex('by_taskId_labelId', (q) =>
        q.eq('taskId', taskId).eq('labelId', labelId),
      )) {
      await ctx.db.delete(link._id);
    }
  },
});

/* ChecklistItem APIs */

export const createChecklistItem = mutation({
  args: {
    taskId: v.id('tasks'),
    workspaceId: v.id('workspaces'),
    name: v.string(),
    position: v.float64(),
  },
  handler: async (ctx, data) => {
    await mustGetCurrentUser(ctx);
    await ctx.db.insert('checklistItems', { ...data, isComplete: false });
  },
});

export const updateChecklistItem = mutation({
  args: {
    checklistItemId: v.id('checklistItems'),
    name: v.optional(v.string()),
    position: v.optional(v.float64()),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, { checklistItemId, ...data }) => {
    await mustGetCurrentUser(ctx);
    await ctx.db.patch(checklistItemId, { ...data });
  },
});

export const deleteChecklistItem = mutation({
  args: {
    checklistItemId: v.id('checklistItems'),
  },
  handler: async (ctx, { checklistItemId }) => {
    await mustGetCurrentUser(ctx);
    await ctx.db.delete(checklistItemId);
  },
});
