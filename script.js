const STORAGE_KEY = "task_manager_ultimate_tasks";
const THEME_KEY = "task_manager_ultimate_theme";

const defaultTasks = [
  {
    id: 1,
    titolo: "Comprare il pane",
    stato: "todo",
    priorita: "media",
    categoria: "Casa",
    data: "",
    createdAt: Date.now() - 3000,
  },
  {
    id: 2,
    titolo: "Fare la spesa",
    stato: "doing",
    priorita: "alta",
    categoria: "Commissioni",
    data: "",
    createdAt: Date.now() - 2000,
  },
  {
    id: 3,
    titolo: "Cucinare",
    stato: "done",
    priorita: "bassa",
    categoria: "Casa",
    data: "",
    createdAt: Date.now() - 1000,
  },
];

let tasks = loadTasks();
let currentFilter = "all";
let currentSearch = "";
let currentSort = "newest";
let currentPriorityFilter = "all";
let currentCategoryFilter = "all";
let currentOverdueOnly = false;
let editingTaskId = null;

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskStatus = document.getElementById("task-status");
const taskPriority = document.getElementById("task-priority");
const taskCategory = document.getElementById("task-category");
const taskDate = document.getElementById("task-date");
const taskList = document.getElementById("task-list");

const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const priorityFilter = document.getElementById("priority-filter");
const categoryFilter = document.getElementById("category-filter");
const showOverdueOnly = document.getElementById("show-overdue-only");

const emptyState = document.getElementById("empty-state");
const clearDoneBtn = document.getElementById("clear-done");
const clearOverdueCompletedBtn = document.getElementById(
  "clear-overdue-completed",
);
const deleteAllBtn = document.getElementById("delete-all");
const markAllDoneBtn = document.getElementById("mark-all-done");
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("theme-toggle");

const totalTasksEl = document.getElementById("total-tasks");
const todoCountEl = document.getElementById("todo-count");
const doingCountEl = document.getElementById("doing-count");
const doneCountEl = document.getElementById("done-count");
const highPriorityCountEl = document.getElementById("high-priority-count");
const overdueCountEl = document.getElementById("overdue-count");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaultTasks;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultTasks;
  } catch (error) {
    return defaultTasks;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

function normalizeTask(task) {
  return {
    id: task.id || Date.now(),
    titolo: task.titolo || "Task senza titolo",
    stato: task.stato || "todo",
    priorita: task.priorita || "media",
    categoria: task.categoria || "Generale",
    data: task.data || "",
    createdAt: task.createdAt || Date.now(),
  };
}

function getStatusLabel(status) {
  if (status === "todo") return "Todo";
  if (status === "doing") return "Doing";
  return "Done";
}

function getPriorityOrder(priority) {
  const order = {
    alta: 1,
    media: 2,
    bassa: 3,
  };

  return order[priority] || 99;
}

function isTaskOverdue(task) {
  if (!task.data || task.stato === "done") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.data);
  return dueDate < today;
}

function isCompletedTaskOverdue(task) {
  if (!task.data || task.stato !== "done") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.data);
  return dueDate < today;
}

