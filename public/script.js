function getTaskFromStorage() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function saveTaskToStorage(taskObj) {
  const tasks = getTaskFromStorage();
  tasks.push(taskObj);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function removeTaskFromStorage(id) {
  const tasks = getTaskFromStorage().filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskInStorage(id, newText) {
  const tasks = getTaskFromStorage().map((task) =>
    task.id === id ? { ...task, text: newText } : task
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleImportantInStorage(id) {
  const tasks = getTaskFromStorage().map((task) =>
    task.id === id ? { ...task, important: !task.important } : task
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleCompletedInStorage(id){
  const tasks = getTaskFromStorage().map((task) => 
  task.id === id ? { ...task , completed: !task.completed} : task 
);
     localStorage.setItem("tasks", JSON.stringify(tasks));
}

function filterTasks() {
  const filter = document.getElementById("filterSelect").value;
  const sort = document.getElementById("sortSelect").value;
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  let tasks = getTaskFromStorage();

  // Filtering
  if (filter === "active") {
    tasks = tasks.filter((task) => !task.completed);
  } else if (filter === "done") {
    tasks = tasks.filter((task) => task.completed);
  } else if (filter === "due") {
    tasks = tasks.filter((task) => task.dueDate);
  } else if (filter === "important") {
    tasks = tasks.filter((task) => task.important);
  }

  // Sorting
  if (sort === "alphabetical") {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
  } else if (sort === "dueDate") {
    tasks.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
      return dateA - dateB;
    });
  }

  tasks.forEach((task) => createTaskElement(task));
}



function createTaskElement({ id, text, important, completed, dueDate}) {
  const task = document.createElement("div");
  task.className = `flex justify-between items-start w-full p-2 rounded-md border ${
    important ? "border-yellow-500" : "border-transparent"
  } bg-white shadow-sm`;

  // Left Section
  const leftSection = document.createElement("div");
  leftSection.className = "flex items-center w-full";

  const checkBox = document.createElement("input");
  checkBox.type = "checkbox";
  checkBox.checked = completed;
  checkBox.className =
    "w-5 h-5 rounded-full border-2 border-gray-300 text-blue-500 accent-blue-500";
  checkBox.onclick = () => {
    toggleCompletedInStorage(id);
    filterTasks();
    textEl.classList.toggle("line-through");
    textEl.classList.toggle("text-gray-400");
  };

  const textEl = document.createElement("span");
  textEl.textContent = text;
  textEl.className = `mx-6 text-lg w-full max-w-3xl ${
    important ? "font-bold text-yellow-600" : ""
  } ${completed ? "line-through text-gray-400" : ""}`;

  leftSection.appendChild(checkBox);
  leftSection.appendChild(textEl);
  task.appendChild(leftSection);

  // Right Section
  const rightSection = document.createElement("div");
  rightSection.className = "flex flex-col items-end ml-4";

  const iconRow = document.createElement("div");
  iconRow.className = "flex space-x-4";

  // Star Button
  const starBtn = document.createElement("i");
  starBtn.className = `cursor-pointer text-xl ${
    important ? "fas fa-star text-yellow-500" : "far fa-star text-gray-400"
  }`;
  starBtn.onclick = () => {
    toggleImportantInStorage(id);
    textEl.classList.toggle("font-bold");
    textEl.classList.toggle("text-yellow-600");
    task.classList.toggle("border-yellow-500");
    task.classList.toggle("border-transparent");
    starBtn.classList.toggle("fas");
    starBtn.classList.toggle("far");
    starBtn.classList.toggle("text-yellow-500");
    starBtn.classList.toggle("text-gray-400");
  };

  // Edit Button
  const editBtn = document.createElement("i");
  editBtn.className =
    "fas fa-pencil-alt text-blue-500 cursor-pointer hover:text-blue-700 text-xl";
  editBtn.onclick = () => {
  const oldText = textEl.textContent;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = oldText;
  editInput.className =
  "mx-6 text-lg w-full max-w-3xl p-1 border rounded outline-none  focus:ring-0 focus:outline-none focus:border-none";


  leftSection.replaceChild(editInput, textEl);

  const saveBtn = document.createElement("i");
  saveBtn.className =
    "fas fa-check text-green-500 cursor-pointer hover:text-green-700 text-xl";

  saveBtn.onclick = () => {
    const newText = editInput.value.trim();
    if (!newText) {
      alert("Task cannot be empty.");
      return;
    }

    updateTaskInStorage(id, newText);

    textEl.textContent = newText;
    leftSection.replaceChild(textEl, editInput);
    iconRow.replaceChild(editBtn, saveBtn);
  };

  iconRow.replaceChild(saveBtn, editBtn);
  editInput.focus();
};


  // Delete Button
  const removeBtn = document.createElement("i");
  removeBtn.className =
    "fas fa-trash-alt text-red-500 cursor-pointer hover:text-red-700 text-xl";
  removeBtn.onclick = () => {
    task.remove();
    removeTaskFromStorage(id);
  };

  iconRow.appendChild(starBtn);
  iconRow.appendChild(editBtn);
  iconRow.appendChild(removeBtn);

  rightSection.appendChild(iconRow);

  if (dueDate) {
    const dueEl = document.createElement("p");
    dueEl.textContent = `Due: ${dueDate}`;
    dueEl.className = "mt-1 text-sm text-gray-500 whitespace-nowrap";
    rightSection.appendChild(dueEl);
  }

  task.appendChild(rightSection);
  document.getElementById("taskList").appendChild(task);
}


function addTask() {
  const input = document.getElementById("addTask");
  const dueInput = document.getElementById("dueDate");
  const taskText = input.value.trim();
  const dueDate = dueInput.value;

  if (!taskText) {
    alert("Please enter a task");
    return;
  }

  const tasks = getTaskFromStorage();
  const duplicate = tasks.find(
    (task) => task.text.toLowerCase() === taskText.toLowerCase()
  );

  if (duplicate) {
    alert("Task Already added");
    input.value = "";
    dueInput.value = "";
    return;
  }

  const taskObj = {
    id: Date.now(), 
    text: taskText,
    important: false,
    completed: false,
    dueDate: dueDate || null,
  };

  saveTaskToStorage(taskObj);
  createTaskElement(taskObj);

  input.value = "";
  dueInput.value = "";
}


window.onload = () => {
  const tasks = getTaskFromStorage();
  tasks.forEach((task) => createTaskElement(task));
};

