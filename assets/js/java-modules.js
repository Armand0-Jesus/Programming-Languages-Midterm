const TASK_STORAGE_KEY = "javaTaskManager.tasks.v1";
const JAVA_TASK_BRIDGE_SCRIPT = "assets/generated/java-task-bridge.js";
const JAVA_PRIORITY_BRIDGE_SCRIPT = "assets/generated/java-priority-bridge.js";

let javaBridgeLoadPromise = null;

class JavaTaskManager {
  constructor(tasks = []) {
    this.tasks = tasks;
  }

  addTask(title) {
    const task = {
      id: createTaskId(),
      title,
    };

    this.tasks.push(task);
    return task;
  }

  deleteTask(taskId) {
    const previousLength = this.tasks.length;
    this.tasks = this.tasks.filter((item) => item.id !== taskId);
    return this.tasks.length < previousLength;
  }
}

class JavaPriorityCalculator {
  static calculateScore(urgency, difficulty, daysLeft) {
    const safeDays = Math.max(daysLeft, 1);
    return urgency * 0.5 + difficulty * 0.3 + (10 / safeDays) * 0.2;
  }

  static getPriorityLabel(score) {
    if (score >= 8) {
      return "ALTA";
    }

    if (score >= 5) {
      return "MEDIA";
    }

    return "BAJA";
  }
}

function loadOptionalScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function ensureJavaBridgesLoaded() {
  if (!javaBridgeLoadPromise) {
    javaBridgeLoadPromise = (async () => {
      await loadOptionalScript(JAVA_TASK_BRIDGE_SCRIPT);
      await loadOptionalScript(JAVA_PRIORITY_BRIDGE_SCRIPT);
    })();
  }

  return javaBridgeLoadPromise;
}

function getTaskBridge() {
  if (typeof window.JavaTaskBridge === "object" && window.JavaTaskBridge !== null) {
    return window.JavaTaskBridge;
  }
  return null;
}

function getPriorityBridge() {
  if (typeof window.JavaPriorityBridge === "object" && window.JavaPriorityBridge !== null) {
    return window.JavaPriorityBridge;
  }
  return null;
}

function createTaskId() {
  const bridge = getTaskBridge();
  if (bridge && typeof bridge.createTaskId === "function") {
    const bridgeId = bridge.createTaskId();
    if (typeof bridgeId === "string" && bridgeId.trim() !== "") {
      return bridgeId;
    }
  }

  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function normalizeTaskTitle(rawTitle) {
  const bridge = getTaskBridge();
  if (bridge && typeof bridge.normalizeTitle === "function") {
    const normalized = bridge.normalizeTitle(rawTitle ?? "");
    if (typeof normalized === "string") {
      return normalized;
    }
  }

  return (rawTitle ?? "").trim().replace(/\s+/g, " ");
}

function canAddTask(rawTitle) {
  const bridge = getTaskBridge();
  if (bridge && typeof bridge.canAddTask === "function") {
    return Boolean(bridge.canAddTask(rawTitle ?? ""));
  }

  return normalizeTaskTitle(rawTitle) !== "";
}

function getElement(id) {
  return document.querySelector(`#${id}`);
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("is-error", isError);
}

function loadStoredTasks() {
  const raw = localStorage.getItem(TASK_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => typeof item.id === "string" && typeof item.title === "string")
      .map((item) => ({
        id: item.id,
        title: item.title,
      }));
  } catch {
    return [];
  }
}

function saveStoredTasks(tasks) {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

function renderTaskList(manager, listElement) {
  listElement.innerHTML = "";

  if (manager.tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.textContent = "No hay tareas aun.";
    listElement.appendChild(empty);
    return;
  }

  manager.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";

    const main = document.createElement("div");
    main.className = "task-main";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    main.append(title);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-btn";
    deleteButton.textContent = "Eliminar";
    deleteButton.dataset.taskId = task.id;
    deleteButton.dataset.action = "delete";

    actions.append(deleteButton);
    item.append(main, actions);
    listElement.appendChild(item);
  });
}

