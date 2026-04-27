import { state } from "./state.js";
import {
  taskList,
  emptyState,
  categoryFilter,
  totalTasksEl,
  todoCountEl,
  doingCountEl,
  doneCountEl,
  highPriorityCountEl,
  overdueCountEl,
  progressText,
  progressFill,
} from "./dom.js";
import { getStatusLabel, formatDate, isTaskOverdue } from "./utils.js";
import { getFilteredTasks } from "./filters.js";
import {
  toggleComplete,
  changeStatus,
  deleteTask,
  duplicateTask,
  saveEditedTask,
  cancelEditTask,
  startEditTask,
} from "./tasks.js";

function createBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

export function updateCategoryFilterOptions() {
  const categories = [
    ...new Set(
      state.tasks
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
    (option) => option.value === state.currentCategoryFilter,
  );

  if (!exists) {
    state.currentCategoryFilter = "all";
  }

  categoryFilter.value = state.currentCategoryFilter;
}

export function updateStats() {
  const total = state.tasks.length;
  const todo = state.tasks.filter((task) => task.stato === "todo").length;
  const doing = state.tasks.filter((task) => task.stato === "doing").length;
  const done = state.tasks.filter((task) => task.stato === "done").length;
  const highPriority = state.tasks.filter(
    (task) => task.priorita === "alta",
  ).length;
  const overdue = state.tasks.filter((task) => isTaskOverdue(task)).length;

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
  editButton.addEventListener("click", () => startEditTask(task.id));

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
    saveEditedTask(task.id, {
      titolo: editInput.value.trim(),
      stato: editStatus.value,
      priorita: editPriority.value,
      categoria: editCategory.value.trim(),
      data: editDate.value,
    });
  });

  cancelBtn.addEventListener("click", cancelEditTask);

  return li;
}

export function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  emptyState.classList.toggle("hidden", filteredTasks.length > 0);

  filteredTasks.forEach((task) => {
    const li =
      state.editingTaskId === task.id
        ? renderTaskEdit(task)
        : renderTaskView(task);

    taskList.appendChild(li);
  });
}
