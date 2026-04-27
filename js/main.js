import { loadTheme } from "./storage.js";
import {
  updateCategoryFilterOptions,
  updateStats,
  renderTasks,
} from "./render.js";
import { bindEvents } from "./events.js";
import { syncAndRender } from "./tasks.js";

function init() {
  loadTheme();
  bindEvents();
  updateCategoryFilterOptions();
  updateStats();
  renderTasks();
  syncAndRender();
}

init();
