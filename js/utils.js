export function normalizeTask(task) {
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

export function getStatusLabel(status) {
  if (status === "todo") return "Todo";
  if (status === "doing") return "Doing";
  return "Done";
}

export function getPriorityOrder(priority) {
  const order = {
    alta: 1,
    media: 2,
    bassa: 3,
  };

  return order[priority] || 99;
}

export function isTaskOverdue(task) {
  if (!task.data || task.stato === "done") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.data);
  return dueDate < today;
}

export function isCompletedTaskOverdue(task) {
  if (!task.data || task.stato !== "done") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.data);
  return dueDate < today;
}

export function formatDate(dateString) {
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
