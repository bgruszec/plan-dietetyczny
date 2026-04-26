const STORAGE_KEY = "bartek-diet-planner-v5";

const slotConfig = [
  { id: "meal1", label: "Śniadanie", category: "sniadanie" },
  { id: "meal2", label: "Obiad", category: "obiad" },
  { id: "meal3", label: "Kolacja", category: "kolacja" },
  { id: "snack", label: "Przekąska", category: "przekaska" }
];

const weekdayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

const defaultState = {
  settings: { targetKcal: 2100, theme: "dark", showAssumptions: true, showSwaps: true, showControl: true },
  planner: {}
};

const assumptions = [
  "Cel: redukcja masy ciała przy sensownym deficycie kalorycznym, bez bardzo niskokalorycznej diety.",
  "Kaloryka: większość dni ma około 2050-2100 kcal. To cel praktyczny.",
  "Posiłki: 3 większe posiłki + 1 słodka/praktyczna przekąska."
];

const swapsInfo = [
  "Wymiany produktów są dostępne przy każdym składniku jako dropdown.",
  "Dla owoców gramatury przeliczają się automatycznie.",
  "Dla ryżu/kaszy dostępny jest przelicznik na ziemniaki."
];

const controlRules = [
  "Waż się codziennie rano i patrz na średnią z 7 dni.",
  "Po 14 dniach bez spadku: -100/-150 kcal lub dodaj cardio.",
  "Przy dużym głodzie: +100/+150 kcal z dobrych źródeł."
];

const defaultPlan = {
  1: [
    { day: 1, meal1: "R1", meal2: "R2", meal3: "R3", snack: "R4", total: 2072 },
    { day: 2, meal1: "R5", meal2: "R6", meal3: "R7", snack: "R8", total: 2071 },
    { day: 3, meal1: "R9", meal2: "R10", meal3: "R11", snack: "R12", total: 2100 },
    { day: 4, meal1: "R13", meal2: "R14", meal3: "R15", snack: "R16", total: 2099 },
    { day: 5, meal1: "R17", meal2: "R18", meal3: "R19", snack: "R20", total: 2070 },
    { day: 6, meal1: "R21", meal2: "R22", meal3: "R23", snack: "R24", total: 2084 },
    { day: 7, meal1: "R25", meal2: "R26", meal3: "R27", snack: "R28", total: 2096 }
  ],
  2: [
    { day: 8, meal1: "R29", meal2: "R30", meal3: "R3", snack: "R4", total: 2082 },
    { day: 9, meal1: "R5", meal2: "R31", meal3: "R7", snack: "R8", total: 2051 },
    { day: 10, meal1: "R32", meal2: "R10", meal3: "R11", snack: "R12", total: 2100 },
    { day: 11, meal1: "R33", meal2: "R14", meal3: "R15", snack: "R16", total: 2099 },
    { day: 12, meal1: "R17", meal2: "R18", meal3: "R34", snack: "R20", total: 2100 },
    { day: 13, meal1: "R21", meal2: "R22", meal3: "R23", snack: "R24", total: 2084 },
    { day: 14, meal1: "R25", meal2: "R26", meal3: "R35", snack: "R28", total: 2096 }
  ],
  3: [
    { day: 15, meal1: "R1", meal2: "R31", meal3: "R23", snack: "R4", total: 2062 },
    { day: 16, meal1: "R21", meal2: "R18", meal3: "R19", snack: "R8", total: 2111 },
    { day: 17, meal1: "R32", meal2: "R10", meal3: "R27", snack: "R12", total: 2080 },
    { day: 18, meal1: "R13", meal2: "R30", meal3: "R3", snack: "R16", total: 2089 },
    { day: 19, meal1: "R17", meal2: "R14", meal3: "R15", snack: "R20", total: 2090 },
    { day: 20, meal1: "R5", meal2: "R22", meal3: "R11", snack: "R24", total: 2064 },
    { day: 21, meal1: "R25", meal2: "R26", meal3: "R34", snack: "R28", total: 2096 }
  ],
  4: [
    { day: 22, meal1: "R33", meal2: "R2", meal3: "R23", snack: "R4", total: 2072 },
    { day: 23, meal1: "R5", meal2: "R6", meal3: "R7", snack: "R8", total: 2071 },
    { day: 24, meal1: "R9", meal2: "R10", meal3: "R35", snack: "R12", total: 2080 },
    { day: 25, meal1: "R21", meal2: "R14", meal3: "R15", snack: "R16", total: 2099 },
    { day: 26, meal1: "R17", meal2: "R18", meal3: "R27", snack: "R20", total: 2100 },
    { day: 27, meal1: "R29", meal2: "R22", meal3: "R19", snack: "R24", total: 2064 },
    { day: 28, meal1: "R25", meal2: "R26", meal3: "R11", snack: "R28", total: 2116 }
  ]
};

