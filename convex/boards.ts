import { getManyVia } from 'convex-helpers/server/relationships';
import { v } from 'convex/values';
import { orderByPosition } from '../app/utils/order';
import { mutation, query } from './_generated/server';
import { User } from './model/user';
import {
  ensureIsBoardWorkspaceOwner,
  ensureIsWorkspaceMember,
  ensureIsWorkspaceOwner,
} from './model/workspace';
import * as Boards from './model/board';

export const createBoard = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, boardData) => {
    await ensureIsWorkspaceOwner(ctx, boardData.workspaceId);
    await ctx.db.insert('boards', boardData);
  },
});

export const deleteBoard = mutation({
  args: {
    boardId: v.id('boards'),
  },
  handler: async (ctx, { boardId }) => {
    await Boards.deleteBoard(ctx, boardId);
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

export const getBoardWithColumnsAndTasks = query({
  args: {
    boardId: v.id('boards'),
  },
  handler: async (ctx, { boardId }) => {
    const board = await ctx.db.get(boardId);
    if (!board) return null;

    try {
      await ensureIsWorkspaceMember(ctx, board.workspaceId);
    } catch {
      return null;
    }

    // Fetch columns for the board, ordered by position
    const columns = await ctx.db
      .query('columns')
      .withIndex('by_boardId_workspaceId', (q) => q.eq('boardId', boardId))
      .collect();
    const sortedColumns = columns.sort(orderByPosition);

    // Fetch tasks and related data for each column
    const columnsWithTasks = await Promise.all(
      sortedColumns.map(async (column) => {
        const tasksForColumn = await ctx.db
          .query('tasks')
          .withIndex('by_columnId_workspaceId', (q) =>
            q.eq('columnId', column._id),
          )
          .collect();
        const sortedTasks = tasksForColumn.sort(orderByPosition);

        // Fetch related data for tasks in parallel
        const tasksWithDetails = await Promise.all(
          sortedTasks.map(async (task) => {
            const [assignedTo, labels, checklistItems, anyComment] =
              await Promise.all([
                (task.assignedTo
                  ? ctx.db.get(task.assignedTo)
                  : null) as User | null,
                getManyVia(
                  ctx.db,
                  'taskLabels',
                  'labelId',
                  'by_taskId_labelId',
                  task._id,
                  'taskId',
                ),
                ctx.db
                  .query('checklistItems')
                  .withIndex('by_taskId_workspaceId', (q) =>
                    q.eq('taskId', task._id),
                  )
                  .collect(),
                ctx.db
                  .query('comments')
                  .withIndex('by_taskId', (q) => q.eq('taskId', task._id))
                  .first(),
              ]);

            return {
              ...task,
              assignedTo,
              labels: labels.filter(Boolean),
              checklistItems: checklistItems.sort(orderByPosition),
              hasComments: anyComment !== null,
            };
          }),
        );

        return {
          ...column,
          tasks: tasksWithDetails,
        };
      }),
    );

    return {
      ...board,
      columns: columnsWithTasks,
    };
  },
});
