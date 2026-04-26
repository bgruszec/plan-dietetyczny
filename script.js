const APP_KEY = "diet-app-v3";
const ACTIVE_PROFILE_KEY = "diet-active-profile";

const slotConfig = [
  { id: "meal1", label: "Śniadanie", category: "sniadanie" },
  { id: "meal2", label: "Obiad", category: "obiad" },
  { id: "meal3", label: "Kolacja", category: "kolacja" },
  { id: "snack", label: "Przekąska", category: "przekaska" }
];

const weekdayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

const substitutionGroups = [
  ["pomidor","ogórek","papryka","cukinia","brokuł","marchew","rzodkiewka","kapusta","seler naciowy","kalafior","szparagi","bakłażan","dynia","pieczarki"],
  ["szpinak","rukola","roszponka","sałata rzymska","miks sałat","jarmuż","sałata lodowa"],
  ["mąka jaglana","mąka gryczana","mąka żytnia typ 2000","mąka ryżowa","mąka z tapioki","mąka amarantusowa","mąka orkiszowa","mąka pełnoziarnista","mąka owsiana"],
  ["płatki owsiane","płatki jaglane","płatki gryczane","płatki ryżowe","płatki orkiszowe"],
  ["ryż biały","ryż basmati","ryż brązowy","ryż dziki","komosa ryżowa","kasza gryczana","kasza jaglana","kasza pęczak","kasza bulgur","kasza owsiana","kasza jęczmienna","amarantus","makaron gryczany","makaron jaglany","makaron żytni","makaron ryżowy","makaron pełnoziarnisty","makaron orkiszowy","makaron bezglutenowy"],
  ["ziemniaki","bataty","topinambur"],
  ["chleb żytni razowy","chleb żytni na zakwasie","chleb orkiszowy","chleb pełnoziarnisty","chleb bezglutenowy","bułka owsiana","bułka grahamka","bułka pełnoziarnista"],
  ["hummus","pasty warzywne"],
  ["miód","syrop klonowy","syrop z agawy"]
];

const fruitEq = {
  banan: 120,
  duze_jablko: 170,
  pomarancza: 240,
  kaki: 125,
  mandarynki: 195,
  brzoskwinie: 180,
  gruszka: 170,
  kiwi: 160,
  maliny: 210,
  truskawki: 280,
  winogrona: 140,
  grejpfrut: 220,
  mango: 140,
  sliwki: 210,
  ananas: 200,
  borowki: 175,
  czeresnie: 160
};

const ingredientAliases = {
  banan: ["banan", "banana", "banany", "bananem"],
  duze_jablko: ["jablko", "jablka", "jablkiem"],
  pomarancza: ["pomarancza", "pomaranczy", "pomarancze"],
  gruszka: ["gruszka", "gruszki", "gruszke"],
  maliny: ["maliny", "malina", "malin"],
  truskawki: ["truskawki", "truskawka", "truskawek"],
  borowki: ["borowki", "borowka", "jagody", "jagoda"],
  winogrona: ["winogrona", "winogron"],
  mango: ["mango"],
  kiwi: ["kiwi"],
  ananas: ["ananas", "ananasa"],
  czeresnie: ["czeresnie", "czereśnie"],
  sliwki: ["sliwki", "śliwki"],
  grejpfrut: ["grejpfrut", "grejpfruta"],
  brzoskwinie: ["brzoskwinia", "brzoskwinie", "brzoskwini"],
  mandarynki: ["mandarynka", "mandarynki", "mandarynek"],
  kaki: ["kaki", "persymona"]
};

const ui = {
  profileSelect: document.getElementById("profileSelect"),
  heroKcal: document.getElementById("heroKcal"),
  weekSelect: document.getElementById("weekSelect"),
  daySelect: document.getElementById("daySelect"),
  weekFilter: document.getElementById("weekFilter"),
  slotWrap: document.getElementById("slotWrap"),
  dayKcal: document.getElementById("dayKcal"),
  kcalDiff: document.getElementById("kcalDiff"),
  recipeSearch: document.getElementById("recipeSearch"),
  recipesList: document.getElementById("recipesList"),
  planTables: document.getElementById("planTables"),

  mDate: document.getElementById("mDate"),
  mGender: document.getElementById("mGender"),
  mAge: document.getElementById("mAge"),
  mWeight: document.getElementById("mWeight"),
  mHeight: document.getElementById("mHeight"),
  mWaist: document.getElementById("mWaist"),
  mChest: document.getElementById("mChest"),
  mHips: document.getElementById("mHips"),
  saveMetricBtn: document.getElementById("saveMetricBtn"),
  bmiNow: document.getElementById("bmiNow"),
  metricsTable: document.getElementById("metricsTable")
};

