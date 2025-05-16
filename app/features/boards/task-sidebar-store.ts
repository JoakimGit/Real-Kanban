import { create } from 'zustand';
import { Id } from 'convex/_generated/dataModel';

type TaskSidebarState = {
  selectedTaskId: Id<'tasks'> | null;
  setSelectedTaskId: (task: Id<'tasks'> | null) => void;
};

export const useTaskSidebarStore = create<TaskSidebarState>((set) => ({
  selectedTaskId: null,
  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),
}));
