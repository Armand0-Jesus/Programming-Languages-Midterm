const CV_DATA_PATH = "data/cv.json";

const SECTION_LABELS = {
  summary: "Summary",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Communication",
  volunteer: "Volunteer Work",
  awards: "Awards",
  references: "References",
};

let cvData = null;
let isCvBusy = false;

function getElement(id) {
  return document.querySelector(`#${id}`);
}

function showCvFeedback(message, isError = false) {
  const feedback = getElement("cv-feedback");
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.classList.toggle("is-error", isError);
}

function setCvActionButtonsDisabled(disabled) {
  const reloadButton = getElement("cv-reload-btn");
  const downloadButton = getElement("cv-download-btn");

  if (reloadButton) {
    reloadButton.disabled = disabled;
  }

  if (downloadButton) {
    downloadButton.disabled = disabled;
  }
}

function setCvBusyState(isBusy) {
  isCvBusy = isBusy;
  setCvActionButtonsDisabled(isBusy);
}

async function loadCvData() {
  const response = await fetch(CV_DATA_PATH);
  if (!response.ok) {
    throw new Error("Could not load data/cv.json.");
  }

  return response.json();
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function toSectionLabel(key) {
  return SECTION_LABELS[key] || key;
}

function isCategoryEnabled(category) {
  return category?.enabled !== false;
}

function getItems(category) {
  if (!Array.isArray(category?.items)) {
    return [];
  }

  return category.items;
}

function getEnabledItems(category) {
  return getItems(category).filter((item) => item?.enabled !== false);
}

function getItemLabel(sectionKey, item, index) {
  if (!item || typeof item !== "object") {
    return `Entry ${index + 1}`;
  }

  if (sectionKey === "summary") {
    return item.text || `Summary ${index + 1}`;
  }

  if (sectionKey === "education") {
    const degree = item.degree || "Study";
    const institution = item.institution || "Institution";
    return `${degree} - ${institution}`;
  }

  if (sectionKey === "experience") {
    const role = item.role || "Role";
    const organization = item.organization || "Organization";
    return `${role} - ${organization}`;
  }

  if (sectionKey === "projects") {
    return item.name || `Project ${index + 1}`;
  }

  if (sectionKey === "skills") {
    return item.name || `Skill ${index + 1}`;
  }

  if (sectionKey === "certifications") {
    return item.name || `Certification ${index + 1}`;
  }

  if (sectionKey === "languages") {
    return item.name || `Communication item ${index + 1}`;
  }

  if (sectionKey === "volunteer") {
    const role = item.role || "Role";
    const organization = item.organization || "Organization";
    return `${role} - ${organization}`;
  }

  if (sectionKey === "awards") {
    return item.title || `Award ${index + 1}`;
  }

  if (sectionKey === "references") {
    return item.name || `Reference ${index + 1}`;
  }

  return `Entry ${index + 1}`;
}

function createToggleRow(labelText, checked, onChange) {
  const label = document.createElement("label");
  label.className = "cv-toggle";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));

  const text = document.createElement("span");
  text.textContent = labelText;

  label.append(input, text);
  return label;
}

function renderCvControls() {
  const container = getElement("cv-controls");
  if (!container || !cvData) {
    return;
  }

  container.innerHTML = "";

  Object.keys(cvData).forEach((sectionKey) => {
    const sectionData = cvData[sectionKey];
    if (!sectionData || typeof sectionData !== "object") {
      return;
    }

    const card = document.createElement("article");
    card.className = "cv-control-card";

    const title = document.createElement("h4");
    title.textContent = toSectionLabel(sectionKey);
    card.appendChild(title);

    const sectionToggle = createToggleRow("Show section", isCategoryEnabled(sectionData), (checked) => {
      sectionData.enabled = checked;
      renderCvResume();
    });
    card.appendChild(sectionToggle);

    const items = getItems(sectionData);
    if (items.length > 0) {
      const itemList = document.createElement("div");
      itemList.className = "cv-toggle-list";

      items.forEach((item, index) => {
        if (typeof item.enabled !== "boolean") {
          item.enabled = true;
        }

        const itemToggle = createToggleRow(getItemLabel(sectionKey, item, index), item.enabled, (checked) => {
          item.enabled = checked;
          renderCvResume();
        });

        itemList.appendChild(itemToggle);
      });

      card.appendChild(itemList);
    }

    container.appendChild(card);
  });
}

function appendProfileHeader(container, profile) {
  if (!profile || !isCategoryEnabled(profile)) {
    return;
  }

  const header = document.createElement("header");
  header.className = "resume-header";

  const name = document.createElement("h2");
  name.textContent = profile.fullName || "No name";

  const headline = document.createElement("p");
  headline.className = "resume-headline";
  headline.textContent = profile.headline || "";

  const contactParts = [profile.email, profile.phone, profile.location].filter(Boolean);
  const contact = document.createElement("p");
  contact.className = "resume-contact";
  contact.textContent = contactParts.join(" | ");

  header.append(name, headline, contact);
  container.appendChild(header);
}