let profiles = [];
let currentProfile = "bartek";
let recipes = [];
let recipesById = {};
let planData = { targetKcal: 2100, defaultPlan: { "1": [], "2": [], "3": [], "4": [] } };
let selectedWeek = 1;
let selectedDay = 1;

init();

async function init() {
  fillWeekDaySelectors();
  bindEvents();
  await loadProfiles();
  await switchProfile(currentProfile);
}

function fillWeekDaySelectors() {
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
  ui.profileSelect.addEventListener("change", async () => {
    const id = ui.profileSelect.value;
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    await switchProfile(id);
  });

  ui.weekSelect.addEventListener("change", () => {
    selectedWeek = Number(ui.weekSelect.value);
    renderPlanner();
  });

  ui.daySelect.addEventListener("change", () => {
    selectedDay = Number(ui.daySelect.value);
    renderPlanner();
  });

  ui.weekFilter.addEventListener("change", renderPlanTables);
  ui.recipeSearch.addEventListener("input", renderRecipes);
  ui.saveMetricBtn.addEventListener("click", saveMetric);
}

async function loadProfiles() {
  try {
    const res = await fetch("plans/profiles.json");
    profiles = await res.json();
  } catch {
    profiles = [{ id: "bartek", name: "Bartek" }, { id: "paulina", name: "Paulina" }];
  }

  ui.profileSelect.innerHTML = profiles.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
  const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const exists = profiles.some((p) => p.id === saved);
  currentProfile = exists ? saved : (profiles[0]?.id || "bartek");
  ui.profileSelect.value = currentProfile;
}

async function switchProfile(profileId) {
  currentProfile = profileId;
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);

  try {
    const [rRes, pRes] = await Promise.all([
      fetch(`plans/${profileId}/recipes.json`),
      fetch(`plans/${profileId}/plan.json`)
    ]);
    if (!rRes.ok || !pRes.ok) throw new Error("Brak plików profilu");
    recipes = await rRes.json();
    planData = await pRes.json();
  } catch {
    // fallback: żeby nie było pustki
    const r = await fetch("recipes.json");
    recipes = await r.json();
    planData = { targetKcal: 2100, defaultPlan: { "1": [], "2": [], "3": [], "4": [] } };
  }

  recipes = addCategoriesFromPlan(recipes, planData.defaultPlan || {});
  recipesById = Object.fromEntries(recipes.map((r) => [r.id, r]));

  selectedWeek = 1;
  selectedDay = 1;
  ui.weekSelect.value = "1";
  ui.daySelect.value = "1";
  ui.weekFilter.value = "all";

  ui.heroKcal.textContent = `Cel: ${planData.targetKcal || 2100} kcal dziennie`;

  renderPlanner();
  renderPlanTables();
  renderRecipes();
  renderMetrics();
}

function addCategoriesFromPlan(list, defaultPlan) {
  const map = {};
  Object.values(defaultPlan).forEach((rows) => {
    rows.forEach((row) => {
      slotConfig.forEach((slot) => {
        const id = row[slot.id];
        if (!id) return;
        if (!map[id]) map[id] = new Set();

        // śniadanie + kolacja wymienne
        if (slot.category === "sniadanie" || slot.category === "kolacja") {
          map[id].add("sniadanie");
          map[id].add("kolacja");
        } else {
          map[id].add(slot.category);
        }
      });
    });
  });

  // fallback: gdy plan pusty, wszystko wybieralne
  return list.map((r) => {
    const cats = Array.from(map[r.id] || []);
    return { ...r, categories: cats.length ? cats : ["sniadanie", "obiad", "kolacja", "przekaska"] };
  });
}

function plannerKey() {
  return `${APP_KEY}:${currentProfile}:planner`;
}
function metricsKey() {
  return `${APP_KEY}:${currentProfile}:metrics`;
}

function getPlannerState() {
  try {
    return JSON.parse(localStorage.getItem(plannerKey()) || "{}");
  } catch {
    return {};
  }
}
function setPlannerState(data) {
  localStorage.setItem(plannerKey(), JSON.stringify(data));
}

