const CV_DATA_PATH = "modules/cv_generator/cv.json";

const SECTION_LABELS = {
  profile: "Contact Information",
  summary: "Summary",
  education: "Education",
  experience: "Experience",
  researchExperience: "Research Experience",
  projects: "Projects",
  skills: "Technical Skills",
  certifications: "Certifications",
  languages: "Languages",
  hobbies: "Hobbies and Interests",
};

const RESUME_SECTION_ORDER = [
  "summary",
  "education",
  "experience",
  "researchExperience",
  "projects",
  "skills",
  "certifications",
  "languages",
  "hobbies",
];

const ITEM_LABEL_GETTERS = {
  profile: (item) => [item.label, item.value].filter(Boolean).join(": "),
  summary: (item) => item.text,
  education: (item) => [item.degree, item.institution].filter(Boolean).join(" - "),
  experience: (item) => [item.role, item.organization].filter(Boolean).join(" - "),
  researchExperience: (item) => item.name,
  projects: (item) => item.name,
  skills: (item) => item.name,
  certifications: (item) => item.name,
  languages: (item) => item.name,
  hobbies: (item) => item.name,
};

const ENTRY_PRESENTERS = {
  education: (item) => ({
    title: item.institution,
    date: item.years,
    subtitle: item.degree,
    meta: item.location,
    highlights: item.highlights,
  }),
  experience: (item) => ({
    title: item.role,
    date: item.years,
    subtitle: item.organization,
    meta: item.location,
    highlights: item.highlights,
  }),
  researchExperience: (item) => ({
    title: item.name,
    date: item.years,
    subtitle: item.tech,
    meta: item.location,
    highlights: item.highlights,
  }),
  projects: (item) => ({
    title: item.name,
    date: item.year,
    subtitle: item.tech,
    highlights: item.highlights,
  }),
  certifications: (item) => ({
    title: item.name,
    date: item.year,
    subtitle: item.issuer,
  }),
};

let cvData = null;
let isCvBusy = false;

function getElement(id) {
  return document.querySelector(`#${id}`);
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (typeof text === "string") {
    element.textContent = text;
  }

  return element;
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
  const downloadButton = getElement("cv-download-btn");
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
    throw new Error("Could not load cv.json.");
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
  return Array.isArray(category?.items) ? category.items : [];
}

function getEnabledItems(category) {
  return getItems(category).filter((item) => item?.enabled !== false);
}

function getItemLabel(sectionKey, item, index) {
  const label = ITEM_LABEL_GETTERS[sectionKey]?.(item);
  return label || `Entry ${index + 1}`;
}

function createToggleRow(labelText, checked, onChange) {
  const label = createElement("label", "cv-toggle");
  const input = createElement("input");
  const text = createElement("span", "", labelText);

  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));

  label.append(input, text);
  return label;
}

