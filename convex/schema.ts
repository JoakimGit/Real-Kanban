import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const workspacesTable = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  color: v.optional(v.string()),
});

const boardsTable = defineTable({
  workspaceId: v.id('workspaces'),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.optional(v.string()),
}).index('by_workspaceId', ['workspaceId']);

const columnsTable = defineTable({
  boardId: v.id('boards'),
  name: v.string(),
  position: v.float64(),
}).index('by_boardId', ['boardId']);

const tasksTable = defineTable({
  name: v.string(),
  columnId: v.id('columns'),
  position: v.float64(),
  priority: v.optional(
    v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical'),
    ),
  ),
  estimate: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  description: v.optional(v.string()),
  assignedTo: v.optional(v.id('users')),
  createdBy: v.string(),
}).index('by_columnId', ['columnId']);

const labelsTable = defineTable({
  name: v.string(),
  color: v.string(),
  workspaceId: v.id('workspaces'),
}).index('by_workspaceId', ['workspaceId']);

const taskLabelsTable = defineTable({
  taskId: v.id('tasks'),
  labelId: v.id('labels'),
}).index('by_taskId_labelId', ['taskId', 'labelId']);

const checklistItemsTable = defineTable({
  taskId: v.id('tasks'),
  name: v.string(),
  isComplete: v.boolean(),
  dueDate: v.optional(v.number()),
  position: v.float64(),
}).index('by_taskId', ['taskId']);

const commentsTable = defineTable({
  taskId: v.id('tasks'),
  text: v.string(),
  author: v.string(),
}).index('by_taskId', ['taskId']);

const activityLogTable = defineTable({
  taskId: v.id('tasks'),
  userId: v.id('users'),
  action: v.string(),
  details: v.optional(v.string()),
}).index('by_taskId', ['taskId']);

const notificationsTable = defineTable({
  userId: v.id('users'),
  type: v.string(),
  entityType: v.string(),
  entityId: v.string(),
  message: v.string(),
  isRead: v.boolean(),
})
  .index('by_userId', ['userId'])
  .index('by_user_read', ['userId', 'isRead'])
  .index('by_entityId', ['entityType', 'entityId']);

const usersTable = defineTable({
  clerkUser: v.any(), // this is UserJSON from @clerk/backend
  color: v.string(),
}).index('by_clerk_id', ['clerkUser.id']);

const userWorkspacesTable = defineTable({
  workspaceId: v.id('workspaces'),
  userId: v.id('users'),
}).index('by_userId_workspaceId', ['userId', 'workspaceId']);

const boardMembersTable = defineTable({
  boardId: v.id('boards'),
  userId: v.id('users'),
})
  .index('by_boardId', ['boardId'])
  .index('by_userId_boardId', ['userId', 'boardId']);

export default defineSchema({
  workspaces: workspacesTable,
  boards: boardsTable,
  columns: columnsTable,
  tasks: tasksTable,
  labels: labelsTable,
  taskLabels: taskLabelsTable,
  checklistItems: checklistItemsTable,
  comments: commentsTable,
  activityLog: activityLogTable,
  notifications: notificationsTable,
  users: usersTable,
  userWorkspaces: userWorkspacesTable,
  boardMembers: boardMembersTable,
});
