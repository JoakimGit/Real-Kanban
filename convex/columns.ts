import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { mustGetCurrentUser } from './model/user';
import {
  ensureIsBoardWorkspaceOwner,
  ensureIsWorkspaceOwner,
} from './model/workspace';
import { ensureIsBoardMember } from './model/board';

export const createColumn = mutation({
  args: {
    boardId: v.id('boards'),
    position: v.float64(),
    name: v.string(),
  },
  handler: async (ctx, columnData) => {
    await ensureIsBoardMember(ctx, columnData.boardId);
    await ctx.db.insert('columns', columnData);
  },
});