// Twoje grupy zamienników
const substitutionGroups = [
  ["pomidor","ogórek","papryka","cukinia","brokuł","marchew","rzodkiewka","kapusta","seler naciowy","kalafior","szparagi","bakłażan","dynia","pieczarki"],
  ["szpinak","rukola","roszponka","sałata rzymska","miks sałat","jarmuż","sałata lodowa"],
  ["mąka jaglana","mąka gryczana","mąka żytnia","mąka ryżowa","mąka z tapioki","mąka amarantusowa","mąka orkiszowa","mąka pełnoziarnista","mąka owsiana"],
  ["płatki owsiane","płatki jaglane","płatki gryczane","płatki ryżowe","płatki orkiszowe"],
  ["ryż biały","ryż basmati","ryż brązowy","ryż dziki","komosa ryżowa","kasza gryczana","kasza jaglana","kasza pęczak","kasza bulgur","kasza owsiana","kasza jęczmienna","amarantus","makaron gryczany","makaron jaglany","makaron żytni","makaron ryżowy","makaron pełnoziarnisty","makaron orkiszowy","makaron bezglutenowy"],
  ["ziemniaki","bataty","topinambur"],
  ["chleb żytni razowy","chleb żytni na zakwasie","chleb orkiszowy","chleb pełnoziarnisty","chleb bezglutenowy","bułka owsiana","bułka grahamka","bułka pełnoziarnista"],
  ["hummus","pasty warzywne"],
  ["miód","syrop klonowy","syrop z agawy"]
];

const fruitEq = {
  "banan": 120,
  "duze jablko": 170,
  "pomarancza": 240,
  "kaki": 125,
  "mandarynki": 195,
  "brzoskwinie": 180,
  "gruszka": 170,
  "kiwi": 160,
  "maliny": 210,
  "truskawki": 280,
  "winogrona": 140,
  "grejpfrut": 220,
  "mango": 140,
  "sliwki": 210,
  "ananas": 200,
  "borowki": 175,
  "czeresnie": 160
};

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
  mobileSettingsBtn: document.getElementById("mobileSettingsBtn"),
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
let recipes = [];
let recipesById = {};
let selectedWeek = 1;
let selectedDay = 1;

init();

async function init() {
  fillSelectors();
  bindEvents();
  applySettingsToUI();

  try {
    const res = await fetch("recipes.json");
    recipes = await res.json();
  } catch {
    ui.recipesList.innerHTML = "<p>Nie udało się wczytać recipes.json</p>";
    return;
  }

  recipes = enrichRecipesWithCategories(recipes);
  recipesById = Object.fromEntries(recipes.map((r) => [r.id, r]));

  renderStaticSections();
  renderPlanTables();
  renderPlanner();
  renderRecipeCards();
}

