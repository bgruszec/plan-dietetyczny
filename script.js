const STORAGE_KEY = "bartek-diet-planner-v1";

const defaultState = {
  settings: {
    targetKcal: 2100,
    theme: "dark",
    showAssumptions: true,
    showSwaps: true,
    showControl: true
  },
  planner: {} // key: "week-day" => { meal1: "R1", meal2: "R2", meal3: "R3", snack: "R4" }
};

const slotConfig = [
  { id: "meal1", label: "Posiłek 1" },
  { id: "meal2", label: "Posiłek 2" },
  { id: "meal3", label: "Posiłek 3" },
  { id: "snack", label: "Przekąska" }
];

const ui = {
  heroKcal: document.getElementById("heroKcal"),
  weekSelect: document.getElementById("weekSelect"),
  daySelect: document.getElementById("daySelect"),
  slotWrap: document.getElementById("slotWrap"),
  dayKcal: document.getElementById("dayKcal"),
  kcalDiff: document.getElementById("kcalDiff"),
  clearDayBtn: document.getElementById("clearDayBtn"),
  recipeSearch: document.getElementById("recipeSearch"),
  recipesList: document.getElementById("recipesList"),
  assumptionsList: document.getElementById("assumptionsList"),
  swapsList: document.getElementById("swapsList"),
  controlList: document.getElementById("controlList"),
  weekFilter: document.getElementById("weekFilter"),
  planTables: document.getElementById("planTables"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  settingsPanel: document.getElementById("settingsPanel"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  targetKcalInput: document.getElementById("targetKcalInput"),
  themeSelect: document.getElementById("themeSelect"),
  showAssumptionsToggle: document.getElementById("showAssumptionsToggle"),
  showSwapsToggle: document.getElementById("showSwapsToggle"),
  showControlToggle: document.getElementById("showControlToggle"),
  resetAllBtn: document.getElementById("resetAllBtn"),
  assumptionsSection: document.getElementById("assumptions"),
  swapsSection: document.getElementById("swaps"),
  controlSection: document.getElementById("control")
};

let state = loadState();
let data = {
  assumptions: [],
  swaps: [],
  control: [],
  recipes: [],
  weeks: {}
};

let selectedWeek = 1;
let selectedDay = 1;

init();

async function init() {
  for (let w = 1; w <= 4; w++) {
    const opt = document.createElement("option");
    opt.value = String(w);
    opt.textContent = `Tydzień ${w}`;
    ui.weekSelect.appendChild(opt);
  }
  for (let d = 1; d <= 7; d++) {
    const opt = document.createElement("option");
    opt.value = String(d);
    opt.textContent = `Dzień ${d}`;
    ui.daySelect.appendChild(opt);
  }

  ui.weekSelect.value = String(selectedWeek);
  ui.daySelect.value = String(selectedDay);

  bindEvents();
  applySettingsToUI();

  const mdText = await fetch("plan_diety_cursor.md").then((r) => r.text());
  data = parsePlanMarkdown(mdText);

  renderStaticSections();
  renderPlanTables();
  renderPlanner();
  renderRecipeCards();
}

function bindEvents() {
  ui.weekSelect.addEventListener("change", () => {
    selectedWeek = Number(ui.weekSelect.value);
    renderPlanner();
  });

  ui.daySelect.addEventListener("change", () => {
    selectedDay = Number(ui.daySelect.value);
    renderPlanner();
  });

  ui.clearDayBtn.addEventListener("click", () => {
    const key = getDayKey(selectedWeek, selectedDay);
    state.planner[key] = { meal1: "", meal2: "", meal3: "", snack: "" };
    saveState();
    renderPlanner();
  });

  ui.recipeSearch.addEventListener("input", renderRecipeCards);
  ui.weekFilter.addEventListener("change", renderPlanTables);

  ui.exportBtn.addEventListener("click", exportState);
  ui.importInput.addEventListener("change", importState);

  ui.openSettingsBtn.addEventListener("click", () => ui.settingsPanel.classList.remove("hidden"));
  ui.closeSettingsBtn.addEventListener("click", () => ui.settingsPanel.classList.add("hidden"));

  ui.targetKcalInput.addEventListener("change", () => {
    state.settings.targetKcal = Number(ui.targetKcalInput.value) || 2100;
    saveState();
    applySettingsToUI();
    renderPlanner();
  });

  ui.themeSelect.addEventListener("change", () => {
    state.settings.theme = ui.themeSelect.value;
    saveState();
    applySettingsToUI();
  });

  ui.showAssumptionsToggle.addEventListener("change", () => {
    state.settings.showAssumptions = ui.showAssumptionsToggle.checked;
    saveState();
    applySettingsToUI();
  });
  ui.showSwapsToggle.addEventListener("change", () => {
    state.settings.showSwaps = ui.showSwapsToggle.checked;
    saveState();
    applySettingsToUI();
  });
  ui.showControlToggle.addEventListener("change", () => {
    state.settings.showControl = ui.showControlToggle.checked;
    saveState();
    applySettingsToUI();
  });

  ui.resetAllBtn.addEventListener("click", () => {
    if (!confirm("Na pewno zresetować plan i ustawienia?")) return;
    state = JSON.parse(JSON.stringify(defaultState));
    saveState();
    applySettingsToUI();
    renderPlanner();
    ui.settingsPanel.classList.add("hidden");
  });
}

function applySettingsToUI() {
  document.body.dataset.theme = state.settings.theme;
  ui.heroKcal.textContent = `Cel: ${state.settings.targetKcal} kcal dziennie`;
  ui.targetKcalInput.value = String(state.settings.targetKcal);
  ui.themeSelect.value = state.settings.theme;
  ui.showAssumptionsToggle.checked = state.settings.showAssumptions;
  ui.showSwapsToggle.checked = state.settings.showSwaps;
  ui.showControlToggle.checked = state.settings.showControl;

  ui.assumptionsSection.style.display = state.settings.showAssumptions ? "" : "none";
  ui.swapsSection.style.display = state.settings.showSwaps ? "" : "none";
  ui.controlSection.style.display = state.settings.showControl ? "" : "none";
}

function renderStaticSections() {
  ui.assumptionsList.innerHTML = data.assumptions.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  ui.swapsList.innerHTML = data.swaps.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  ui.controlList.innerHTML = data.control.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
}

function renderPlanTables() {
  const filter = ui.weekFilter.value;
  const weeksToShow = filter === "all" ? [1, 2, 3, 4] : [Number(filter)];

  ui.planTables.innerHTML = weeksToShow.map((weekNum) => {
    const rows = data.weeks[weekNum] || [];
    const body = rows.map((r) => `
      <tr>
        <td>${r.dayLabel}</td>
        <td>${linkRecipesInCell(r.meal1)}</td>
        <td>${linkRecipesInCell(r.meal2)}</td>
        <td>${linkRecipesInCell(r.meal3)}</td>
        <td>${linkRecipesInCell(r.snack)}</td>
        <td>${r.total}</td>
      </tr>
    `).join("");

    return `
      <h3 class="plan-week-title">Tydzień ${weekNum}</h3>
      <table>
        <thead>
          <tr>
            <th>Dzień</th><th>Posiłek 1</th><th>Posiłek 2</th><th>Posiłek 3</th><th>Przekąska</th><th>Suma kcal</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }).join("");
}

function renderPlanner() {
  const key = getDayKey(selectedWeek, selectedDay);
  if (!state.planner[key]) {
    state.planner[key] = { meal1: "", meal2: "", meal3: "", snack: "" };
    saveState();
  }

  const selected = state.planner[key];
  ui.slotWrap.innerHTML = slotConfig.map((slot) => {
    const options = [
      `<option value="">-- wybierz przepis --</option>`,
      ...data.recipes.map((r) => `<option value="${r.id}" ${selected[slot.id] === r.id ? "selected" : ""}>${r.id}. ${escapeHtml(r.title)} (${r.kcal} kcal)</option>`)
    ].join("");

    const recipe = data.recipes.find((r) => r.id === selected[slot.id]);
    return `
      <div class="slot-card">
        <p class="slot-title">${slot.label}</p>
        <select data-slot="${slot.id}">${options}</select>
        <p class="slot-meta">${recipe ? `${recipe.id}. ${escapeHtml(recipe.title)} - ${recipe.kcal} kcal` : "Brak wybranego przepisu"}</p>
      </div>
    `;
  }).join("");

  ui.slotWrap.querySelectorAll("select").forEach((sel) => {
    sel.addEventListener("change", () => {
      const slot = sel.dataset.slot;
      state.planner[key][slot] = sel.value;
      saveState();
      renderPlanner();
    });
  });

  const dayKcal = slotConfig.reduce((sum, slot) => {
    const id = selected[slot.id];
    if (!id) return sum;
    const recipe = data.recipes.find((r) => r.id === id);
    return sum + (recipe ? recipe.kcal : 0);
  }, 0);

  const diff = dayKcal - state.settings.targetKcal;
  ui.dayKcal.textContent = `Suma dnia: ${dayKcal} kcal`;
  ui.kcalDiff.textContent = diff === 0 ? "Idealnie pod cel." : (diff > 0 ? `+${diff} kcal powyżej celu` : `${diff} kcal poniżej celu`);
}

function renderRecipeCards() {
  const q = ui.recipeSearch.value.trim().toLowerCase();
  const items = data.recipes.filter((r) => {
    const text = `${r.id} ${r.title} ${r.ingredients.join(" ")} ${r.steps.join(" ")}`.toLowerCase();
    return text.includes(q);
  });

  ui.recipesList.innerHTML = items.map((r) => `
    <article class="recipe-card" id="recipe-${r.id}">
      <h3>${r.id}. ${escapeHtml(r.title)}</h3>
      <div class="recipe-meta">${r.kcal} kcal</div>
      <details>
        <summary>Składniki</summary>
        <ul>${r.ingredients.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </details>
      <details>
        <summary>Wykonanie</summary>
        <ul>${r.steps.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </details>
    </article>
  `).join("");
}

function parsePlanMarkdown(md) {
  const assumptions = pickBulletList(md, "### Założenia", "### Zamienniki");
  const swaps = pickBulletList(md, "### Zamienniki i skróty, które możesz stosować", "### Zakres tygodni");
  const control = pickBulletList(md, "## Kontrola efektów", null);

  const recipes = parseRecipes(md);
  const weeks = parseWeeks(md);

  return { assumptions, swaps, control, recipes, weeks };
}

function parseRecipes(md) {
  const headerRegex = /^### (R\d+)\.\s(.+?)\s-\sok\.\s(\d+)\skcal$/gm;
  const headers = [...md.matchAll(headerRegex)];

  return headers.map((m, idx) => {
    const id = m[1];
    const title = m[2].trim();
    const kcal = Number(m[3]);
    const start = m.index;
    const end = idx < headers.length - 1 ? headers[idx + 1].index : md.length;
    const block = md.slice(start, end);

    const ingredients = extractBulletSection(block, "**Składniki:**", "**Wykonanie:**");
    const steps = extractBulletSection(block, "**Wykonanie:**", null);

    return { id, title, kcal, ingredients, steps };
  });
}

function parseWeeks(md) {
  const out = { 1: [], 2: [], 3: [], 4: [] };

  for (let w = 1; w <= 4; w++) {
    const startMarker = `### Tydzień ${w}`;
    const endMarker = w < 4 ? `### Tydzień ${w + 1}` : "## Przepisy";
    const start = md.indexOf(startMarker);
    const end = md.indexOf(endMarker);
    if (start === -1 || end === -1) continue;
    const block = md.slice(start, end);
    const lines = block.split("\n").filter((l) => l.trim().startsWith("| Dzień"));

    out[w] = lines.map((line) => {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      return {
        dayLabel: cells[0] || "",
        meal1: cells[1] || "",
        meal2: cells[2] || "",
        meal3: cells[3] || "",
        snack: cells[4] || "",
        total: cells[5] || ""
      };
    });
  }

  return out;
}

function pickBulletList(md, startMarker, endMarker) {
  const start = md.indexOf(startMarker);
  if (start === -1) return [];
  const end = endMarker ? md.indexOf(endMarker, start) : md.length;
  const part = md.slice(start, end === -1 ? md.length : end);
  return part
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

function extractBulletSection(block, startMarker, endMarker) {
  const start = block.indexOf(startMarker);
  if (start === -1) return [];
  const end = endMarker ? block.indexOf(endMarker, start + startMarker.length) : block.length;
  const part = block.slice(start + startMarker.length, end === -1 ? block.length : end);
  return part
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

function linkRecipesInCell(text) {
  return text.replace(/(R\d+)/g, `<a href="#recipe-$1">$1</a>`);
}

function getDayKey(week, day) {
  return `${week}-${day}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed = JSON.parse(raw);
    return {
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      planner: parsed.planner || {}
    };
  } catch {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plan-bartka-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importState(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      state = {
        settings: { ...defaultState.settings, ...(parsed.settings || {}) },
        planner: parsed.planner || {}
      };
      saveState();
      applySettingsToUI();
      renderPlanner();
      alert("Import zakończony.");
    } catch {
      alert("Niepoprawny plik JSON.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
