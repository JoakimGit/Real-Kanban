import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export async function deleteTaskWithRelatedData(
  ctx: MutationCtx,
  taskId: Id<'tasks'>,
) {
  // Fetch related data in parallel
  const [comments, checklistItems, taskLabels] = await Promise.all([
    ctx.db
      .query('comments')
      .withIndex('by_taskId', (q) => q.eq('taskId', taskId))
      .collect(),
    ctx.db
      .query('checklistItems')
      .withIndex('by_taskId_workspaceId', (q) => q.eq('taskId', taskId))
      .collect(),
    ctx.db
      .query('taskLabels')
      .withIndex('by_taskId_labelId', (q) => q.eq('taskId', taskId))
      .collect(),
  ]);

  // Delete all the related data
  for (const document of [...comments, ...checklistItems, ...taskLabels]) {
    await ctx.db.delete(document._id);
  }

  // Delete the task itself
  await ctx.db.delete(taskId);
}