function renderPlanner() {
  const state = getPlannerState();
  const dayKey = `${selectedWeek}-${selectedDay}`;

  if (!state[dayKey]) {
    const base = planData.defaultPlan?.[String(selectedWeek)]?.[selectedDay - 1];
    state[dayKey] = {
      meal1: base?.meal1 || "",
      meal2: base?.meal2 || "",
      meal3: base?.meal3 || "",
      snack: base?.snack || ""
    };
    setPlannerState(state);
  }

  const selected = state[dayKey];

  ui.slotWrap.innerHTML = slotConfig.map((slot) => {
    const allowed = recipes.filter((r) => (r.categories || []).includes(slot.category));
    const options = [
      `<option value="">-- wybierz --</option>`,
      ...allowed.map((r) => `<option value="${r.id}" ${selected[slot.id] === r.id ? "selected" : ""}>${escapeHtml(r.title)} (${r.kcal} kcal)</option>`)
    ].join("");

    const chosen = recipesById[selected[slot.id]];
    const meta = chosen ? `<a href="#recipe-${chosen.id}">${escapeHtml(chosen.title)}</a> - ${chosen.kcal} kcal` : "Brak wybranego przepisu";

    return `
      <div class="slot-card">
        <p class="slot-title">${slot.label}</p>
        <select data-slot="${slot.id}">${options}</select>
        <p class="slot-meta">${meta}</p>
      </div>
    `;
  }).join("");

  ui.slotWrap.querySelectorAll("select").forEach((el) => {
    el.addEventListener("change", () => {
      state[dayKey][el.dataset.slot] = el.value;
      setPlannerState(state);
      renderPlanner();
    });
  });

  const dayKcal = slotConfig.reduce((sum, slot) => sum + (recipesById[selected[slot.id]]?.kcal || 0), 0);
  const diff = dayKcal - (planData.targetKcal || 2100);

  ui.dayKcal.textContent = `Suma dnia: ${dayKcal} kcal`;
  ui.kcalDiff.textContent = diff === 0 ? "Idealnie pod cel." : diff > 0 ? `+${diff} kcal` : `${diff} kcal`;
}

function renderPlanTables() {
  const filter = ui.weekFilter.value || "all";
  const weeks = filter === "all" ? [1, 2, 3, 4] : [Number(filter)];
  const dp = planData.defaultPlan || {};

  ui.planTables.innerHTML = weeks.map((w) => {
    const rows = dp[String(w)] || [];
    if (!rows.length) return `<h3>Tydzień ${w}</h3><p>Brak danych planu.</p>`;

    return `
      <h3>Tydzień ${w}</h3>
      <table class="plan-table">
        <thead>
          <tr>
            <th>Dzień</th><th>Śniadanie</th><th>Obiad</th><th>Kolacja</th><th>Przekąska</th><th>Suma kcal</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) => `
            <tr>
              <td>${weekdayNames[idx] || `Dzień ${row.day}`}</td>
              <td>${planRecipeCell(row.meal1)}</td>
              <td>${planRecipeCell(row.meal2)}</td>
              <td>${planRecipeCell(row.meal3)}</td>
              <td>${planRecipeCell(row.snack)}</td>
              <td>${row.total ?? "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }).join("");
}

function planRecipeCell(id) {
  const r = recipesById[id];
  if (!r) return id || "-";
  return `<a href="#recipe-${r.id}">${escapeHtml(r.title)}</a>`;
}

function renderRecipes() {
  const q = ui.recipeSearch.value.trim().toLowerCase();
  const filtered = recipes.filter((r) =>
    `${r.id} ${r.title} ${r.ingredients.join(" ")} ${r.steps.join(" ")}`
      .toLowerCase()
      .includes(q)
  );

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
          ${r.ingredients.map((ing, idx) => ingredientRow(r.id, idx, ing)).join("")}
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

      if (!sel.value) {
        info.textContent = "";
        return;
      }

      const target = decodeURIComponent(sel.value);
      const converted = computeConvertedGrams(original, target);

      if (converted === null) info.textContent = `Zamiana: ${target} (brak gramatury źródłowej).`;
      else if (typeof converted === "string") info.textContent = `Zamiana: ${target} -> ${converted} g`;
      else info.textContent = `Zamiana: ${target} -> ${converted} g`;
    });
  });
}

function ingredientRow(recipeId, idx, ing) {
  const group = findSubstitutionGroup(ing);

  // bez zamienników = tylko składnik
  if (!group) {
    return `<li class="ingredient-row"><div class="ingredient-main">${escapeHtml(ing)}</div></li>`;
  }

  const selectId = `swap-${recipeId}-${idx}`;
  const infoId = `swap-info-${recipeId}-${idx}`;

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
}

