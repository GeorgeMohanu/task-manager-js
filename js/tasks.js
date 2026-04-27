import { state } from "./state.js";
import { normalizeTask, isCompletedTaskOverdue } from "./utils.js";
import { saveTasks } from "./storage.js";
import {
  updateCategoryFilterOptions,
  updateStats,
  renderTasks,
} from "./render.js";

export function syncAndRender() {
  state.tasks = state.tasks.map(normalizeTask);
  saveTasks(state.tasks);
  updateCategoryFilterOptions();
  updateStats();
  renderTasks();
}

export function addTask(task) {
  state.tasks.push(task);
  syncAndRender();
}

export function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  syncAndRender();
}

export function duplicateTask(id) {
  const task = state.tasks.find((item) => item.id === id);

  if (!task) return;

  state.tasks.push({
    ...task,
    id: Date.now(),
    titolo: `${task.titolo} (copia)`,
    createdAt: Date.now(),
  });

  syncAndRender();
}

export function changeStatus(id) {
  state.tasks = state.tasks.map((task) => {
    if (task.id !== id) return task;
    if (task.stato === "todo") return { ...task, stato: "doing" };
    if (task.stato === "doing") return { ...task, stato: "done" };
    return { ...task, stato: "todo" };
  });

  syncAndRender();
}

export function toggleComplete(id) {
  state.tasks = state.tasks.map((task) =>
    task.id === id
      ? { ...task, stato: task.stato === "done" ? "todo" : "done" }
      : task,
  );

  syncAndRender();
}

export function startEditTask(id) {
  state.editingTaskId = id;
  renderTasks();
}

export function cancelEditTask() {
  state.editingTaskId = null;
  renderTasks();
}

export function saveEditedTask(id, updatedData) {
  if (!updatedData.titolo) return;

  state.tasks = state.tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          titolo: updatedData.titolo,
          stato: updatedData.stato,
          priorita: updatedData.priorita,
          categoria: updatedData.categoria || "Generale",
          data: updatedData.data,
        }
      : task,
  );

  state.editingTaskId = null;
  syncAndRender();
}

export function markAllDone() {
  state.tasks = state.tasks.map((task) => ({ ...task, stato: "done" }));
  syncAndRender();
}

export function clearDone() {
  state.tasks = state.tasks.filter((task) => task.stato !== "done");
  syncAndRender();
}

export function clearOverdueCompleted() {
  state.tasks = state.tasks.filter((task) => !isCompletedTaskOverdue(task));
  syncAndRender();
}

export function deleteAllTasks() {
  state.tasks = [];
  syncAndRender();
}
