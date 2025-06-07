import { v } from 'convex/values';
import { mutation } from './_generated/server';
import * as Columns from './model/column';
import { ensureIsWorkspaceMember } from './model/workspace';

export const createColumn = mutation({
  args: {
    boardId: v.id('boards'),
    workspaceId: v.id('workspaces'),
    name: v.string(),
    position: v.float64(),
  },
  handler: async (ctx, columnData) => {
    await ensureIsWorkspaceMember(ctx, columnData.workspaceId);
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
    await Columns.ensureColIsInUserWorkspace(ctx, columnId);
    await ctx.db.patch(columnId, { ...updatedColumn });
  },
});

export const deleteColumn = mutation({
  args: {
    columnId: v.id('columns'),
  },
  handler: async (ctx, { columnId }) => {
    await Columns.deleteColumn(ctx, columnId);
  },
});
