function getElement(id) {
  return document.querySelector(`#${id}`);
}

let elmBudgetInitialized = false;

function showElmStatus(message, isError = false) {
  const status = getElement("elm-budget-status");
  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function initElmBudgetModule() {
  const mountNode = getElement("elm-budget-root");
  if (!mountNode || elmBudgetInitialized) {
    return;
  }

  const elmGlobal = window.Elm;
  if (!elmGlobal || !elmGlobal.Main || typeof elmGlobal.Main.init !== "function") {
    showElmStatus(
      "Error: elm_budget.js was not found. Build the tracker to activate this tool.",
      true
    );
    return;
  }

  try {
    elmGlobal.Main.init({ node: mountNode });
    elmBudgetInitialized = true;
    showElmStatus("");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown tracker initialization error.";
    showElmStatus(`Error: ${message}`, true);
  }
}

initElmBudgetModule();
