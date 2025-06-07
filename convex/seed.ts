import { Id } from './_generated/dataModel';
import { internalMutation, MutationCtx } from './_generated/server';

async function createuser(
  ctx: MutationCtx,
  firstName: string,
  lastName: string,
) {
  console.log(`Creating user (${firstName} ${lastName})`);
  return await ctx.db.insert('users', {
    clerkUser: {
      id: `${firstName}_${lastName}_demo_id`,
      primary_email_address_id: `${firstName}_email_id`,
      email_addresses: [
        {
          email_address: `${firstName}.${lastName}@gmail.com`,
          id: `${firstName}_email_id`,
        },
      ],
      first_name: `${firstName}`,
      last_name: `${lastName}`,
    },
  });
}
async function addUserToWorkspace(
  ctx: MutationCtx,
  workspaceId: Id<'workspaces'>,
  userId: Id<'users'>,
  role: 'owner' | 'member' = 'member',
) {
  console.log(`Adding user (${userId}) to workspace (${workspaceId})`);
  await ctx.db.insert('userWorkspaces', {
    userId,
    workspaceId,
    role,
  });
}

async function createBoard(
  ctx: MutationCtx,
  workspaceId: Id<'workspaces'>,
  name: string,
  description: string,
  color: string,
) {
  console.log(`Creating Board: ${name} for workspace (${workspaceId})`);
  return await ctx.db.insert('boards', {
    workspaceId,
    name,
    description,
    color: `bg-${color}-600`,
  });
}