function normalizeText(s) {
  return s
    .toLowerCase()
    .replaceAll("ł", "l")
    .replaceAll("ą", "a")
    .replaceAll("ę", "e")
    .replaceAll("ś", "s")
    .replaceAll("ć", "c")
    .replaceAll("ż", "z")
    .replaceAll("ź", "z")
    .replaceAll("ń", "n")
    .replaceAll("ó", "o")
    .replace(/[()/%.,:;+*-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAlias(textNorm, aliasKey) {
  const aliases = ingredientAliases[aliasKey] || [aliasKey];
  return aliases.some((a) => textNorm.includes(normalizeText(a)));
}

function extractGrams(text) {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  return m ? Number(m[1].replace(",", ".")) : null;
}

function findSubstitutionGroup(ingredient) {
  const n = normalizeText(ingredient);

  return substitutionGroups.find((group) =>
    group.some((item) => {
      const itemNorm = normalizeText(item);

      if (n.includes(itemNorm) || itemNorm.includes(n)) return true;

      const words = itemNorm.split(" ").filter(Boolean);
      if (words.some((w) => w.length > 3 && n.includes(w))) return true;

      const fruitAliasKey = Object.keys(ingredientAliases).find((k) => itemNorm.includes(k.replaceAll("_", " ")));
      if (fruitAliasKey && containsAlias(n, fruitAliasKey)) return true;

      return false;
    })
  ) || null;
}

function computeConvertedGrams(originalIngredient, targetName) {
  const grams = extractGrams(originalIngredient);
  if (!grams) return null;

  const originalNorm = normalizeText(originalIngredient);
  const targetNorm = normalizeText(targetName);

  const originalFruitKey = Object.keys(fruitEq).find((k) => containsAlias(originalNorm, k));
  const targetFruitKey = Object.keys(fruitEq).find((k) => containsAlias(targetNorm, k));

  // owoce
  if (originalFruitKey && targetFruitKey) {
    return Math.round((grams * fruitEq[targetFruitKey]) / fruitEq[originalFruitKey]);
  }

  // ryż/kasza -> ziemniaki
  const isRiceOrGroats = originalNorm.includes("ryz") || originalNorm.includes("kasza");
  const isPotatoFamily = targetNorm.includes("ziemniaki") || targetNorm.includes("bataty") || targetNorm.includes("topinambur");
  if (isRiceOrGroats && isPotatoFamily) {
    return `${Math.round((grams * 450) / 100)}-${Math.round((grams * 500) / 100)}`;
  }

  // domyślnie 1:1
  return Math.round(grams);
}

function formatCategory(c) {
  if (c === "sniadanie") return "śniadanie";
  if (c === "obiad") return "obiad";
  if (c === "kolacja") return "kolacja";
  return "przekąska";
}

function saveMetric() {
  const date = ui.mDate.value || new Date().toISOString().slice(0, 10);
  const gender = ui.mGender.value;
  const age = Number(ui.mAge.value) || null;
  const weight = Number(ui.mWeight.value) || null;
  const height = Number(ui.mHeight.value) || null;
  const waist = Number(ui.mWaist.value) || null;
  const chest = Number(ui.mChest.value) || null;
  const hips = Number(ui.mHips.value) || null;

  if (!weight || !height) {
    alert("Podaj minimum wagę i wzrost.");
    return;
  }

  const bmi = calcBMI(weight, height);
  const entry = { date, gender, age, weight, height, waist, chest, hips, bmi };

  let history = [];
  try { history = JSON.parse(localStorage.getItem(metricsKey()) || "[]"); } catch {}

  history.push(entry);
  history.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(metricsKey(), JSON.stringify(history));

  renderMetrics();
}

function metricsKey() {
  return `${APP_KEY}:${currentProfile}:metrics`;
}

function calcBMI(weightKg, heightCm) {
  const h = heightCm / 100;
  return Number((weightKg / (h * h)).toFixed(2));
}

function bmiLabel(bmi) {
  if (bmi < 18.5) return "Niedowaga";
  if (bmi < 25) return "Norma";
  if (bmi < 30) return "Nadwaga";
  return "Otyłość";
}

function renderMetrics() {
  let history = [];
  try { history = JSON.parse(localStorage.getItem(metricsKey()) || "[]"); } catch {}

  const latest = history[history.length - 1];
  ui.bmiNow.textContent = latest ? `BMI: ${latest.bmi} (${bmiLabel(latest.bmi)})` : "BMI: -";

  if (!history.length) {
    ui.metricsTable.innerHTML = "<p>Brak zapisanych pomiarów.</p>";
    return;
  }

  ui.metricsTable.innerHTML = `
    <table class="metric-table">
      <thead>
        <tr>
          <th>Data</th><th>Płeć</th><th>Wiek</th><th>Waga</th><th>Wzrost</th><th>Talia</th><th>Klatka/Biust</th><th>Biodra</th><th>BMI</th>
        </tr>
      </thead>
      <tbody>
        ${history.map((h) => `
          <tr>
            <td>${h.date}</td>
            <td>${h.gender}</td>
            <td>${h.age ?? ""}</td>
            <td>${h.weight ?? ""}</td>
            <td>${h.height ?? ""}</td>
            <td>${h.waist ?? ""}</td>
            <td>${h.chest ?? ""}</td>
            <td>${h.hips ?? ""}</td>
            <td>${h.bmi} (${bmiLabel(h.bmi)})</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