function formatDate(dateString) {
  if (!dateString) {
    return "Nessuna scadenza";
  }

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function updateCategoryFilterOptions() {
  const categories = [
    ...new Set(
      tasks
        .map((task) => (task.categoria || "Generale").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "it"));

  categoryFilter.innerHTML = '<option value="all">Tutte le categorie</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const exists = [...categoryFilter.options].some(
    (option) => option.value === currentCategoryFilter,
  );

  if (!exists) {
    currentCategoryFilter = "all";
  }

  categoryFilter.value = currentCategoryFilter;
}

function updateStats() {
  const total = tasks.length;
  const todo = tasks.filter((task) => task.stato === "todo").length;
  const doing = tasks.filter((task) => task.stato === "doing").length;
  const done = tasks.filter((task) => task.stato === "done").length;
  const highPriority = tasks.filter((task) => task.priorita === "alta").length;
  const overdue = tasks.filter((task) => isTaskOverdue(task)).length;

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  totalTasksEl.textContent = total;
  todoCountEl.textContent = todo;
  doingCountEl.textContent = doing;
  doneCountEl.textContent = done;
  highPriorityCountEl.textContent = highPriority;
  overdueCountEl.textContent = overdue;
  progressText.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function getFilteredTasks() {
  let filteredTasks = [...tasks];

  if (currentFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.stato === currentFilter,
    );
  }

  if (currentPriorityFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.priorita === currentPriorityFilter,
    );
  }

  if (currentCategoryFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => (task.categoria || "Generale") === currentCategoryFilter,
    );
  }

  if (currentOverdueOnly) {
    filteredTasks = filteredTasks.filter((task) => isTaskOverdue(task));
  }

  if (currentSearch.trim() !== "") {
    const keyword = currentSearch.toLowerCase();

    filteredTasks = filteredTasks.filter(
      (task) =>
        task.titolo.toLowerCase().includes(keyword) ||
        (task.categoria || "").toLowerCase().includes(keyword),
    );
  }

  switch (currentSort) {
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

function createBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

function renderTaskView(task) {
  const li = document.createElement("li");
  const overdue = isTaskOverdue(task);

  li.className = `task-item ${task.stato === "done" ? "done" : ""} ${
    overdue ? "overdue" : ""
  }`;

  const taskMain = document.createElement("div");
  taskMain.className = "task-main";

  const top = document.createElement("div");
  top.className = "task-top";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "complete-checkbox";
  checkbox.checked = task.stato === "done";
  checkbox.addEventListener("change", () => toggleComplete(task.id));

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.titolo;

  top.appendChild(checkbox);
  top.appendChild(title);

  const meta = document.createElement("div");
  meta.className = "task-meta";

  meta.appendChild(createBadge(getStatusLabel(task.stato), task.stato));
  meta.appendChild(
    createBadge(`Priorità ${task.priorita}`, `priorita-${task.priorita}`),
  );
  meta.appendChild(createBadge(task.categoria || "Generale", "category"));

  const date = document.createElement("span");
  date.className = `task-date ${overdue ? "overdue-text" : ""}`;
  date.textContent = overdue
    ? `Scaduto: ${formatDate(task.data)}`
    : `Scadenza: ${formatDate(task.data)}`;

  meta.appendChild(date);

  taskMain.appendChild(top);
  taskMain.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const statusButton = document.createElement("button");
  statusButton.className = "status-btn";
  statusButton.textContent = "🔁 Stato";
  statusButton.addEventListener("click", () => changeStatus(task.id));

  const editButton = document.createElement("button");
  editButton.className = "edit-btn";
  editButton.textContent = "✏️ Modifica";
  editButton.addEventListener("click", () => {
    editingTaskId = task.id;
    renderTasks();
  });

  const duplicateButton = document.createElement("button");
  duplicateButton.className = "duplicate-btn";
  duplicateButton.textContent = "📄 Duplica";
  duplicateButton.addEventListener("click", () => duplicateTask(task.id));

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "❌ Elimina";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  actions.appendChild(statusButton);
  actions.appendChild(editButton);
  actions.appendChild(duplicateButton);
  actions.appendChild(deleteButton);

  li.appendChild(taskMain);
  li.appendChild(actions);

  return li;
}

function renderTaskEdit(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  li.innerHTML = `
    <div class="edit-box">
      <input class="edit-input" type="text" value="${task.titolo}" maxlength="100" />
      <div class="edit-row">
        <select class="edit-status">
          <option value="todo" ${task.stato === "todo" ? "selected" : ""}>Todo</option>
          <option value="doing" ${task.stato === "doing" ? "selected" : ""}>Doing</option>
          <option value="done" ${task.stato === "done" ? "selected" : ""}>Done</option>
        </select>
        <select class="edit-priority">
          <option value="bassa" ${task.priorita === "bassa" ? "selected" : ""}>Bassa</option>
          <option value="media" ${task.priorita === "media" ? "selected" : ""}>Media</option>
          <option value="alta" ${task.priorita === "alta" ? "selected" : ""}>Alta</option>
        </select>
        <input class="edit-category" type="text" value="${task.categoria || ""}" maxlength="30" />
        <input class="edit-date" type="date" value="${task.data || ""}" />
      </div>
      <div class="edit-actions">
        <button class="save-edit-btn" type="button">💾 Salva</button>
        <button class="cancel-edit-btn" type="button">Annulla</button>
      </div>
    </div>
  `;

  const saveBtn = li.querySelector(".save-edit-btn");
  const cancelBtn = li.querySelector(".cancel-edit-btn");
  const editInput = li.querySelector(".edit-input");
  const editStatus = li.querySelector(".edit-status");
  const editPriority = li.querySelector(".edit-priority");
  const editCategory = li.querySelector(".edit-category");
  const editDate = li.querySelector(".edit-date");

  saveBtn.addEventListener("click", () => {
    const nuovoTitolo = editInput.value.trim();

    if (!nuovoTitolo) {
      return;
    }

    tasks = tasks.map((currentTask) =>
      currentTask.id === task.id
        ? {
            ...currentTask,
            titolo: nuovoTitolo,
            stato: editStatus.value,
            priorita: editPriority.value,
            categoria: editCategory.value.trim() || "Generale",
            data: editDate.value,
          }
        : currentTask,
    );

    editingTaskId = null;
    syncAndRender();
  });

  cancelBtn.addEventListener("click", () => {
    editingTaskId = null;
    renderTasks();
  });

  return li;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  emptyState.classList.toggle("hidden", filteredTasks.length > 0);

  filteredTasks.forEach((task) => {
    const li =
      editingTaskId === task.id ? renderTaskEdit(task) : renderTaskView(task);

    taskList.appendChild(li);
  });
}

function syncAndRender() {
  tasks = tasks.map(normalizeTask);
  saveTasks();
  updateCategoryFilterOptions();
  updateStats();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  syncAndRender();
}

function duplicateTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  tasks.push({
    ...task,
    id: Date.now(),
    titolo: `${task.titolo} (copia)`,
    createdAt: Date.now(),
  });

  syncAndRender();
}

