export const STORAGE_KEY = "task_manager-ultimate_task";
export const THEME_KEY = "task-manager-ultimate_theme";
export const defaultTasks = [
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