function fillSelectors() {
  for (let w = 1; w <= 4; w++) {
    const opt = document.createElement("option");
    opt.value = String(w);
    opt.textContent = `Tydzień ${w}`;
    ui.weekSelect.appendChild(opt);
  }
  for (let d = 1; d <= 7; d++) {
    const opt = document.createElement("option");
    opt.value = String(d);
    opt.textContent = weekdayNames[d - 1];
    ui.daySelect.appendChild(opt);
  }
}

function bindEvents() {
  ui.weekSelect.addEventListener("change", () => { selectedWeek = Number(ui.weekSelect.value); renderPlanner(); });
  ui.daySelect.addEventListener("change", () => { selectedDay = Number(ui.daySelect.value); renderPlanner(); });
  ui.clearDayBtn.addEventListener("click", clearDay);
  ui.recipeSearch.addEventListener("input", renderRecipeCards);
  ui.weekFilter.addEventListener("change", renderPlanTables);

  ui.openSettingsBtn.addEventListener("click", () => ui.settingsPanel.classList.remove("hidden"));
  ui.closeSettingsBtn.addEventListener("click", () => ui.settingsPanel.classList.add("hidden"));
  ui.mobileSettingsBtn?.addEventListener("click", () => ui.settingsPanel.classList.remove("hidden"));

  ui.targetKcalInput.addEventListener("change", () => {
    state.settings.targetKcal = Number(ui.targetKcalInput.value) || 2100;
    saveState(); applySettingsToUI(); renderPlanner();
  });

  ui.themeSelect.addEventListener("change", () => {
    state.settings.theme = ui.themeSelect.value;
    saveState(); applySettingsToUI();
  });

  ui.showAssumptionsToggle.addEventListener("change", () => { state.settings.showAssumptions = ui.showAssumptionsToggle.checked; saveState(); applySettingsToUI(); });
  ui.showSwapsToggle.addEventListener("change", () => { state.settings.showSwaps = ui.showSwapsToggle.checked; saveState(); applySettingsToUI(); });
  ui.showControlToggle.addEventListener("change", () => { state.settings.showControl = ui.showControlToggle.checked; saveState(); applySettingsToUI(); });

  ui.resetAllBtn.addEventListener("click", () => {
    if (!confirm("Na pewno zresetować plan i ustawienia?")) return;
    state = JSON.parse(JSON.stringify(defaultState));
    saveState(); applySettingsToUI(); renderPlanner();
    ui.settingsPanel.classList.add("hidden");
  });

  ui.exportBtn.addEventListener("click", exportState);
  ui.importInput.addEventListener("change", importState);
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
  ui.assumptionsList.innerHTML = assumptions.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  ui.swapsList.innerHTML = swapsInfo.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  ui.controlList.innerHTML = controlRules.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
}

function clearDay() {
  const key = getDayKey(selectedWeek, selectedDay);
  state.planner[key] = { meal1: "", meal2: "", meal3: "", snack: "" };
  saveState();
  renderPlanner();
}

function renderPlanner() {
  const key = getDayKey(selectedWeek, selectedDay);
  if (!state.planner[key]) {
    const base = defaultPlan[selectedWeek]?.[selectedDay - 1];
    state.planner[key] = {
      meal1: base?.meal1 || "", meal2: base?.meal2 || "", meal3: base?.meal3 || "", snack: base?.snack || ""
    };
    saveState();
  }

  const selected = state.planner[key];

  ui.slotWrap.innerHTML = slotConfig.map((slot) => {
    const options = [
      `<option value="">-- wybierz ${slot.label.toLowerCase()} --</option>`,
      ...recipes
        .filter((r) => (r.categories || []).includes(slot.category))
        .map((r) => `<option value="${r.id}" ${selected[slot.id] === r.id ? "selected" : ""}>${escapeHtml(r.title)} (${r.kcal} kcal)</option>`)
    ].join("");

    const chosen = recipesById[selected[slot.id]];
    const chosenText = chosen ? `<a href="#recipe-${chosen.id}">${escapeHtml(chosen.title)}</a> - ${chosen.kcal} kcal` : "Brak wybranego przepisu";

    return `
      <div class="slot-card">
        <p class="slot-title">${slot.label}</p>
        <select data-slot="${slot.id}">${options}</select>
        <p class="slot-meta">${chosenText}</p>
      </div>
    `;
  }).join("");

  ui.slotWrap.querySelectorAll("select").forEach((el) => {
    el.addEventListener("change", () => {
      state.planner[key][el.dataset.slot] = el.value;
      saveState();
      renderPlanner();
    });
  });

  const dayKcal = slotConfig.reduce((sum, slot) => sum + (recipesById[selected[slot.id]]?.kcal || 0), 0);
  const diff = dayKcal - state.settings.targetKcal;
  ui.dayKcal.textContent = `Suma dnia: ${dayKcal} kcal`;
  ui.kcalDiff.textContent = diff === 0 ? "Idealnie pod cel." : diff > 0 ? `+${diff} kcal powyżej celu` : `${diff} kcal poniżej celu`;
}

