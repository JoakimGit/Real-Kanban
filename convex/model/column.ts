import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';
import { ensureIsWorkspaceMember } from './workspace';
import { deleteTaskWithRelatedData } from './task';

export const deleteColumn = async (
  ctx: MutationCtx,
  columnId: Id<'columns'>,
) => {
  await ensureColIsInUserWorkspace(ctx, columnId);

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
};

export const ensureColIsInUserWorkspace = async (
  ctx: MutationCtx,
  columnId: Id<'columns'>,
) => {
  const column = await ctx.db.get(columnId);
  if (!column) throw new ConvexError('No column found');

  await ensureIsWorkspaceMember(ctx, column?.workspaceId);
};