// This is an internal mutation, meaning it can only be called by other Convex functions (like the scheduler).
export const seedDemoData = internalMutation({
  handler: async (ctx) => {
    const { db } = ctx;
    console.log('Starting demo data seeding...');

    // --- Demo Workspace 1: Marketing Department ---
    const marketingWorkspaceId = await db.insert('workspaces', {
      name: 'Marketing Demo',
      description: 'Demo workspace with sample data',
      color: 'bg-lime-600',
    });
    console.log(`Created Marketing Workspace: ${marketingWorkspaceId}`);

    // Create demo users
    const robbieUserId = await createuser(ctx, 'Robbie', 'Kelly');
    const danielUserId = await createuser(ctx, 'Daniel', 'Harrington');
    const alanUserId = await createuser(ctx, 'Joseph', 'Elliott');
    const angelaUserId = await createuser(ctx, 'Angela', 'Thomas');
    const peterUserId = await createuser(ctx, 'Peter', 'Cook');
    const michaelUserId = await createuser(ctx, 'Michael', 'Smith');
    const arahUserId = await createuser(ctx, 'Sarah', 'Lawson');

    await addUserToWorkspace(ctx, marketingWorkspaceId, robbieUserId, 'owner');
    await addUserToWorkspace(ctx, marketingWorkspaceId, danielUserId);
    await addUserToWorkspace(ctx, marketingWorkspaceId, alanUserId);
    await addUserToWorkspace(ctx, marketingWorkspaceId, angelaUserId);

    // --- Boards for Marketing Workspace ---
    const q3CampaignBoardId = await createBoard(
      ctx,
      marketingWorkspaceId,
      'Q3 Campaign Launch',
      'Tasks for launching the new product campaign.',
      'red',
    );

    const socialMediaBoardId = await createBoard(
      ctx,
      marketingWorkspaceId,
      'Social Media Content Calendar',
      'Planning and execution for all social media posts.',
      'amber',
    );

    // --- Columns for Q3 Campaign Launch Board ---
    const campaignBacklogColId = await db.insert('columns', {
      boardId: q3CampaignBoardId,
      workspaceId: marketingWorkspaceId,
      name: 'Campaign Backlog',
      position: 1,
    });
    const campaignToDoColId = await db.insert('columns', {
      boardId: q3CampaignBoardId,
      workspaceId: marketingWorkspaceId,
      name: 'To Do',
      position: 2,
    });
    const campaignInProgressColId = await db.insert('columns', {
      boardId: q3CampaignBoardId,
      workspaceId: marketingWorkspaceId,
      name: 'In Progress',
      position: 3,
    });
    const campaignReviewColId = await db.insert('columns', {
      boardId: q3CampaignBoardId,
      workspaceId: marketingWorkspaceId,
      name: 'In Review',
      position: 4,
    });
    const campaignDoneColId = await db.insert('columns', {
      boardId: q3CampaignBoardId,
      workspaceId: marketingWorkspaceId,
      name: 'Done',
      position: 5,
    });
    console.log('Created columns for Q3 Campaign Board.');

    // --- Tasks for Q3 Campaign Launch Board ---

    // 1. Basic task without description
    await db.insert('tasks', {
      columnId: campaignBacklogColId,
      workspaceId: marketingWorkspaceId,
      name: 'Weekly Team Sync',
      position: 1,
      createdBy: robbieUserId,
    });

    // 2. Task with description
    const marketingStrategyTask = await db.insert('tasks', {
      columnId: campaignBacklogColId,
      workspaceId: marketingWorkspaceId,
      name: 'Define Marketing Strategy',
      description:
        'This task has a description. It is indicated by the icon on the task footer.',
      position: 2,
      createdBy: robbieUserId,
    });

    // 3. Task with only label
    const labelOnlyTask = await db.insert('tasks', {
      columnId: campaignBacklogColId,
      workspaceId: marketingWorkspaceId,
      name: 'SEO Keyword Research',
      description:
        'This task demonstrates label usage. Labels defined for a workspace can be added here. Labels can also be directly created from this view.',
      position: 3,
      createdBy: robbieUserId,
    });

    // 4. Task with only comments
    const commentsTask = await db.insert('tasks', {
      columnId: campaignToDoColId,
      workspaceId: marketingWorkspaceId,
      name: 'Review Brand Guidelines',
      description:
        'This task demonstrates comment functionality. The button is disabled when the input is empty.',
      position: 1,
      createdBy: robbieUserId,
    });
    await db.insert('comments', {
      taskId: commentsTask,
      text: 'Should we include the new color palette?',
      author: robbieUserId,
      lastModified: Date.now(),
    });
    await db.insert('comments', {
      taskId: commentsTask,
      text: 'Yes, please include all recent updates',
      author: danielUserId,
      lastModified: Date.now() + 1000,
    });

    // 5. Task with only checklist
    const checklistOnlyTask = await db.insert('tasks', {
      columnId: campaignToDoColId,
      workspaceId: marketingWorkspaceId,
      name: 'Website Launch Checklist',
      description:
        'This task demonstrates checklist functionality. A progress bar appears on the task as you complete these items.',
      position: 2,
      createdBy: robbieUserId,
    });
    await db.insert('checklistItems', {
      taskId: checklistOnlyTask,
      workspaceId: marketingWorkspaceId,
      name: 'Test all links',
      isComplete: true,
      position: 1,
    });
    await db.insert('checklistItems', {
      taskId: checklistOnlyTask,
      workspaceId: marketingWorkspaceId,
      name: 'Check mobile responsiveness',
      isComplete: true,
      position: 2,
    });

    // 6. Task with only assignment
    await db.insert('tasks', {
      columnId: campaignInProgressColId,
      workspaceId: marketingWorkspaceId,
      name: 'Create Social Media Graphics',
      description:
        'This task demonstrates user assignment. Only users invited to a workspace can be assigned to.',
      position: 1,
      assignedTo: danielUserId,
      createdBy: robbieUserId,
    });

    // 7. Task with only due date
    await db.insert('tasks', {
      columnId: campaignInProgressColId,
      workspaceId: marketingWorkspaceId,
      name: 'Submit PR Draft',
      description: 'This task demonstrates due date setting.',
      position: 2,
      dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
      createdBy: robbieUserId,
    });

    // 8. Task with only priority
    await db.insert('tasks', {
      columnId: campaignReviewColId,
      workspaceId: marketingWorkspaceId,
      name: 'Finalize Campaign Budget',
      description: 'This task demonstrates priority setting.',
      position: 1,
      priority: 'high',
      createdBy: robbieUserId,
    });

    // 9. Task with only estimate
    await db.insert('tasks', {
      columnId: campaignReviewColId,
      workspaceId: marketingWorkspaceId,
      name: 'Design Landing Page',
      description: 'This task demonstrates time estimation.',
      position: 2,
      estimate: 8, // hours
      createdBy: robbieUserId,
    });

    // Comprehensive task with multiple features
    const comprehensiveTask = await db.insert('tasks', {
      columnId: campaignToDoColId,
      workspaceId: marketingWorkspaceId,
      name: 'Design Campaign Assets',
      description:
        'This task showcases multiple features: assignment, due date, estimate, labels, and checklist items.',
      position: 3,
      priority: 'high',
      assignedTo: danielUserId,
      createdBy: robbieUserId,
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      estimate: 16, // hours
    });

    // Add checklist items to comprehensive task
    await db.insert('checklistItems', {
      taskId: comprehensiveTask,
      workspaceId: marketingWorkspaceId,
      name: 'Create banner designs',
      isComplete: true,
      position: 1,
    });
    await db.insert('checklistItems', {
      taskId: comprehensiveTask,
      workspaceId: marketingWorkspaceId,
      name: 'Design social media graphics',
      isComplete: false,
      position: 2,
    });
    console.log('Created comprehensive task');

    // Add comments to comprehensive task
    await db.insert('comments', {
      taskId: comprehensiveTask,
      text: 'Make sure to follow our new brand guidelines',
      author: robbieUserId,
      lastModified: Date.now(),
    });
    await db.insert('comments', {
      taskId: comprehensiveTask,
      text: "I'll start with the banner designs tomorrow",
      author: danielUserId,
      lastModified: Date.now() + 1000,
    });

    console.log('Created tasks for Q3 Campaign Board.');

    // --- Labels for Marketing Workspace ---
    const seoLabelId = await db.insert('labels', {
      name: 'SEO',
      color: 'bg-slate-600',
      workspaceId: marketingWorkspaceId,
    });
    const designLabelId = await db.insert('labels', {
      name: 'Design',
      color: 'bg-blue-600',
      workspaceId: marketingWorkspaceId,
    });
    const analyticsLabelId = await db.insert('labels', {
      name: 'Analytics',
      color: 'bg-green-600',
      workspaceId: marketingWorkspaceId,
    });
    const copyLabelId = await db.insert('labels', {
      name: 'Copywriting',
      color: 'bg-yellow-600',
      workspaceId: marketingWorkspaceId,
    });
    const adsLabelId = await db.insert('labels', {
      name: 'Advertisement',
      color: 'bg-purple-600',
      workspaceId: marketingWorkspaceId,
    });
    console.log('Created labels.');

    // --- Link Labels to Tasks ---
    await db.insert('taskLabels', {
      taskId: marketingStrategyTask,
      labelId: analyticsLabelId,
    });
    await db.insert('taskLabels', {
      taskId: comprehensiveTask,
      labelId: designLabelId,
    });
    await db.insert('taskLabels', {
      taskId: comprehensiveTask,
      labelId: seoLabelId,
    });
    await db.insert('taskLabels', {
      taskId: labelOnlyTask,
      labelId: seoLabelId,
    });
    console.log('Linked labels to tasks.');

    console.log('Demo data seeding completed.');
    return { success: true };
  },
});
