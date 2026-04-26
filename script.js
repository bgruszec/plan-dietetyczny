const APP_KEY = "diet-app-v2";
const ACTIVE_PROFILE_KEY = "diet-active-profile";

const slotConfig = [
  { id: "meal1", label: "Śniadanie", category: "sniadanie" },
  { id: "meal2", label: "Obiad", category: "obiad" },
  { id: "meal3", label: "Kolacja", category: "kolacja" },
  { id: "snack", label: "Przekąska", category: "przekaska" }
];

const weekdayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

const ui = {
  profileSelect: document.getElementById("profileSelect"),
  heroKcal: document.getElementById("heroKcal"),
  weekSelect: document.getElementById("weekSelect"),
  daySelect: document.getElementById("daySelect"),
  slotWrap: document.getElementById("slotWrap"),
  dayKcal: document.getElementById("dayKcal"),
  kcalDiff: document.getElementById("kcalDiff"),
  recipeSearch: document.getElementById("recipeSearch"),
  recipesList: document.getElementById("recipesList"),

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

  ui.recipeSearch.addEventListener("input", renderRecipes);
  ui.saveMetricBtn.addEventListener("click", saveMetric);
}

async function loadProfiles() {
  try {
    const res = await fetch("plans/profiles.json");
    profiles = await res.json();
  } catch {
    profiles = [
      { id: "bartek", name: "Bartek" },
      { id: "paulina", name: "Paulina" }
    ];
  }

  ui.profileSelect.innerHTML = profiles
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join("");

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

    if (!rRes.ok || !pRes.ok) throw new Error("Brak plików w plans/");

    recipes = await rRes.json();
    planData = await pRes.json();
  } catch (err) {
    // fallback żeby przepisy zawsze były widoczne
    const r = await fetch("recipes.json");
    recipes = await r.json();
    planData = { targetKcal: 2100, defaultPlan: { "1": [], "2": [], "3": [], "4": [] } };
    console.warn("Fallback do root recipes.json:", err);
  }

  recipes = addCategoriesFromPlan(recipes, planData.defaultPlan || {});
  recipesById = Object.fromEntries(recipes.map((r) => [r.id, r]));

  selectedWeek = 1;
  selectedDay = 1;
  ui.weekSelect.value = "1";
  ui.daySelect.value = "1";

  ui.heroKcal.textContent = `Cel: ${planData.targetKcal || 2100} kcal dziennie`;

  renderPlanner();
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
      ...allowed.map((r) => `<option value="${r.id}" ${selected[slot.id] === r.id ? "selected" : ""}>${r.title} (${r.kcal} kcal)</option>`)
    ].join("");

    const chosen = recipesById[selected[slot.id]];
    const chosenMeta = chosen ? `<a href="#recipe-${chosen.id}">${chosen.title}</a> - ${chosen.kcal} kcal` : "Brak wybranego przepisu";

    return `
      <div class="slot-card">
        <p class="slot-title">${slot.label}</p>
        <select data-slot="${slot.id}">${options}</select>
        <p class="slot-meta">${chosenMeta}</p>
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

function renderRecipes() {
  const q = ui.recipeSearch.value.trim().toLowerCase();
  const filtered = recipes.filter((r) =>
    `${r.id} ${r.title} ${r.ingredients.join(" ")} ${r.steps.join(" ")}`
      .toLowerCase()
      .includes(q)
  );

  ui.recipesList.innerHTML = filtered.map((r) => `
    <article class="recipe-card" id="recipe-${r.id}">
      <h3>${r.title}</h3>
      <div class="recipe-meta">${r.kcal} kcal</div>
      <details>
        <summary>Składniki</summary>
        <ul>${r.ingredients.map((x) => `<li>${x}</li>`).join("")}</ul>
      </details>
      <details>
        <summary>Wykonanie</summary>
        <ul>${r.steps.map((x) => `<li>${x}</li>`).join("")}</ul>
      </details>
    </article>
  `).join("");
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
  try {
    history = JSON.parse(localStorage.getItem(metricsKey()) || "[]");
  } catch {}

  history.push(entry);
  history.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(metricsKey(), JSON.stringify(history));

  renderMetrics();
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
  try {
    history = JSON.parse(localStorage.getItem(metricsKey()) || "[]");
  } catch {}

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
