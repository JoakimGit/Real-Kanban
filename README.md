# Task Management App with real-time kanban

## Rough outline for stuff to implement

1. ### Project setup

- [x] initialize project from Convex Tanstack Start template /w Clerk
- [x] setup convex db schema
- [x] create main layout with header, sidebar and main section
- [x] setup clerk webhook for adding user to our own convex db
- [x] figure out theming/dark mode

2. ### Workspaces and boards

- [x] create mutations for workspaces/boards
- [x] update sidebar ui with buttons to call mutations
- [x] create query for real data and replace hardcoded sidebar
- [x] create list view for workspaces and boards
- [x] add description and color to workspace/board create/update
- [x] reuse create workspace/board functionality for create button in list views

3. ### Board columns and tasks

- [x] create board view with columns/tasks
- [x] modal for updating task with all its properties, including checklist items
- [x] implement drag & drop
- [x] various actions (copy task, move task, create col/task/checklistitem, deletes, etc.)

4. ### Secondary features

- [x] filter bar in board view
- [x] settings pages for workspace
- [x] add user management (inviting users to workspace, authorization check in convex endpoints. Auth checks in client)
- [x] add task comments

5. ### Bonus features

- [ ] add notifications
- [ ] add activity log to tasks
- [ ] add file upload for task attachments
- [ ] conflict resolution for 2 users updating same entity at same time (automatic + manual)
- [ ] user settings
- [ ] global search in header

6. ### Polish

- [ ] make responsive for mobile
- [ ] better error handling?
- [ ] logging/metrics?
- [ ] overall ui polishing

7. ### Deployment

- [ ] deploy Tanstack app to netlify
- [ ] deploy convex to production

### Other thoughts

- Optimistic mutations (checklistItem toggle, ..)
- Checklistitems dnd
- Archive tasks + bring back archived tasks
- Initial onboarding flow
- initiate fetches earlier in loader
- useSuspenseQuery
- custom fields on task?
