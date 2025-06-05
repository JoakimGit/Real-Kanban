// convex/resetAndSeed.ts
import { internal } from './_generated/api';
import { internalMutation } from './_generated/server';

// This mutation will be called internally by the cron job,
export const resetAndSeed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const { db } = ctx;
    console.log('Starting full database reset...');

    // Delete all documents from all tables
    const tablesToClear = [
      'activityLog',
      'checklistItems',
      'columns',
      'comments',
      'notifications',
      'taskLabels',
      'tasks',
      'labels',
      'boards',
      'userWorkspaces',
      'workspaces',
      'users',
    ];

    for (const tableName of tablesToClear) {
      // @ts-expect-error - Dynamic table names need a cast or careful typing
      const docs = await db.query(tableName).collect();
      for (const doc of docs) {
        await db.delete(doc._id);
      }
      console.log(`Cleared table: ${tableName}`);
    }
    console.log('Database reset complete.');

    // Now, trigger the seeding function
    await ctx.runMutation(internal.seed.seedDemoData);

    console.log('Database reset and re-seed successful!');
    return { success: true, message: 'Database reset and re-seed successful' };
  },
});
