import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { ensureIsWorkspaceMember } from './model/workspace';
import { deleteTaskWithRelatedData } from './model/task';

export const createTask = mutation({
  args: {
    columnId: v.id('columns'),
    workspaceId: v.id('workspaces'),
    position: v.float64(),
    name: v.string(),
  },
  handler: async (ctx, taskData) => {
    const user = await ensureIsWorkspaceMember(ctx, taskData.workspaceId);
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
    assignedTo: v.optional(v.union(v.id('users'), v.null())),
  },
  handler: async (ctx, { taskId, ...updatedTask }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new ConvexError('No task found');

    await ensureIsWorkspaceMember(ctx, task.workspaceId);
    await ctx.db.patch(taskId, { ...updatedTask });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, { taskId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new ConvexError('No task found');

    await ensureIsWorkspaceMember(ctx, task.workspaceId);
    await deleteTaskWithRelatedData(ctx, taskId);
  },
});

export const duplicateTask = mutation({
  args: {
    taskId: v.id('tasks'),
  },
  handler: async (ctx, { taskId }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new ConvexError('No task found');

    const user = await ensureIsWorkspaceMember(ctx, task.workspaceId);

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

/* ChecklistItem APIs */

export const createChecklistItem = mutation({
  args: {
    taskId: v.id('tasks'),
    workspaceId: v.id('workspaces'),
    name: v.string(),
    position: v.float64(),
  },
  handler: async (ctx, data) => {
    await ensureIsWorkspaceMember(ctx, data.workspaceId);
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
    const checklistItem = await ctx.db.get(checklistItemId);
    if (!checklistItem) throw new ConvexError('No checklist item found');

    await ensureIsWorkspaceMember(ctx, checklistItem.workspaceId);
    await ctx.db.patch(checklistItemId, { ...data });
  },
});

export const deleteChecklistItem = mutation({
  args: {
    checklistItemId: v.id('checklistItems'),
  },
  handler: async (ctx, { checklistItemId }) => {
    const checklistItem = await ctx.db.get(checklistItemId);
    if (!checklistItem) throw new ConvexError('No checklist item found');

    await ensureIsWorkspaceMember(ctx, checklistItem.workspaceId);
    await ctx.db.delete(checklistItemId);
  },
});