function renderCvControls() {
  const container = getElement("cv-controls");
  if (!container || !cvData) {
    return;
  }

  container.innerHTML = "";

  Object.entries(cvData).forEach(([sectionKey, sectionData]) => {
    if (!sectionData || typeof sectionData !== "object") {
      return;
    }

    const card = createElement("article", "cv-control-card");
    card.appendChild(createElement("h4", "", toSectionLabel(sectionKey)));

    const items = getItems(sectionData);
    if (sectionKey === "summary" && items.length === 1) {
      const summaryItem = items[0];
      card.appendChild(
        createToggleRow(
          "Show summary",
          isCategoryEnabled(sectionData) && summaryItem.enabled !== false,
          (checked) => {
            sectionData.enabled = checked;
            summaryItem.enabled = checked;
            renderCvResume();
          },
        ),
      );
      container.appendChild(card);
      return;
    }

    card.appendChild(
      createToggleRow("Show section", isCategoryEnabled(sectionData), (checked) => {
        sectionData.enabled = checked;
        renderCvResume();
      }),
    );

    if (items.length > 0) {
      const itemList = createElement("div", "cv-toggle-list");

      items.forEach((item, index) => {
        if (typeof item.enabled !== "boolean") {
          item.enabled = true;
        }

        itemList.appendChild(
          createToggleRow(getItemLabel(sectionKey, item, index), item.enabled, (checked) => {
            item.enabled = checked;
            renderCvResume();
          }),
        );
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

  const header = createElement("header", "resume-header");
  header.appendChild(createElement("h2", "", profile.fullName || "No name"));

  const contactItems = getEnabledItems(profile).filter((item) => item.value);
  if (contactItems.length > 0) {
    const contact = createElement("div", "resume-contact");

    contactItems.forEach((item, index) => {
      if (index > 0) {
        contact.appendChild(createElement("span", "resume-contact-separator", "|"));
      }

      if (item.href) {
        const link = createElement("a", "", item.value);
        link.href = item.href;

        if (item.href.startsWith("http")) {
          link.target = "_blank";
          link.rel = "noreferrer";
        }

        contact.appendChild(link);
      } else {
        contact.appendChild(createElement("span", "", item.value));
      }
    });

    header.appendChild(contact);
  }

  container.appendChild(header);
}

function appendHighlights(entry, highlights) {
  if (!Array.isArray(highlights) || highlights.length === 0) {
    return;
  }

  const list = createElement("ul", "resume-bullets");
  highlights.filter(Boolean).forEach((highlight) => {
    list.appendChild(createElement("li", "", highlight));
  });

  if (list.children.length > 0) {
    entry.appendChild(list);
  }
}

function appendDetailedEntries(section, items, sectionKey) {
  const presenter = ENTRY_PRESENTERS[sectionKey];
  if (!presenter) {
    return;
  }

  items.forEach((item) => {
    const view = presenter(item);
    if (!view.title) {
      return;
    }

    const entry = createElement("article", "resume-entry");
    const heading = createElement("div", "resume-entry-heading");
    heading.appendChild(createElement("h4", "resume-entry-title", view.title));

    if (view.date) {
      heading.appendChild(createElement("span", "resume-entry-date", view.date));
    }

    entry.appendChild(heading);

    if (view.subtitle || view.meta) {
      const subline = createElement("div", "resume-entry-subline");

      if (view.subtitle) {
        subline.appendChild(createElement("span", "resume-entry-subtitle", view.subtitle));
      }

      if (view.meta) {
        subline.appendChild(createElement("span", "resume-entry-meta", view.meta));
      }

      entry.appendChild(subline);
    }

    appendHighlights(entry, view.highlights);
    section.appendChild(entry);
  });
}

function appendSummaryItems(section, items) {
  items.forEach((item) => {
    if (item.text) {
      section.appendChild(createElement("p", "resume-summary", item.text));
    }
  });
}

function appendSkillItems(section, items) {
  items.forEach((item) => {
    const values = Array.isArray(item.values) ? item.values.filter(Boolean).join(", ") : item.value;
    if (!item.name || !values) {
      return;
    }

    const row = createElement("p", "resume-skill-row");
    row.appendChild(createElement("strong", "", `${item.name}: `));
    row.appendChild(document.createTextNode(values));
    section.appendChild(row);
  });
}

function appendInlineItems(section, labels) {
  const list = createElement("p", "resume-inline-list");

  labels.filter(Boolean).forEach((label, index) => {
    if (index > 0) {
      list.appendChild(createElement("span", "resume-inline-separator", "|"));
    }

    list.appendChild(createElement("span", "", label));
  });

  if (list.children.length > 0) {
    section.appendChild(list);
  }
}

function appendLanguageItems(section, items) {
  appendInlineItems(
    section,
    items.map((item) => [item.name, item.level].filter(Boolean).join(": ")),
  );
}

function appendHobbyItems(section, items) {
  appendInlineItems(
    section,
    items.map((item) => item.name),
  );
}

const SECTION_RENDERERS = {
  summary: appendSummaryItems,
  skills: appendSkillItems,
  languages: appendLanguageItems,
  hobbies: appendHobbyItems,
};

function appendResumeSection(container, sectionKey, sectionData) {
  if (!isCategoryEnabled(sectionData)) {
    return;
  }

  const enabledItems = getEnabledItems(sectionData);
  if (enabledItems.length === 0) {
    return;
  }

  const section = createElement("section", "resume-section");
  section.appendChild(createElement("h3", "", toSectionLabel(sectionKey)));

  const renderer = SECTION_RENDERERS[sectionKey];
  if (renderer) {
    renderer(section, enabledItems);
  } else {
    appendDetailedEntries(section, enabledItems, sectionKey);
  }

  if (section.children.length > 1) {
    container.appendChild(section);
  }
}

function renderCvResume() {
  const output = getElement("cv-resume-output");
  if (!output || !cvData) {
    return;
  }

  output.innerHTML = "";

  const resume = createElement("article", "cv-resume-card");
  appendProfileHeader(resume, cvData.profile);

  RESUME_SECTION_ORDER.forEach((sectionKey) => {
    if (cvData[sectionKey]) {
      appendResumeSection(resume, sectionKey, cvData[sectionKey]);
    }
  });

  if (resume.children.length === 0) {
    resume.appendChild(createElement("p", "resume-empty", "There is no active resume content to show."));
  }

  output.appendChild(resume);
}

async function initializeCv() {
  if (isCvBusy) {
    return;
  }

  setCvBusyState(true);
  showCvFeedback("Loading cv.json...");

  try {
    cvData = cloneJson(await loadCvData());
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

function createPdfStage(resumeNode) {
  const stage = createElement("div", "resume-pdf-stage");
  const clone = resumeNode.cloneNode(true);
  clone.classList.add("is-pdf-export");
  stage.appendChild(clone);
  document.body.appendChild(stage);

  return { stage, clone };
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
  const { stage, clone } = createPdfStage(resumeNode);

  try {
    await window
      .html2pdf()
      .set({
        margin: 0,
        filename: "Armando-Rodriguez-Resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".resume-entry", ".resume-skill-row"],
        },
      })
      .from(clone)
      .save();

    showCvFeedback("PDF generated successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate the PDF.";
    showCvFeedback(`Error: ${message}`, true);
  } finally {
    stage.remove();
    setCvBusyState(false);
  }
}

function initCvModule() {
  const downloadButton = getElement("cv-download-btn");

  if (!downloadButton) {
    return;
  }

  downloadButton.addEventListener("click", onDownloadPdfClick);
  initializeCv();
}

initCvModule();