function initJavaTaskModule() {
  const input = getElement("java-task-input");
  const addButton = getElement("java-task-add-btn");
  const list = getElement("java-task-list");
  const feedback = getElement("java-task-feedback");

  if (!input || !addButton || !list || !feedback) {
    return;
  }

  const manager = new JavaTaskManager(loadStoredTasks());
  renderTaskList(manager, list);

  const addTask = () => {
    const rawTitle = input.value;
    const normalizedTitle = normalizeTaskTitle(rawTitle);

    if (!canAddTask(rawTitle) || normalizedTitle === "") {
      showMessage(feedback, "Error: escribe una tarea antes de agregar.", true);
      return;
    }

    manager.addTask(normalizedTitle);
    saveStoredTasks(manager.tasks);
    renderTaskList(manager, list);
    input.value = "";
    showMessage(feedback, "Tarea agregada correctamente.");
  };

  addButton.addEventListener("click", addTask);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  });

  list.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    const taskId = target.dataset.taskId;

    if (action !== "delete" || !taskId) {
      return;
    }

    if (manager.deleteTask(taskId)) {
      saveStoredTasks(manager.tasks);
      renderTaskList(manager, list);
      showMessage(feedback, "Tarea eliminada.");
    }
  });

}

function parseIntegerInRange(value, fieldName, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    throw new Error(`${fieldName} debe ser un numero entero.`);
  }

  if (parsed < min || parsed > max) {
    throw new Error(`${fieldName} debe estar entre ${min} y ${max}.`);
  }

  return parsed;
}

function calculatePriorityScore(urgency, difficulty, daysLeft) {
  const bridge = getPriorityBridge();
  if (bridge && typeof bridge.calculateScore === "function") {
    const bridgeScore = Number(bridge.calculateScore(urgency, difficulty, daysLeft));
    if (Number.isFinite(bridgeScore)) {
      return bridgeScore;
    }
  }

  return JavaPriorityCalculator.calculateScore(urgency, difficulty, daysLeft);
}

function resolvePriorityLabel(score) {
  const bridge = getPriorityBridge();
  if (bridge && typeof bridge.getPriorityLabel === "function") {
    const bridgeLabel = bridge.getPriorityLabel(score);
    if (typeof bridgeLabel === "string" && bridgeLabel !== "") {
      return bridgeLabel;
    }
  }

  return JavaPriorityCalculator.getPriorityLabel(score);
}

function initJavaPriorityModule() {
  const nameInput = getElement("java-priority-name");
  const daysInput = getElement("java-priority-days");
  const urgencyInput = getElement("java-priority-urgency");
  const difficultyInput = getElement("java-priority-difficulty");
  const runButton = getElement("java-priority-run-btn");
  const result = getElement("java-priority-result");

  if (!nameInput || !daysInput || !urgencyInput || !difficultyInput || !runButton || !result) {
    return;
  }

  runButton.addEventListener("click", () => {
    try {
      const taskName = nameInput.value.trim() || "(sin nombre)";
      const daysLeft = parseIntegerInRange(daysInput.value, "Dias restantes", 1, 365);
      const urgency = parseIntegerInRange(urgencyInput.value, "Urgencia", 1, 10);
      const difficulty = parseIntegerInRange(difficultyInput.value, "Dificultad", 1, 10);

      const score = calculatePriorityScore(urgency, difficulty, daysLeft);
      const priority = resolvePriorityLabel(score);

      showMessage(result, `${taskName}: prioridad ${priority} (score ${score.toFixed(2)})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Valor invalido.";
      showMessage(result, `Error: ${message}`, true);
    }
  });
}

async function initJavaModules() {
  await ensureJavaBridgesLoaded();
  initJavaTaskModule();
  initJavaPriorityModule();
}

initJavaModules();
