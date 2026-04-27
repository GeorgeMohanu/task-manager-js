import { state } from "./state.js";
import { getPriorityOrder, isTaskOverdue } from "./utils.js";

export function getFilteredTasks() {
  let filteredTasks = [...state.tasks];

  if (state.currentFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.stato === state.currentFilter,
    );
  }

  if (state.currentPriorityFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.priorita === state.currentPriorityFilter,
    );
  }

  if (state.currentCategoryFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => (task.categoria || "Generale") === state.currentCategoryFilter,
    );
  }

  if (state.currentOverdueOnly) {
    filteredTasks = filteredTasks.filter((task) => isTaskOverdue(task));
  }

  if (state.currentSearch.trim() !== "") {
    const keyword = state.currentSearch.toLowerCase();

    filteredTasks = filteredTasks.filter(
      (task) =>
        task.titolo.toLowerCase().includes(keyword) ||
        (task.categoria || "").toLowerCase().includes(keyword),
    );
  }

  switch (state.currentSort) {
    case "oldest":
      filteredTasks.sort((a, b) => a.createdAt - b.createdAt);
      break;

    case "alphabetical":
      filteredTasks.sort((a, b) => a.titolo.localeCompare(b.titolo, "it"));
      break;

    case "status": {
      const order = { todo: 1, doing: 2, done: 3 };
      filteredTasks.sort((a, b) => order[a.stato] - order[b.stato]);
      break;
    }

    case "priority":
      filteredTasks.sort(
        (a, b) => getPriorityOrder(a.priorita) - getPriorityOrder(b.priorita),
      );
      break;

    case "deadline":
      filteredTasks.sort((a, b) => {
        if (!a.data && !b.data) return 0;
        if (!a.data) return 1;
        if (!b.data) return -1;
        return new Date(a.data) - new Date(b.data);
      });
      break;

    case "newest":
    default:
      filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return filteredTasks;
}
