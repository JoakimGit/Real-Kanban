import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';
import { deleteColumn } from './column';
import { ensureIsBoardWorkspaceOwner } from './workspace';

export const deleteBoard = async (ctx: MutationCtx, boardId: Id<'boards'>) => {
  await ensureIsBoardWorkspaceOwner(ctx, boardId);

  const columnsInBoard = await ctx.db
    .query('columns')
    .withIndex('by_boardId_workspaceId', (q) => q.eq('boardId', boardId))
    .collect();

  // delete each column
  for (const column of columnsInBoard) {
    await deleteColumn(ctx, column._id);
  }

  await ctx.db.delete(boardId);
};