function renderPlanTables() {
  const filter = ui.weekFilter.value || "all";
  const weeks = filter === "all" ? [1, 2, 3, 4] : [Number(filter)];

  ui.planTables.innerHTML = weeks.map((weekNum) => {
    const rows = defaultPlan[weekNum] || [];
    const body = rows.map((row, idx) => `
      <tr>
        <td>${weekdayNames[idx]}</td>
        <td>${recipeCell(row.meal1)}</td>
        <td>${recipeCell(row.meal2)}</td>
        <td>${recipeCell(row.meal3)}</td>
        <td>${recipeCell(row.snack)}</td>
        <td>${row.total}</td>
      </tr>
    `).join("");

    return `
      <h3 class="plan-week-title">Tydzień ${weekNum}</h3>
      <table>
        <thead>
          <tr>
            <th>Dzień tygodnia</th>
            <th>Śniadanie</th>
            <th>Obiad</th>
            <th>Kolacja</th>
            <th>Przekąska</th>
            <th>Suma kcal</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }).join("");
}

function renderRecipeCards() {
  const q = ui.recipeSearch.value.trim().toLowerCase();
  const filtered = recipes.filter((r) => `${r.id} ${r.title} ${(r.categories || []).join(" ")} ${r.ingredients.join(" ")} ${r.steps.join(" ")}`.toLowerCase().includes(q));

  ui.recipesList.innerHTML = filtered.map((r) => `
    <article class="recipe-card" id="recipe-${r.id}">
      <h3>${escapeHtml(r.title)}</h3>
      <div class="recipe-meta">
        ${r.kcal} kcal |
        ${(r.categories || []).map((c) => `<span class="recipe-badge">${formatCategory(c)}</span>`).join(" ")}
      </div>
      <details>
        <summary>Składniki</summary>
        <ul>
          ${r.ingredients.map((ing, idx) => {
            const group = findSubstitutionGroup(ing);
            if (!group) {
              return `<li class="ingredient-row"><div class="ingredient-main">${escapeHtml(ing)}</div></li>`;
            }

            const selectId = `swap-${r.id}-${idx}`;
            const infoId = `swap-info-${r.id}-${idx}`;
            return `
              <li class="ingredient-row">
                <div class="ingredient-main">${escapeHtml(ing)}</div>
                <div class="ingredient-swap">
                  <select class="swap-select" id="${selectId}" data-original="${encodeURIComponent(ing)}" data-info-id="${infoId}">
                    <option value="">Wybierz zamiennik...</option>
                    ${group.map((name) => `<option value="${encodeURIComponent(name)}">${escapeHtml(name)}</option>`).join("")}
                  </select>
                  <div id="${infoId}" class="swap-info"></div>
                </div>
              </li>
            `;
          }).join("")}
        </ul>
      </details>
      <details>
        <summary>Wykonanie</summary>
        <ul>${r.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      </details>
    </article>
  `).join("");

  ui.recipesList.querySelectorAll(".swap-select").forEach((sel) => {
    sel.addEventListener("change", () => {
      const original = decodeURIComponent(sel.dataset.original || "");
      const info = document.getElementById(sel.dataset.infoId || "");
      if (!info) return;
      if (!sel.value) { info.textContent = ""; return; }

      const target = decodeURIComponent(sel.value);
      const grams = computeConvertedGrams(original, target);
      if (grams === null) info.textContent = `Zamiana: ${target} (brak gramatury źródłowej).`;
      else if (typeof grams === "string") info.textContent = `Zamiana: ${target} -> ${grams} g`;
      else info.textContent = `Zamiana: ${target} -> ${grams} g`;
    });
  });
}

function enrichRecipesWithCategories(list) {
  const map = {};
  Object.values(defaultPlan).forEach((weekRows) => {
    weekRows.forEach((row) => {
      slotConfig.forEach((slot) => {
        const id = row[slot.id];
        if (!id) return;
        if (!map[id]) map[id] = new Set();

        // śniadanie i kolacja wymienne
        if (slot.category === "sniadanie" || slot.category === "kolacja") {
          map[id].add("sniadanie");
          map[id].add("kolacja");
        } else {
          map[id].add(slot.category);
        }
      });
    });
  });
  return list.map((r) => ({ ...r, categories: Array.from(map[r.id] || []) }));
}

function recipeCell(id) {
  const r = recipesById[id];
  return r ? `<a href="#recipe-${id}">${escapeHtml(r.title)}</a>` : id;
}
function formatCategory(c) {
  return c === "sniadanie" ? "śniadanie" : c === "obiad" ? "obiad" : c === "kolacja" ? "kolacja" : "przekąska";
}
function getDayKey(week, day) { return `${week}-${day}`; }

function normalizeText(s) {
  return s.toLowerCase()
    .replaceAll("ł", "l").replaceAll("ą", "a").replaceAll("ę", "e")
    .replaceAll("ś", "s").replaceAll("ć", "c").replaceAll("ż", "z")
    .replaceAll("ź", "z").replaceAll("ń", "n").replaceAll("ó", "o");
}
function extractGrams(text) {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  return m ? Number(m[1].replace(",", ".")) : null;
}
function findSubstitutionGroup(ingredient) {
  const n = normalizeText(ingredient);
  return substitutionGroups.find((group) => group.some((item) => n.includes(normalizeText(item)))) || null;
}
function computeConvertedGrams(originalIngredient, targetName) {
  const grams = extractGrams(originalIngredient);
  if (!grams) return null;

  const originalNorm = normalizeText(originalIngredient);
  const targetNorm = normalizeText(targetName);

  const origFruit = Object.keys(fruitEq).find((k) => originalNorm.includes(k));
  const targetFruit = Object.keys(fruitEq).find((k) => targetNorm.includes(k));
  if (origFruit && targetFruit) {
    return Math.round((grams * fruitEq[targetFruit]) / fruitEq[origFruit]);
  }

  const riceOrGroats = originalNorm.includes("ryz") || originalNorm.includes("kasza");
  const potatoFamily = targetNorm.includes("ziemniaki") || targetNorm.includes("bataty") || targetNorm.includes("topinambur");
  if (riceOrGroats && potatoFamily) {
    return `${Math.round((grams * 450) / 100)}-${Math.round((grams * 500) / 100)}`;
  }

  return Math.round(grams);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const p = JSON.parse(raw);
    return { settings: { ...defaultState.settings, ...(p.settings || {}) }, planner: p.planner || {} };
  } catch {
    return JSON.parse(JSON.stringify(defaultState));
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

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
      const p = JSON.parse(String(reader.result));
      state = { settings: { ...defaultState.settings, ...(p.settings || {}) }, planner: p.planner || {} };
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
  return String(str)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
