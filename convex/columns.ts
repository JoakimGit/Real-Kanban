import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { ensureIsWorkspaceMember } from './model/board';
import { deleteTaskWithRelatedData } from './model/task';

export const createColumn = mutation({
  args: {
    boardId: v.id('boards'),
    workspaceId: v.id('workspaces'),
    name: v.string(),
    position: v.float64(),
  },
  handler: async (ctx, columnData) => {
    await ensureIsWorkspaceMember(ctx, { fromBoardId: columnData.boardId });
    await ctx.db.insert('columns', columnData);
  },
});

export const updateColumn = mutation({
  args: {
    columnId: v.id('columns'),
    name: v.optional(v.string()),
    position: v.optional(v.float64()),
  },
  handler: async (ctx, { columnId, ...updatedColumn }) => {
    await ensureIsWorkspaceMember(ctx, { fromColumnId: columnId });
    await ctx.db.patch(columnId, { ...updatedColumn });
  },
});

export const deleteColumn = mutation({
  args: {
    columnId: v.id('columns'),
  },
  handler: async (ctx, { columnId }) => {
    await ensureIsWorkspaceMember(ctx, { fromColumnId: columnId });

    // get all tasks in this column
    const tasksInColumn = await ctx.db
      .query('tasks')
      .withIndex('by_columnId_workspaceId', (q) => q.eq('columnId', columnId))
      .collect();

    // delete each task
    for (const task of tasksInColumn) {
      await deleteTaskWithRelatedData(ctx, task._id);
    }

    await ctx.db.delete(columnId);
  },
});