function changeStatus(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    if (task.stato === "todo") return { ...task, stato: "doing" };
    if (task.stato === "doing") return { ...task, stato: "done" };

    return { ...task, stato: "todo" };
  });

  syncAndRender();
}

function toggleComplete(id) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, stato: task.stato === "done" ? "todo" : "done" }
      : task,
  );

  syncAndRender();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nuovoTitolo = taskInput.value.trim();

  if (!nuovoTitolo) {
    return;
  }

  const nuovoTask = {
    id: Date.now(),
    titolo: nuovoTitolo,
    stato: taskStatus.value,
    priorita: taskPriority.value,
    categoria: taskCategory.value.trim() || "Generale",
    data: taskDate.value,
    createdAt: Date.now(),
  };

  tasks.push(nuovoTask);

  taskForm.reset();
  taskPriority.value = "media";
  taskInput.focus();

  syncAndRender();
});

searchInput.addEventListener("input", (event) => {
  currentSearch = event.target.value;
  renderTasks();
});

sortSelect.addEventListener("change", (event) => {
  currentSort = event.target.value;
  renderTasks();
});

priorityFilter.addEventListener("change", (event) => {
  currentPriorityFilter = event.target.value;
  renderTasks();
});

categoryFilter.addEventListener("change", (event) => {
  currentCategoryFilter = event.target.value;
  renderTasks();
});

showOverdueOnly.addEventListener("change", (event) => {
  currentOverdueOnly = event.target.checked;
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

markAllDoneBtn.addEventListener("click", () => {
  tasks = tasks.map((task) => ({ ...task, stato: "done" }));
  syncAndRender();
});

clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => task.stato !== "done");
  syncAndRender();
});

clearOverdueCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !isCompletedTaskOverdue(task));
  syncAndRender();
});

deleteAllBtn.addEventListener("click", () => {
  const confirmed = confirm("Sei sicuro di voler eliminare tutti i task?");

  if (!confirmed) {
    return;
  }

  tasks = [];
  syncAndRender();
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "tasks-backup.json";
  a.click();

  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("File JSON non valido.");
        return;
      }

      tasks = imported.map(normalizeTask);
      syncAndRender();
      alert("Import completato con successo.");
    } catch (error) {
      alert("Errore durante l'importazione del file.");
    }
  };

  reader.readAsText(file);
  event.target.value = "";
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  saveTheme(document.body.classList.contains("dark") ? "dark" : "light");
});

loadTheme();
updateCategoryFilterOptions();
syncAndRender();
