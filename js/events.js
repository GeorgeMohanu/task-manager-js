import { state } from "./state.js";
import {
  taskForm,
  taskInput,
  taskStatus,
  taskPriority,
  taskCategory,
  taskDate,
  searchInput,
  sortSelect,
  priorityFilter,
  categoryFilter,
  showOverdueOnly,
  clearDoneBtn,
  clearOverdueCompletedBtn,
  deleteAllBtn,
  markAllDoneBtn,
  exportBtn,
  importInput,
  filterButtons,
  themeToggle,
} from "./dom.js";
import { saveTheme } from "./storage.js";
import { normalizeTask } from "./utils.js";
import {
  addTask,
  syncAndRender,
  markAllDone,
  clearDone,
  clearOverdueCompleted,
  deleteAllTasks,
} from "./tasks.js";
import { renderTasks } from "./render.js";

function setFilter(filter) {
  state.currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  renderTasks();
}

function exportTasks() {
  const blob = new Blob([JSON.stringify(state.tasks, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "tasks-backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importTasks(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("File JSON non valido.");
        return;
      }

      state.tasks = imported.map(normalizeTask);
      syncAndRender();
      alert("Import completato con successo.");
    } catch (error) {
      alert("Errore durante l'importazione del file.");
    }
  };

  reader.readAsText(file);
  event.target.value = "";
}

export function bindEvents() {
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nuovoTitolo = taskInput.value.trim();

    if (!nuovoTitolo) return;

    addTask({
      id: Date.now(),
      titolo: nuovoTitolo,
      stato: taskStatus.value,
      priorita: taskPriority.value,
      categoria: taskCategory.value.trim() || "Generale",
      data: taskDate.value,
      createdAt: Date.now(),
    });

    taskForm.reset();
    taskPriority.value = "media";
    taskInput.focus();
  });

  searchInput.addEventListener("input", (event) => {
    state.currentSearch = event.target.value;
    renderTasks();
  });

  sortSelect.addEventListener("change", (event) => {
    state.currentSort = event.target.value;
    renderTasks();
  });

  priorityFilter.addEventListener("change", (event) => {
    state.currentPriorityFilter = event.target.value;
    renderTasks();
  });

  categoryFilter.addEventListener("change", (event) => {
    state.currentCategoryFilter = event.target.value;
    renderTasks();
  });

  showOverdueOnly.addEventListener("change", (event) => {
    state.currentOverdueOnly = event.target.checked;
    renderTasks();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  markAllDoneBtn.addEventListener("click", markAllDone);
  clearDoneBtn.addEventListener("click", clearDone);
  clearOverdueCompletedBtn.addEventListener("click", clearOverdueCompleted);

  deleteAllBtn.addEventListener("click", () => {
    const confirmed = confirm("Sei sicuro di voler eliminare tutti i task?");

    if (!confirmed) return;
    deleteAllTasks();
  });

  exportBtn.addEventListener("click", exportTasks);
  importInput.addEventListener("change", importTasks);

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    saveTheme(document.body.classList.contains("dark") ? "dark" : "light");
  });
}
