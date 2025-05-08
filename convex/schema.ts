import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const workspacesTable = defineTable({
  name: v.string(),
});

const boardsTable = defineTable({
  workspaceId: v.id('workspaces'),
  name: v.string(),
  color: v.optional(v.string()),
}).index('by_workspaceId', ['workspaceId']);

const columnsTable = defineTable({
  boardId: v.id('boards'),
  name: v.string(),
  position: v.number(),
})
  .index('by_boardId', ['boardId'])
  .index('by_board_position', ['boardId', 'position']);

const cardsTable = defineTable({
  title: v.string(),
  columnId: v.id('columns'),
  position: v.number(),
  estimate: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  description: v.optional(v.string()),
  createdBy: v.string(),
}).index('by_columnId', ['columnId']);

const labelsTable = defineTable({
  title: v.string(),
  color: v.string(),
  workspaceId: v.id('workspaces'),
}).index('by_workspaceId', ['workspaceId']);

const cardAssignmentsTable = defineTable({
  cardId: v.id('cards'),
  userId: v.id('users'),
})
  .index('by_cardId', ['cardId'])
  .index('by_userId', ['userId']);

const cardLabelsTable = defineTable({
  cardId: v.id('cards'),
  labelId: v.id('labels'),
})
  .index('by_cardId', ['cardId'])
  .index('by_labelId', ['labelId']);

const tasksTable = defineTable({
  cardId: v.id('cards'),
  title: v.string(),
  isComplete: v.boolean(),
  dueDate: v.optional(v.number()),
  position: v.number(),
})
  .index('by_cardId', ['cardId'])
  .index('by_card_position', ['cardId', 'position']);

const commentsTable = defineTable({
  cardId: v.id('cards'),
  text: v.string(),
  author: v.string(),
}).index('by_cardId', ['cardId']);

const activityLogTable = defineTable({
  cardId: v.id('cards'),
  userId: v.id('users'),
  action: v.string(),
  details: v.optional(v.string()),
}).index('by_cardId', ['cardId']);

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
  .index('by_userId', ['userId']);

export default defineSchema({
  workspaces: workspacesTable,
  boards: boardsTable,
  columns: columnsTable,
  cards: cardsTable,
  labels: labelsTable,
  cardAssignments: cardAssignmentsTable,
  cardLabels: cardLabelsTable,
  tasks: tasksTable,
  comments: commentsTable,
  activityLog: activityLogTable,
  notifications: notificationsTable,
  users: usersTable,
  userWorkspaces: userWorkspacesTable,
  boardMembers: boardMembersTable,
});
