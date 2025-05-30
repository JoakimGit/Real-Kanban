This project is a typescript react app using react-query + convex for the database and clerk for auth. The framework is Tanstack start,
a new framework built on Tanstack Router, but with the addition of server functionality. Tailwind is used for styling, with many
components from shadcn inside the components/ui folder, mainly using radix under the hood for extra functionality.
It's a task management app, with a kanban-style board with real-time feedback and collaboration.
At the top level, we have Workspaces, which is the first thing a user must create.
Workspaces have a name and 1 or more owners, with the creator automatically becoming one.
Once a user has created a workspace, they can start creating boards under that workspace. Workspace owners can invite other users
currently signed up to a workspace. Once a workspace is created, boards can be added. Inside the board view is where you have
lists/columns, with these columns containing tasks. Clicking a task opens a side-bar modal with the task details.
Tasks and columns can be moved using dnd-kit/react for dnd functionality.
There is also a settings page for workspaces, where they can edit workspace details,
as well as manage labels for that workspace, that in the board view can be attached to tasks.
