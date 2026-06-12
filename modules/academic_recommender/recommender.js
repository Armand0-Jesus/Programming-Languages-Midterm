const RULES_PATH = "modules/academic_recommender/rules.pl";

const RECOMMENDATION_MESSAGES = {
  study_for_exam: "Prioritize exam study today.",
  finish_project_milestone: "Work ahead on the important deadline.",
  practice_hard_topic: "Spend time practicing the hardest topic.",
  light_review: "Do a light review of notes or summaries.",
  plan_and_review: "Organize your weekly plan and review pending topics.",
};

const OPTIONAL_FACT_PREDICATES = [
  "exam_soon",
  "deadline_soon",
  "difficult_subject",
  "low_energy",
];

let cachedRules = "";
let isRecommendationRunning = false;

function getElement(id) {
  return document.querySelector(`#${id}`);
}

function showPrologResult(message, isError = false) {
  const result = getElement("prolog-result");
  if (!result) {
    return;
  }

  result.textContent = message;
  result.classList.toggle("is-error", isError);
}

function setRunButtonState(isBusy) {
  const runButton = getElement("prolog-run-btn");
  if (!runButton) {
    return;
  }

  runButton.disabled = isBusy;
  runButton.textContent = isBusy ? "Analyzing..." : "Recommend study plan";
}

function hasTauProlog() {
  return typeof window.pl === "object" && window.pl !== null && typeof window.pl.create === "function";
}

async function loadRules() {
  if (cachedRules !== "") {
    return cachedRules;
  }

  const response = await fetch(RULES_PATH);
  if (!response.ok) {
    throw new Error("Could not load rules.pl.");
  }

  cachedRules = await response.text();
  return cachedRules;
}

function collectFacts() {
  const facts = [];

  if (getElement("prolog-exam-soon")?.checked) {
    facts.push("exam_soon.");
  }

  if (getElement("prolog-deadline-soon")?.checked) {
    facts.push("deadline_soon.");
  }

  if (getElement("prolog-difficult-subject")?.checked) {
    facts.push("difficult_subject.");
  }

  if (getElement("prolog-low-energy")?.checked) {
    facts.push("low_energy.");
  }

  return facts;
}

function buildProgram(rules, facts) {
  const factsBlock = facts.join("\n");
  const defaultFactsBlock = OPTIONAL_FACT_PREDICATES.map(
    (predicateName) => `${predicateName} :- fail.`
  ).join("\n");

  return `${rules}\n\n${factsBlock}\n${defaultFactsBlock}\n`;
}

function consultProgram(session, programText) {
  return new Promise((resolve, reject) => {
    session.consult(programText, {
      success: () => resolve(),
      error: (error) => reject(new Error(String(error))),
    });
  });
}

function queryBestRecommendation(session) {
  return new Promise((resolve, reject) => {
    session.query("best_recommendation(Action).", {
      success: () => {
        session.answer({
          success: (answer) => {
            const formatted = session.format_answer(answer);
            const match = formatted.match(/Action\s*=\s*([a-zA-Z0-9_]+)/);
            if (!match) {
              reject(new Error("Could not read the Prolog response."));
              return;
            }

            resolve(match[1]);
          },
          fail: () => reject(new Error("No recommendation was found.")),
          error: (error) => reject(new Error(String(error))),
          limit: () => reject(new Error("The Prolog inference limit was reached.")),
        });
      },
      error: (error) => reject(new Error(String(error))),
    });
  });
}

async function runRecommendation() {
  if (isRecommendationRunning) {
    return;
  }

  isRecommendationRunning = true;
  setRunButtonState(true);
  showPrologResult("Analyzing rules...");

  try {
    if (!hasTauProlog()) {
      throw new Error("The rule engine is not available on this page.");
    }

    const rules = await loadRules();
    const facts = collectFacts();
    const program = buildProgram(rules, facts);

    const session = window.pl.create(1000);
    await consultProgram(session, program);
    const recommendationKey = await queryBestRecommendation(session);

    const message = RECOMMENDATION_MESSAGES[recommendationKey] || `Recommendation: ${recommendationKey}`;
    showPrologResult(`Final recommendation: ${message}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown rule engine error.";
    showPrologResult(`Error: ${message}`, true);
  } finally {
    isRecommendationRunning = false;
    setRunButtonState(false);
  }
}

function initPrologModule() {
  const runButton = getElement("prolog-run-btn");
  if (!runButton) {
    return;
  }

  setRunButtonState(false);

  runButton.addEventListener("click", () => {
    runRecommendation();
  });
}

initPrologModule();
