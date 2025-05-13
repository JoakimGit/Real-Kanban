import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { mustGetCurrentUser } from './model/user';
import {
  ensureIsBoardWorkspaceOwner,
  ensureIsWorkspaceOwner,
} from './model/workspace';

export const createBoard = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, boardData) => {
    const currentUser = await mustGetCurrentUser(ctx);

    await ensureIsWorkspaceOwner(ctx, boardData.workspaceId);

    const createdBoardId = await ctx.db.insert('boards', boardData);
    console.log(
      `Created board '${createdBoardId}' for user ${currentUser._id}`,
    );
    const boardMemberLink = await ctx.db.insert('boardMembers', {
      boardId: createdBoardId,
      userId: currentUser._id,
    });
    console.log(`Generated board link '${boardMemberLink}'`);
    return createdBoardId;
  },
});

export const deleteBoard = mutation({
  args: {
    boardId: v.id('boards'),
  },
  handler: async (ctx, { boardId }) => {
    const board = await ensureIsBoardWorkspaceOwner(ctx, boardId);

    const boardMembersToDelete = await ctx.db
      .query('boardMembers')
      .withIndex('by_boardId', (q) => q.eq('boardId', board._id))
      .collect();

    // Delete each boardMembers entry
    for (const member of boardMembersToDelete) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(board._id);
    console.log(`Deleted board and boardMember links for board: ${board._id}`);
  },
});

export const updateBoard = mutation({
  args: {
    boardId: v.id('boards'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { boardId, ...updatedBoard }) => {
    await ensureIsBoardWorkspaceOwner(ctx, boardId);
    await ctx.db.patch(boardId, { ...updatedBoard });
  },
});
