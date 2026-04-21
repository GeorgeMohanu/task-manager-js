let tasks = [
  {
    id: 1,
    titolo: "Comprare il pane",
    stato: "todo",
  },
  {
    id: 2,
    titolo: "fare la spesa",
    stato: "doing",
  },
  {
    id: 3,
    titolo: "cucinare",
    stato: "done",
  },
];

let currentFilter = "all";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (currentFilter !== "all") {
    filteredTasks = tasks.filter((task) => task.stato === currentFilter);
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = `${task.titolo} - (${task.stato})`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";

    deleteButton.addEventListener("click", function () {
      deleteTask(task.id);
    });

    const statusButton = document.createElement("button");
    statusButton.textContent = "🔁";

    statusButton.addEventListener("click", function () {
      changeStatus(task.id);
    });

    li.appendChild(span);
    li.appendChild(deleteButton);
    li.appendChild(statusButton);

    taskList.appendChild(li);
  });
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  renderTasks();
}

function changeStatus(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      if (task.stato === "todo") return { ...task, stato: "doing" };
      if (task.stato === "doing") return { ...task, stato: "done" };
      if (task.stato === "done") return { ...task, stato: "todo" };
    }
    return task;
  });

  renderTasks();
}

function filterTasks(filter) {
  currentFilter = filter;
  renderTasks();
}

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const nuovoTitolo = taskInput.value.trim();

  if (nuovoTitolo === "") {
    return;
  }

  const nuovoTask = {
    id: tasks.length + 1,
    titolo: nuovoTitolo,
    stato: "todo",
  };

  tasks.push(nuovoTask);
  renderTasks();
  taskInput.value = "";
});

renderTasks();