function formatResumeLine(sectionKey, item) {
  if (sectionKey === "summary") {
    return item.text || "";
  }

  if (sectionKey === "education") {
    return `${item.degree || ""} - ${item.institution || ""} (${item.years || ""})`.trim();
  }

  if (sectionKey === "experience") {
    return `${item.role || ""} - ${item.organization || ""} (${item.years || ""})`.trim();
  }

  if (sectionKey === "projects") {
    const details = [item.name, item.tech, item.year].filter(Boolean).join(" | ");
    return details;
  }

  if (sectionKey === "skills") {
    return [item.name, item.level].filter(Boolean).join(" - ");
  }

  if (sectionKey === "certifications") {
    return [item.name, item.issuer, item.year].filter(Boolean).join(" - ");
  }

  if (sectionKey === "languages") {
    return [item.name, item.level].filter(Boolean).join(" - ");
  }

  if (sectionKey === "volunteer") {
    return [item.role, item.organization, item.years].filter(Boolean).join(" - ");
  }

  if (sectionKey === "awards") {
    return [item.title, item.issuer, item.year].filter(Boolean).join(" - ");
  }

  if (sectionKey === "references") {
    return [item.name, item.relation, item.contact].filter(Boolean).join(" - ");
  }

  return "";
}

function appendResumeSection(container, sectionKey, sectionData) {
  if (!isCategoryEnabled(sectionData)) {
    return;
  }

  const enabledItems = getEnabledItems(sectionData);
  if (enabledItems.length === 0) {
    return;
  }

  const section = document.createElement("section");
  section.className = "resume-section";

  const title = document.createElement("h3");
  title.textContent = toSectionLabel(sectionKey);
  section.appendChild(title);

  const list = document.createElement("ul");
  list.className = "resume-list";

  enabledItems.forEach((item) => {
    const line = formatResumeLine(sectionKey, item);
    if (!line) {
      return;
    }

    const li = document.createElement("li");
    li.textContent = line;
    list.appendChild(li);
  });

  if (list.children.length > 0) {
    section.appendChild(list);
    container.appendChild(section);
  }
}

function renderCvResume() {
  const output = getElement("cv-resume-output");
  if (!output || !cvData) {
    return;
  }

  output.innerHTML = "";

  const resume = document.createElement("article");
  resume.className = "cv-resume-card";

  appendProfileHeader(resume, cvData.profile);

  Object.keys(cvData)
    .filter((key) => key !== "profile")
    .forEach((sectionKey) => {
      appendResumeSection(resume, sectionKey, cvData[sectionKey]);
    });

  if (resume.children.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "There is no active resume content to show.";
    resume.appendChild(empty);
  }

  output.appendChild(resume);
}

async function onReloadCvClick() {
  if (isCvBusy) {
    return;
  }

  setCvBusyState(true);
  showCvFeedback("Loading cv.json...");

  try {
    const loaded = await loadCvData();
    cvData = cloneJson(loaded);
    renderCvControls();
    renderCvResume();
    showCvFeedback("");
  } catch (error) {
    const message = error instanceof Error ? error.message : "CV loading error.";
    showCvFeedback(`Error: ${message}`, true);
  } finally {
    setCvBusyState(false);
  }
}

async function onDownloadPdfClick() {
  if (isCvBusy) {
    return;
  }

  const resumeNode = getElement("cv-resume-output")?.querySelector(".cv-resume-card");
  if (!resumeNode) {
    showCvFeedback("Error: there is no resume to export.", true);
    return;
  }

  if (typeof window.html2pdf !== "function") {
    showCvFeedback("Error: the PDF library is not available.", true);
    return;
  }

  setCvBusyState(true);
  showCvFeedback("Generating PDF...");

  try {
    await window
      .html2pdf()
      .set({
        margin: 10,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(resumeNode)
      .save();

    showCvFeedback("PDF generated successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate the PDF.";
    showCvFeedback(`Error: ${message}`, true);
  } finally {
    setCvBusyState(false);
  }
}

function initCvModule() {
  const reloadButton = getElement("cv-reload-btn");
  const downloadButton = getElement("cv-download-btn");

  if (!reloadButton || !downloadButton) {
    return;
  }

  reloadButton.addEventListener("click", () => {
    onReloadCvClick();
  });

  downloadButton.addEventListener("click", () => {
    onDownloadPdfClick();
  });

  onReloadCvClick();
}

initCvModule();
