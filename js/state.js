import { loadTasks } from "./storage.js";

export const state = {
  tasks: loadTasks(),
  currentFilter: "all",
  currentSearch: "",
  currentSort: "newest",
  currentPriorityFilter: "all",
  currentCategoryFilter: "all",
  currentOverdueOnly: false,
  editingTaskId: null,
};
