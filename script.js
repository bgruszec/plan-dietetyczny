import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_KEY = "diet-app-v3";
const ACTIVE_PROFILE_KEY = "diet-active-profile";
const THEME_KEY = "diet-theme";

const slotConfig = [
  { id: "meal1", label: "Śniadanie", category: "sniadanie" },
  { id: "meal2", label: "Obiad", category: "obiad" },
  { id: "meal3", label: "Kolacja", category: "kolacja" },
  { id: "snack", label: "Przekąska", category: "przekaska" }
];

const weekdayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const fallbackRecipeCategories = {
  R1: ["sniadanie"], R5: ["sniadanie"], R9: ["sniadanie"], R13: ["sniadanie"], R17: ["sniadanie"],
  R21: ["sniadanie"], R25: ["sniadanie"], R29: ["sniadanie"], R32: ["sniadanie"], R33: ["sniadanie"],
  R2: ["obiad"], R6: ["obiad"], R10: ["obiad"], R14: ["obiad"], R18: ["obiad"],
  R22: ["obiad"], R26: ["obiad"], R30: ["obiad"], R31: ["obiad"],
  R3: ["kolacja"], R7: ["kolacja"], R11: ["kolacja"], R15: ["kolacja"], R19: ["kolacja"],
  R23: ["kolacja"], R27: ["kolacja"], R34: ["kolacja"], R35: ["kolacja"],
  R4: ["przekaska"], R8: ["przekaska"], R12: ["przekaska"], R16: ["przekaska"],
  R20: ["przekaska"], R24: ["przekaska"], R28: ["przekaska"]
};

const substitutionGroups = [
  ["pomidor","ogórek","papryka","cukinia","brokuł","marchew","rzodkiewka","kapusta","seler naciowy","kalafior","szparagi","bakłażan","dynia","pieczarki"],
  ["szpinak","rukola","roszponka","sałata rzymska","miks sałat","jarmuż","sałata lodowa"],
  ["banan","duze jablko","pomarancza","kaki","mandarynki","brzoskwinie","gruszka","kiwi","maliny","truskawki","winogrona","grejpfrut","mango","sliwki","ananas","borowki","czeresnie","owoce suszone"],
  ["mąka jaglana","mąka gryczana","mąka żytnia typ 2000","mąka ryżowa","mąka z tapioki","mąka amarantusowa","mąka orkiszowa","mąka pełnoziarnista","mąka owsiana"],
  ["płatki owsiane","płatki jaglane","płatki gryczane","płatki ryżowe","płatki orkiszowe"],
  ["ryż biały","ryż basmati","ryż brązowy","ryż dziki","komosa ryżowa","kasza gryczana","kasza jaglana","kasza pęczak","kasza bulgur","kasza owsiana","kasza jęczmienna","amarantus","makaron gryczany","makaron jaglany","makaron żytni","makaron ryżowy","makaron pełnoziarnisty","makaron orkiszowy","makaron bezglutenowy"],
  ["ziemniaki","bataty","topinambur"],
  ["chleb żytni razowy","chleb żytni na zakwasie","chleb orkiszowy","chleb pełnoziarnisty","chleb bezglutenowy","bułka owsiana","bułka grahamka","bułka pełnoziarnista"],
  ["hummus","pasty warzywne"],
  ["miód","syrop klonowy","syrop z agawy"],
  ["pierś z kurczaka","pierś z indyka","mielone mięso drobiowe","schab wieprzowy","polędwiczka wieprzowa","polędwica wołowa","rostbef wołowy","tofu naturalne","krewetki tygrysie"],
  ["dorsz","mintaj","pstrąg","morszczuk","sandacz","tuńczyk","krewetki tygrysie"],
  ["halibut","łosoś","śledź","makrela","pstrąg tęczowy"],
  ["ciecierzyca","soczewica","fasola","groch","soja"],
  ["serek wiejski","ser twarogowy chudy","tofu naturalne"],
  ["mleko 2%","mleko bezlaktozowe 2%","napój sojowy niesłodzony","napój migdałowy niesłodzony","napój owsiany niesłodzony"],
  ["orzechy włoskie","orzechy nerkowca","orzechy laskowe","orzechy pistacjowe","orzechy piniowe","orzechy pekan","orzechy arachidowe","siemię lniane","sezam","pestki słonecznika","pestki dyni","wiórki kokosowe","masło orzechowe","nasiona chia"],
  ["oliwa z oliwek","olej rzepakowy","olej z awokado","olej kokosowy","masło"],
  ["woda","herbata","kawa","napary ziołowe","mięta","pokrzywa","melisa"]
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
  menuButtons: Array.from(document.querySelectorAll(".menu-btn")),
  sections: {
    metrics: document.getElementById("section-metrics"),
    planner: document.getElementById("section-planner"),
    plan: document.getElementById("section-plan"),
    recipes: document.getElementById("section-recipes"),
    shopping: document.getElementById("section-shopping"),
    consult: document.getElementById("section-consult"),
    settings: document.getElementById("section-settings")
  },
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
  metricsTable: document.getElementById("metricsTable"),
  copyDayBtn: document.getElementById("copyDayBtn"),
  autoPlanBtn: document.getElementById("autoPlanBtn"),
  shoppingScope: document.getElementById("shoppingScope"),
  shoppingWeekSelect: document.getElementById("shoppingWeekSelect"),
  shoppingDaySelect: document.getElementById("shoppingDaySelect"),
  generateShoppingBtn: document.getElementById("generateShoppingBtn"),
  copyShoppingBtn: document.getElementById("copyShoppingBtn"),
  shareShoppingBtn: document.getElementById("shareShoppingBtn"),
  shoppingOutput: document.getElementById("shoppingOutput"),
  consultPrompt: document.getElementById("consultPrompt"),
  consultAskBtn: document.getElementById("consultAskBtn"),
  consultProposeRecipeBtn: document.getElementById("consultProposeRecipeBtn"),
  consultResponse: document.getElementById("consultResponse"),
  consultRecipeContext: document.getElementById("consultRecipeContext"),
  consultRecipePatch: document.getElementById("consultRecipePatch"),

  themeSelect: document.getElementById("themeSelect"),
  targetKcalInput: document.getElementById("targetKcalInput"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  resetPlannerBtn: document.getElementById("resetPlannerBtn")
  ,
  authCard: document.getElementById("authCard"),
  authStatus: document.getElementById("authStatus"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  authMessage: document.getElementById("authMessage"),
  loginBtn: document.getElementById("loginBtn"),
  registerBtn: document.getElementById("registerBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  appShell: Array.from(document.querySelectorAll(".app-shell")),
  topbarTrail: document.getElementById("topbarTrail"),
  authChip: document.getElementById("authChip"),
  consultTargetRecipe: document.getElementById("consultTargetRecipe"),
  consultRecipeSearch: document.getElementById("consultRecipeSearch")
};

let profiles = [];
let currentProfile = "bartek";
let recipes = [];
let recipesById = {};
let planData = { targetKcal: 2100, defaultPlan: { "1": [], "2": [], "3": [], "4": [] } };
let selectedWeek = 1;
let selectedDay = 1;
let pendingRecipePatch = null;
let supabase = null;
let authUser = null;

init();

async function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || "dark");
  await initSupabase();
  fillWeekDaySelectors();
  initMenu();
  bindEvents();
  await loadProfiles();
  initShoppingSelectors();
  await restoreSessionAndBootstrap();
}

async function initSupabase() {
  try {
    const res = await fetch("/api/runtime-config");
    if (!res.ok) return;
    const config = await res.json();
    if (!config.supabaseUrl || !config.supabaseAnonKey) return;
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  } catch {
    supabase = null;
  }
}

async function restoreSessionAndBootstrap() {
  if (!supabase) {
    setAuthUi(null, "Tryb lokalny (bez logowania).", true);
    await switchProfile(currentProfile);
    return;
  }

  const { data } = await supabase.auth.getSession();
  authUser = data.session?.user || null;
  setAuthUi(authUser);

  if (authUser) {
    await switchProfile(currentProfile);
    await pullRemoteState();
    return;
  }

  ui.appShell.forEach((el) => el.classList.add("hidden"));
}

function setAuthUi(user, message = "", forceShowApp = false) {
  const signed = Boolean(user);
  const showTrail = signed || forceShowApp;
  ui.authMessage.textContent = message;
  ui.authStatus.textContent = signed ? `Zalogowany: ${user.email}` : "";
  ui.topbarTrail.classList.toggle("hidden", !showTrail);
  ui.authChip.classList.toggle("hidden", !signed);
  ui.appShell.forEach((el) => el.classList.toggle("hidden", !signed && !forceShowApp));
  ui.authCard.classList.toggle("hidden", signed || forceShowApp);
}

async function registerUser() {
  if (!supabase) return;
  const email = ui.authEmail.value.trim();
  const password = ui.authPassword.value.trim();
  if (!email || password.length < 6) {
    setAuthUi(authUser, "Podaj email i hasło (min. 6 znaków).");
    return;
  }
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    setAuthUi(authUser, `Błąd rejestracji: ${error.message}`);
    return;
  }
  setAuthUi(authUser, "Konto utworzone. Sprawdź mail i zaloguj się.");
}

async function loginUser() {
  if (!supabase) return;
  const email = ui.authEmail.value.trim();
  const password = ui.authPassword.value.trim();
  if (!email || !password) {
    setAuthUi(authUser, "Podaj email i hasło.");
    return;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setAuthUi(authUser, `Błąd logowania: ${error.message}`);
    return;
  }
  authUser = data.session?.user ?? data.user ?? null;
  setAuthUi(authUser, "Zalogowano.");
  await switchProfile(currentProfile);
  await pullRemoteState();
}

async function logoutUser() {
  if (!supabase) return;
  await supabase.auth.signOut();
  authUser = null;
  setAuthUi(null, "Wylogowano.");
}

async function pullRemoteState() {
  if (!supabase || !authUser) return;
  await ensureUserProfile();

  const profile = await loadRemoteProfileSettings();
  if (profile) localStorage.setItem(settingsKey(), JSON.stringify(profile));

  const planner = await loadRemotePlannerEntries();
  if (planner) {
    setPlannerState(planner);
  } else {
    const localPlanner = getPlannerState();
    const keys = Object.keys(localPlanner);
    for (const key of keys) {
      const [week, day] = key.split("-").map(Number);
      await savePlannerEntryRemote(week, day, localPlanner[key]);
    }
  }

  const metrics = await loadRemoteMetricsEntries();
  if (metrics?.length) {
    localStorage.setItem(metricsKey(), JSON.stringify(metrics));
  } else {
    let localMetrics = [];
    try { localMetrics = JSON.parse(localStorage.getItem(metricsKey()) || "[]"); } catch {}
    for (const entry of localMetrics) await saveMetricsRemote(entry);
  }

  renderPlanner();
  renderPlanTables();
  renderMetrics();
  fillSettingsFromState();
}

async function ensureUserProfile() {
  if (!supabase || !authUser) return;
  const payload = {
    user_id: authUser.id,
    profile_id: currentProfile,
    target_kcal: Number(loadProfileSettings().targetKcal || planData.targetKcal || 2100),
    theme: document.body.dataset.theme || "dark",
    updated_at: new Date().toISOString()
  };
  await supabase.from("profiles").upsert(payload, { onConflict: "user_id,profile_id" });
}

async function loadRemoteProfileSettings() {
  const { data } = await supabase
    .from("profiles")
    .select("target_kcal,theme")
    .eq("user_id", authUser.id)
    .eq("profile_id", currentProfile)
    .maybeSingle();
  if (!data) return null;
  if (data.theme) applyTheme(data.theme);
  return { targetKcal: data.target_kcal, updatedAt: new Date().toISOString() };
}

async function loadRemotePlannerEntries() {
  const { data } = await supabase
    .from("planner_entries")
    .select("week,day,meal1,meal2,meal3,snack")
    .eq("user_id", authUser.id)
    .eq("profile_id", currentProfile);
  if (!data?.length) return null;
  const mapped = {};
  data.forEach((r) => {
    mapped[`${r.week}-${r.day}`] = { meal1: r.meal1 || "", meal2: r.meal2 || "", meal3: r.meal3 || "", snack: r.snack || "" };
  });
  return mapped;
}

async function loadRemoteMetricsEntries() {
  const { data } = await supabase
    .from("metrics_entries")
    .select("date,gender,age,weight,height,waist,chest,hips,bmi")
    .eq("user_id", authUser.id)
    .eq("profile_id", currentProfile)
    .order("date", { ascending: true });
  return data || null;
}

async function savePlannerEntryRemote(week, day, entry) {
  if (!supabase || !authUser) return;
  await supabase.from("planner_entries").upsert({
    user_id: authUser.id,
    profile_id: currentProfile,
    week,
    day,
    meal1: entry.meal1 || "",
    meal2: entry.meal2 || "",
    meal3: entry.meal3 || "",
    snack: entry.snack || "",
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,profile_id,week,day" });
}

async function saveSettingsRemote(targetKcal) {
  if (!supabase || !authUser) return;
  await ensureUserProfile();
  await supabase.from("profiles").upsert({
    user_id: authUser.id,
    profile_id: currentProfile,
    target_kcal: targetKcal,
    theme: document.body.dataset.theme || "dark",
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,profile_id" });
}

async function saveMetricsRemote(entry) {
  if (!supabase || !authUser) return;
  await supabase.from("metrics_entries").upsert({
    ...entry,
    user_id: authUser.id,
    profile_id: currentProfile
  }, { onConflict: "user_id,profile_id,date" });
}

async function saveConsultHistory(question, answer, payload) {
  if (!supabase || !authUser) return;
  await supabase.from("consult_history").insert({
    user_id: authUser.id,
    profile_id: currentProfile,
    question,
    answer,
    changes_json: payload || [],
    created_at: new Date().toISOString()
  });
}

function recipeOverridesStorageKey() {
  return `${APP_KEY}-recipe-overrides-${currentProfile}`;
}

function loadRecipeOverrides() {
  try {
    const raw = localStorage.getItem(recipeOverridesStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecipeOverrides(map) {
  localStorage.setItem(recipeOverridesStorageKey(), JSON.stringify(map));
}

function applyStoredRecipeOverrides(rawRecipes) {
  const overrides = loadRecipeOverrides();
  return rawRecipes.map((r) => mergeRecipeFromStored(r, overrides[r.id]));
}

function mergeRecipeFromStored(base, stored) {
  if (!stored) return { ...base };
  return {
    ...base,
    ...(stored.title != null ? { title: stored.title } : {}),
    ...(stored.kcal != null ? { kcal: stored.kcal } : {}),
    ...(Array.isArray(stored.ingredients) ? { ingredients: [...stored.ingredients] } : {}),
    ...(Array.isArray(stored.steps) ? { steps: [...stored.steps] } : {})
  };
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

function initShoppingSelectors() {
  ui.shoppingWeekSelect.innerHTML = ui.weekSelect.innerHTML;
  ui.shoppingDaySelect.innerHTML = ui.daySelect.innerHTML;
  ui.shoppingWeekSelect.value = ui.weekSelect.value;
  ui.shoppingDaySelect.value = ui.daySelect.value;
}

function bindEvents() {
  ui.loginBtn.addEventListener("click", loginUser);
  ui.registerBtn.addEventListener("click", registerUser);
  ui.logoutBtn.addEventListener("click", logoutUser);

  ui.profileSelect.addEventListener("change", async () => {
    const id = ui.profileSelect.value;
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    await switchProfile(id);
    await pullRemoteState();
  });

  ui.weekSelect.addEventListener("change", () => {
    selectedWeek = Number(ui.weekSelect.value);
    renderPlanner();
  });

  ui.daySelect.addEventListener("change", () => {
    selectedDay = Number(ui.daySelect.value);
    ui.shoppingDaySelect.value = ui.daySelect.value;
    renderPlanner();
  });
  ui.weekSelect.addEventListener("change", () => {
    ui.shoppingWeekSelect.value = ui.weekSelect.value;
  });

  ui.weekFilter.addEventListener("change", renderPlanTables);
  ui.recipeSearch.addEventListener("input", renderRecipes);
  ui.saveMetricBtn.addEventListener("click", saveMetric);
  ui.copyDayBtn.addEventListener("click", copySelectedDayPlan);
  ui.autoPlanBtn.addEventListener("click", autoFillFullPlan);
  ui.saveSettingsBtn.addEventListener("click", saveSettings);
  ui.resetPlannerBtn.addEventListener("click", resetPlannerForCurrentProfile);
  ui.themeSelect.addEventListener("change", () => applyTheme(ui.themeSelect.value));
  ui.generateShoppingBtn.addEventListener("click", generateShoppingList);
  ui.copyShoppingBtn.addEventListener("click", copyShoppingList);
  ui.shareShoppingBtn.addEventListener("click", shareShoppingList);
  ui.consultAskBtn.addEventListener("click", askDietAssistant);
  ui.consultProposeRecipeBtn.addEventListener("click", askForRecipePatchProposal);
  ui.consultTargetRecipe.addEventListener("change", () => {
    renderConsultRecipeContext();
    pendingRecipePatch = null;
    renderPendingRecipePatch();
  });
  ui.consultRecipeSearch.addEventListener("input", refreshConsultRecipeOptions);

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#recipe-"]');
    if (!link) return;
    showSection("recipes");
  });
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
    const rawRecipes = await rRes.json();
    planData = await pRes.json();
    recipes = applyStoredRecipeOverrides(rawRecipes);
  } catch {
    // fallback: żeby nie było pustki
    const r = await fetch("recipes.json");
    const rawRecipes = await r.json();
    recipes = applyStoredRecipeOverrides(rawRecipes);
    planData = { targetKcal: 2100, defaultPlan: { "1": [], "2": [], "3": [], "4": [] } };
  }

  recipes = addCategoriesFromPlan(recipes, planData.defaultPlan || {});
  recipesById = Object.fromEntries(recipes.map((r) => [r.id, r]));

  selectedWeek = 1;
  selectedDay = 1;
  ui.weekSelect.value = "1";
  ui.daySelect.value = "1";
  ui.weekFilter.value = "all";

  ui.heroKcal.textContent = `Cel: ${getTargetKcal()} kcal dziennie`;
  fillSettingsFromState();
  ui.shoppingWeekSelect.value = "1";
  ui.shoppingDaySelect.value = "1";
  ui.shoppingOutput.value = "";
  pendingRecipePatch = null;
  ui.consultResponse.textContent = "";
  ui.consultRecipePatch.innerHTML = "";
  refreshConsultRecipeOptions();
  renderConsultRecipeContext();

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
        if (slot.category === "sniadanie" || slot.category === "kolacja") {
          map[id].add("sniadanie");
          map[id].add("kolacja");
        } else {
          map[id].add(slot.category);
        }
      });
    });
  });

  return list.map((r) => {
    const fromPlan = Array.from(map[r.id] || []);
    const fromFallback = fallbackRecipeCategories[r.id] || [];
    const cats = Array.from(new Set([...fromPlan, ...fromFallback]));
    if (cats.length) return { ...r, categories: cats };
    if (Array.isArray(r.categories) && r.categories.length) return r;
    return { ...r, categories: [] };
  });
}

function plannerKey() {
  return `${APP_KEY}:${currentProfile}:planner`;
}
function metricsKey() {
  return `${APP_KEY}:${currentProfile}:metrics`;
}
function settingsKey() {
  return `${APP_KEY}:${currentProfile}:settings`;
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
    const allowedCategories = slot.category === "sniadanie" || slot.category === "kolacja"
      ? ["sniadanie", "kolacja"]
      : [slot.category];
    const allowed = recipes.filter((r) =>
      (r.categories || []).some((cat) => allowedCategories.includes(cat))
    );
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
    el.addEventListener("change", async () => {
      state[dayKey][el.dataset.slot] = el.value;
      setPlannerState(state);
      await savePlannerEntryRemote(selectedWeek, selectedDay, state[dayKey]);
      renderPlanner();
      renderPlanTables();
    });
  });

  const dayKcal = slotConfig.reduce((sum, slot) => sum + (recipesById[selected[slot.id]]?.kcal || 0), 0);
  const diff = dayKcal - getTargetKcal();

  ui.dayKcal.textContent = `Suma dnia: ${dayKcal} kcal`;
  ui.kcalDiff.textContent = diff === 0 ? "Idealnie pod cel." : diff > 0 ? `+${diff} kcal` : `${diff} kcal`;
}

async function copySelectedDayPlan() {
  const sourceWeek = selectedWeek;
  const sourceDay = selectedDay;

  const targetWeekInput = prompt("Skopiować na który tydzień? (1-4)", String(sourceWeek));
  if (targetWeekInput === null) return;
  const targetWeek = Number(targetWeekInput);

  const targetDayInput = prompt("Skopiować na który dzień? (1-7)", String(sourceDay));
  if (targetDayInput === null) return;
  const targetDay = Number(targetDayInput);

  if (!Number.isInteger(targetWeek) || targetWeek < 1 || targetWeek > 4) {
    alert("Podaj tydzień od 1 do 4.");
    return;
  }
  if (!Number.isInteger(targetDay) || targetDay < 1 || targetDay > 7) {
    alert("Podaj dzień od 1 do 7.");
    return;
  }

  const sourceKey = `${sourceWeek}-${sourceDay}`;
  const targetKey = `${targetWeek}-${targetDay}`;
  if (sourceKey === targetKey) {
    alert("Wybrano ten sam dzień - nic nie skopiowano.");
    return;
  }

  const state = getPlannerState();
  const sourceEntry = state[sourceKey] || {
    meal1: planData.defaultPlan?.[String(sourceWeek)]?.[sourceDay - 1]?.meal1 || "",
    meal2: planData.defaultPlan?.[String(sourceWeek)]?.[sourceDay - 1]?.meal2 || "",
    meal3: planData.defaultPlan?.[String(sourceWeek)]?.[sourceDay - 1]?.meal3 || "",
    snack: planData.defaultPlan?.[String(sourceWeek)]?.[sourceDay - 1]?.snack || ""
  };

  state[targetKey] = { ...sourceEntry };
  setPlannerState(state);
  await savePlannerEntryRemote(targetWeek, targetDay, state[targetKey]);

  renderPlanTables();
  alert(`Skopiowano plan z tygodnia ${sourceWeek}, dnia ${sourceDay} na tydzień ${targetWeek}, dzień ${targetDay}.`);
}

function renderPlanTables() {
  const filter = ui.weekFilter.value || "all";
  const weeks = filter === "all" ? [1, 2, 3, 4] : [Number(filter)];
  const dp = planData.defaultPlan || {};
  const plannerState = getPlannerState();

  ui.planTables.innerHTML = weeks.map((w) => {
    const rows = Array.from({ length: 7 }, (_, idx) => {
      const day = idx + 1;
      const base = dp[String(w)]?.[idx] || {};
      const local = plannerState[`${w}-${day}`] || {};

      return {
        day,
        meal1: local.meal1 ?? base.meal1 ?? "",
        meal2: local.meal2 ?? base.meal2 ?? "",
        meal3: local.meal3 ?? base.meal3 ?? "",
        snack: local.snack ?? base.snack ?? ""
      };
    });

    const hasAnyMeal = rows.some((row) => slotConfig.some((slot) => row[slot.id]));
    if (!hasAnyMeal) return `<h3>Tydzień ${w}</h3><p>Brak danych planu.</p>`;

    const totalForRow = (row) =>
      slotConfig.reduce((sum, slot) => sum + (recipesById[row[slot.id]]?.kcal || 0), 0);

    return `
      <h3>Tydzień ${w}</h3>
      <div class="table-scroll table-scroll--responsive">
        <table class="plan-table">
          <thead>
            <tr>
              <th>Dzień</th>
              ${slotConfig.map((s) => `<th>${s.label}</th>`).join("")}
              <th>Suma kcal</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, idx) => `
              <tr class="plan-row">
                <th scope="row" class="plan-day-cell" data-label="Dzień">${weekdayNames[idx] || `Dzień ${row.day}`}</th>
                ${slotConfig.map((slot) => `
                  <td class="plan-meal-cell" data-label="${slot.label}">${planRecipeCell(row[slot.id])}</td>
                `).join("")}
                <td class="plan-sum-cell" data-label="Suma kcal">${totalForRow(row) || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }).join("");
}

function getPlannedDayEntry(week, day) {
  const state = getPlannerState();
  const key = `${week}-${day}`;
  const base = planData.defaultPlan?.[String(week)]?.[day - 1] || {};
  const local = state[key] || {};
  return {
    meal1: local.meal1 ?? base.meal1 ?? "",
    meal2: local.meal2 ?? base.meal2 ?? "",
    meal3: local.meal3 ?? base.meal3 ?? "",
    snack: local.snack ?? base.snack ?? ""
  };
}

function simplifyShoppingIngredientLine(line) {
  let s = String(line || "").trim();
  if (!s) return s;

  s = s.replace(/\s+lub\s+do\s+smaku\.?/gi, "");
  s = s.replace(/\s+lub\s+wg\s+uznania\.?/gi, "");
  s = s.replace(/\s+do\s+smaku\.?/gi, "");
  s = s.replace(/\s+wg\s+uznania\.?/gi, "");
  s = s.replace(/\s+według\s+uznania\.?/gi, "");
  s = s.replace(/\s+opcjonalnie\.?/gi, "");
  s = s.replace(/\s+albo\s+wg\s+uznania\.?/gi, "");

  s = s.replace(/\s+[-–—]\s+(?=\d)/g, " ");
  s = s.replace(/\s+/g, " ").trim();

  s = s.replace(/(\d+(?:[.,]\d+)?)\s+(g|kg|ml|l)\b/gi, (_, num, unit) => {
    const n = String(num).replace(",", ".");
    return `${n}${String(unit).toLowerCase()}`;
  });

  s = s.replace(/(\d+(?:[.,]\d+)?)\s+(szt\.?)\b/gi, (_, num) => {
    const n = String(num).replace(",", ".");
    return `${n} szt`;
  });

  return s.replace(/\s+/g, " ").trim();
}

const SHOPPING_CATEGORY_ORDER = [
  "Warzywa i owoce",
  "Mięso, drób i ryby",
  "Nabiał, jaja i tofu",
  "Pieczywo i wypieki",
  "Kasze, ryż, makaron i strączki",
  "Mąka, płatki i skrobie",
  "Orzechy, nasiona i suszone owoce",
  "Oleje, oliwy i tłuszcze",
  "Napoje i buliony",
  "Słodzidła, przyprawy i sosy",
  "Inne"
];

const SHOPPING_CATEGORY_RULES = [
  {
    title: "Warzywa i owoce",
    patterns: [
      "fasolka szparagowa", "groszek zielony", "mix sałat", "sałata", "rukola", "roszponka",
      "pomidor", "ogórek", "papryka", "cukinia", "brokuł", "marchew", "kapusta", "seler naciowy",
      "kalafior", "szparag", "bakłażan", "dynia", "pieczark", "burak", "cebula", "czosnek",
      "ziemniak", "batat", "topinambur", "por ", " rzodkiew", "kalarepa", "botwina", "szpinak",
      "banan", "jabłk", "pomarańcz", "grejpfrut", "cytryn", "kiwi", "malin", "truskawk",
      "borówk", "jagod", "wiśni", "czeresn", "winogron", "mango", "ananas", "śliwk", "sliwk",
      "brzoskwin", "gruszk", "awokado", "kaki", "mandaryn", "melon", "arbuz", "granat"
    ]
  },
  {
    title: "Mięso, drób i ryby",
    patterns: [
      "mięso mielone", "mielone mięso", "pulpety", "pierś z kurczaka", "pierś z indyka",
      "kurczak", "indyk", "wieprz", "wołow", "schab", "polędwic", "rostbef", "boczek", "szynk",
      "mięso", "mielone drobiowe", "tuńczyk", "łosoś", "dorsz", "mintaj", "pstrąg", "śledź",
      "makrel", "sandacz", "halibut", "morszczuk", "krewet", "dorsz", "drob", "indycze"
    ]
  },
  {
    title: "Nabiał, jaja i tofu",
    patterns: [
      "twaróg", "serek wiejski", "ser twarogowy", "skyr", "jogurt", "kefir", "mascarpone",
      "ricotta", "mozzarella", "feta", "parmezan", "camembert", "ser żółty", "ser feta",
      "śmietank", "śmietan", "serek śmietankowy", "jajk", "jajko", "mleko", "tofu", "halloumi",
      "burrat", "gouda", "brie"
    ]
  },
  {
    title: "Pieczywo i wypieki",
    patterns: [
      "croissant", "bagiet", "bułka", "chleb", "tortilla", "wrap", "pita", "bajgiel", "grahamka",
      "pieczywo", "ciabatta", "tost pełnoziarnisty"
    ]
  },
  {
    title: "Kasze, ryż, makaron i strączki",
    patterns: [
      "kasza gryczana", "kasza jaglana", "kasza pęczak", "kasza bulgur", "kasza jęczmienna",
      "kasza owsiana", "komosa ryżowa", "quinoa", "ryż basmati", "ryż brązowy", "ryż biały",
      "ryż dziki", "makaron pełnoziarnisty", "makaron gryczany", "makaron ", "ciecierzyca",
      "soczewica", "groch", "fasola", "soja", "edamame", "kasza"
    ]
  },
  {
    title: "Mąka, płatki i skrobie",
    patterns: [
      "mąka", "płatki owsiane", "płatki jaglane", "płatki gryczane", "płatki ", "skrobia",
      "bułka tarta", "kakao", "proszek do pieczenia"
    ]
  },
  {
    title: "Orzechy, nasiona i suszone owoce",
    patterns: [
      "masło orzechowe", "orzech", "migdał", "nerkowiec", "pistacj", "pekan", "arachid",
      "sezam", "chia", "siemię lniane", "pestki", "wiórki kokosowe", "nasiona", "suszony",
      "rodzynk", "figi suszone", "morele suszone"
    ]
  },
  {
    title: "Oleje, oliwy i tłuszcze",
    patterns: [
      "oliwa z oliwek", "oliwa", "olej rzepakowy", "olej kokosowy", "olej sezamowy", "olej lniany",
      " olej ", "masło klarowane", "smalec", "ghee", " masło "
    ]
  },
  {
    title: "Napoje i buliony",
    patterns: [
      "napój sojowy", "napój owsiany", "napój migdałowy", "napój kokosowy", "bulion warzywny",
      "bulion drobiowy", "bulion wołowy", "kostka bulion", "woda mineralna", "woda ",
      "herbata", "kawa", "napar", "sok ", "smoothie"
    ]
  },
  {
    title: "Słodzidła, przyprawy i sosy",
    patterns: [
      "erytrol", "ksylitol", "stewia", "miód", "syrop klonowy", "syrop z agawy", "cukier",
      "wanili", "cynamon", "kardamon", "curry", "kurkuma", "imbir mielony", "papryka słodka",
      "papryka ostra", "ziele angielskie", "laur", "goździk", "majeranek", "tymianek", "oregano",
      "bazylia", "natka", "koperek", "koper włoski", "chrzan", "musztard", "majonez", "ketchup",
      "sos sojowy", "sos ", "ocet", "balsamiczny", "sól", "pieprz", "zioła", "bulion w proszku",
      "przypraw", "ekstrakt waniliowy", "aromat"
    ]
  }
];

function normalizeShoppingText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function categorizeShoppingIngredient(line) {
  const n = normalizeShoppingText(line);
  let bestTitle = "Inne";
  let bestLen = 0;
  for (const rule of SHOPPING_CATEGORY_RULES) {
    for (const p of rule.patterns) {
      const np = normalizeShoppingText(p);
      if (!np.length) continue;
      if (n.includes(np) && np.length >= bestLen) {
        bestLen = np.length;
        bestTitle = rule.title;
      }
    }
  }
  return bestTitle;
}

function formatShoppingListByCategory(title, ingredientLines) {
  const groups = new Map();
  for (const raw of ingredientLines) {
    const line = raw.trim();
    if (!line) continue;
    const cat = categorizeShoppingIngredient(line);
    if (!groups.has(cat)) groups.set(cat, new Set());
    groups.get(cat).add(line);
  }

  const parts = [title, ""];
  for (const catTitle of SHOPPING_CATEGORY_ORDER) {
    const set = groups.get(catTitle);
    if (!set || !set.size) continue;
    parts.push(catTitle);
    [...set].sort((a, b) => a.localeCompare(b, "pl", { sensitivity: "base" })).forEach((item) => {
      parts.push(`- ${item}`);
    });
    parts.push("");
  }
  return parts.join("\n").replace(/\n+$/, "");
}

function generateShoppingList() {
  const scope = ui.shoppingScope.value;
  const week = Number(ui.shoppingWeekSelect.value || selectedWeek);
  const day = Number(ui.shoppingDaySelect.value || selectedDay);

  const recipeIds = [];
  if (scope === "week") {
    for (let d = 1; d <= 7; d++) {
      const row = getPlannedDayEntry(week, d);
      slotConfig.forEach((slot) => {
        if (row[slot.id]) recipeIds.push(row[slot.id]);
      });
    }
  } else {
    const row = getPlannedDayEntry(week, day);
    slotConfig.forEach((slot) => {
      if (row[slot.id]) recipeIds.push(row[slot.id]);
    });
  }

  const uniqueRecipeIds = Array.from(new Set(recipeIds));
  if (!uniqueRecipeIds.length) {
    ui.shoppingOutput.value = "Brak wybranych przepisów w tym zakresie.";
    return;
  }

  const ingredients = [];
  uniqueRecipeIds.forEach((id) => {
    const recipe = recipesById[id];
    if (!recipe) return;
    (recipe.ingredients || []).forEach((ing) => {
      const cleaned = simplifyShoppingIngredientLine(ing);
      if (cleaned) ingredients.push(cleaned);
    });
  });

  const title = scope === "week"
    ? `Lista zakupów - tydzień ${week}`
    : `Lista zakupów - tydzień ${week}, dzień ${day}`;
  ui.shoppingOutput.value = formatShoppingListByCategory(title, ingredients);
}

async function copyShoppingList() {
  const text = ui.shoppingOutput.value.trim();
  if (!text) {
    alert("Najpierw wygeneruj listę zakupów.");
    return;
  }
  await navigator.clipboard.writeText(text);
  alert("Lista zakupów skopiowana.");
}

async function shareShoppingList() {
  const text = ui.shoppingOutput.value.trim();
  if (!text) {
    alert("Najpierw wygeneruj listę zakupów.");
    return;
  }

  if (navigator.share) {
    await navigator.share({ title: "Lista zakupów", text });
    return;
  }
  await navigator.clipboard.writeText(text);
  alert("Udostępnianie niedostępne. Lista została skopiowana do schowka.");
}

function canRecipeFitSlot(recipeId, slotId) {
  const recipe = recipesById[recipeId];
  if (!recipe) return false;
  const slot = slotConfig.find((s) => s.id === slotId);
  if (!slot) return false;
  const categories = recipe.categories || [];
  if (slot.category === "sniadanie" || slot.category === "kolacja") {
    return categories.includes("sniadanie") || categories.includes("kolacja");
  }
  return categories.includes(slot.category);
}

function recipesAllowedForSlot(slotId) {
  const slot = slotConfig.find((s) => s.id === slotId);
  if (!slot) return [];
  const allowedCategories = slot.category === "sniadanie" || slot.category === "kolacja"
    ? ["sniadanie", "kolacja"]
    : [slot.category];
  return recipes.filter((r) =>
    (r.categories || []).some((cat) => allowedCategories.includes(cat))
  );
}

function pickRecipeForSlotGreedy(slotId, idealKcal, usageCount) {
  const pool = recipesAllowedForSlot(slotId);
  if (!pool.length) return "";
  let best = pool[0];
  let bestScore = Infinity;
  for (const r of pool) {
    const kcal = Number(r.kcal) || 0;
    const fit = Math.abs(kcal - idealKcal);
    const diversity = (usageCount[r.id] || 0) * 22;
    const score = fit + diversity;
    if (score < bestScore) {
      bestScore = score;
      best = r;
    } else if (score === bestScore && r.id < best.id) {
      best = r;
    }
  }
  return best.id;
}

async function autoFillFullPlan() {
  if (!recipes.length) {
    alert("Brak przepisów — nie można ułożyć planu.");
    return;
  }
  if (!confirm("Zastąpić plan wszystkich 28 dni automatycznym doborem przepisów? Obecne wybory w planerze zostaną nadpisane.")) {
    return;
  }

  ui.autoPlanBtn.disabled = true;
  const target = getTargetKcal();
  const usage = {};
  const slotOrder = ["meal2", "meal1", "meal3", "snack"];
  const state = getPlannerState();

  for (let week = 1; week <= 4; week++) {
    for (let day = 1; day <= 7; day++) {
      const key = `${week}-${day}`;
      const row = { meal1: "", meal2: "", meal3: "", snack: "" };
      let remaining = target;

      for (let si = 0; si < slotOrder.length; si++) {
        const slotId = slotOrder[si];
        const slotsLeft = slotOrder.length - si;
        const pool = recipesAllowedForSlot(slotId);
        if (!pool.length) {
          row[slotId] = "";
          continue;
        }
        const ideal = Math.max(80, remaining / slotsLeft);
        const id = pickRecipeForSlotGreedy(slotId, ideal, usage);
        if (!id) {
          row[slotId] = "";
          continue;
        }
        row[slotId] = id;
        remaining -= Number(recipesById[id]?.kcal) || 0;
        usage[id] = (usage[id] || 0) + 1;
      }

      state[key] = row;
    }
  }

  setPlannerState(state);

  const saves = [];
  for (let week = 1; week <= 4; week++) {
    for (let day = 1; day <= 7; day++) {
      const key = `${week}-${day}`;
      saves.push(savePlannerEntryRemote(week, day, state[key]));
    }
  }
  try {
    await Promise.all(saves);
  } finally {
    ui.autoPlanBtn.disabled = false;
  }

  renderPlanner();
  renderPlanTables();
  alert("Ułożono plan na 28 dni (kategorie slotów + zbliżenie do celu kcal, z rotacją przepisów).");
}

function getFocusRecipeForAssistant() {
  const id = ui.consultTargetRecipe.value;
  const r = recipesById[id];
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    kcal: r.kcal,
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    categories: r.categories || []
  };
}

function renderConsultRecipeContext() {
  const r = recipesById[ui.consultTargetRecipe.value];
  if (!r) {
    ui.consultRecipeContext.innerHTML = "<p>Wybierz przepis z listy.</p>";
    return;
  }
  ui.consultRecipeContext.innerHTML = `
    <h3>${escapeHtml(r.title)}</h3>
    <p class="recipe-meta">${r.kcal} kcal</p>
    <p><strong>Składniki</strong></p>
    <ul>${(r.ingredients || []).map((ing) => `<li>${escapeHtml(ing)}</li>`).join("")}</ul>
    <p><strong>Wykonanie</strong></p>
    <ol>${(r.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
  `;
}

function refreshConsultRecipeOptions() {
  const q = ui.consultRecipeSearch.value.trim().toLowerCase();
  const filtered = recipes.filter((r) => `${r.id} ${r.title}`.toLowerCase().includes(q));
  const prev = ui.consultTargetRecipe.value;
  ui.consultTargetRecipe.innerHTML = filtered
    .map((r) => `<option value="${r.id}">${r.id} - ${escapeHtml(r.title)} (${r.kcal} kcal)</option>`)
    .join("");
  if (filtered.some((r) => r.id === prev)) {
    ui.consultTargetRecipe.value = prev;
  } else if (filtered[0]) {
    ui.consultTargetRecipe.value = filtered[0].id;
  }
  renderConsultRecipeContext();
}

async function askDietAssistant() {
  const message = ui.consultPrompt.value.trim();
  if (!message) {
    alert("Wpisz pytanie do asystenta.");
    return;
  }
  await askDietAssistantWithMessage(message, { forceRecipePatch: false });
}

async function askForRecipePatchProposal() {
  const focus = getFocusRecipeForAssistant();
  if (!focus) {
    alert("Wybierz przepis z listy.");
    return;
  }
  const userIntent = ui.consultPrompt.value.trim()
    || "Zaproponuj zmiany w składnikach i krokach zgodnie z typową dietą redukcyjną, zachowując sens posiłku.";
  const message = `Pracujesz wyłącznie nad przepisem ${focus.id} (${focus.title}). ${userIntent}`;
  await askDietAssistantWithMessage(message, { forceRecipePatch: true });
}

async function askDietAssistantWithMessage(message, options = {}) {
  const focus = getFocusRecipeForAssistant();
  if (!focus) {
    alert("Wybierz przepis z listy.");
    return;
  }

  ui.consultAskBtn.disabled = true;
  ui.consultProposeRecipeBtn.disabled = true;
  ui.consultResponse.textContent = "Przetwarzam...";
  ui.consultRecipePatch.innerHTML = "";
  pendingRecipePatch = null;

  try {
    const response = await fetch("/api/chat-diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode: "recipe",
        context: { focusRecipe: focus },
        forceRecipePatch: Boolean(options.forceRecipePatch)
      })
    });
    if (!response.ok) throw new Error("Błąd połączenia z asystentem.");

    const data = await response.json();
    const answer = data.answer || "Brak odpowiedzi.";
    pendingRecipePatch = data.recipePatch || null;

    let shown = answer;
    if (options.forceRecipePatch && !pendingRecipePatch) {
      shown += "\n\n(Uwaga: nie udało się odczytać propozycji zmian przepisu — doprecyzuj pytanie lub spróbuj ponownie.)";
    }
    ui.consultResponse.textContent = shown;
    renderPendingRecipePatch();
    await saveConsultHistory(message, answer, [{ kind: "recipe_patch", recipeId: focus.id, patch: pendingRecipePatch }]);
    ui.consultPrompt.value = "";
  } catch (err) {
    ui.consultResponse.textContent = err.message || "Nie udało się połączyć z asystentem.";
    pendingRecipePatch = null;
    renderPendingRecipePatch();
  } finally {
    ui.consultAskBtn.disabled = false;
    ui.consultProposeRecipeBtn.disabled = false;
  }
}

function renderPendingRecipePatch() {
  if (!pendingRecipePatch) {
    ui.consultRecipePatch.innerHTML = "";
    return;
  }
  const { title, kcal, ingredients, steps, reason, recipeId } = pendingRecipePatch;
  let html = `<div class="change-item"><p><strong>Propozycja zmian w przepisie ${escapeHtml(recipeId || "")}</strong></p>`;
  if (reason) html += `<p>${escapeHtml(reason)}</p>`;
  if (title) html += `<p><strong>Tytuł:</strong> ${escapeHtml(title)}</p>`;
  if (kcal != null) html += `<p><strong>kcal:</strong> ${escapeHtml(String(kcal))}</p>`;
  if (ingredients?.length) {
    html += `<p><strong>Składniki (propozycja)</strong></p><ul>${ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  }
  if (steps?.length) {
    html += `<p><strong>Wykonanie (propozycja)</strong></p><ol>${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`;
  }
  html += `<p><button type="button" id="applyRecipePatchBtn" class="btn">Zastosuj w przepisie</button></p></div>`;
  ui.consultRecipePatch.innerHTML = html;
  document.getElementById("applyRecipePatchBtn")?.addEventListener("click", applyPendingRecipePatchToRecipe);
}

function applyPendingRecipePatchToRecipe() {
  if (!pendingRecipePatch?.recipeId) return;
  const id = pendingRecipePatch.recipeId;
  const base = recipesById[id];
  if (!base) return;

  const overrides = loadRecipeOverrides();
  const prev = overrides[id] || {};
  const nextStore = { ...prev };
  if (pendingRecipePatch.title) nextStore.title = pendingRecipePatch.title;
  if (pendingRecipePatch.kcal != null) nextStore.kcal = pendingRecipePatch.kcal;
  if (pendingRecipePatch.ingredients) nextStore.ingredients = pendingRecipePatch.ingredients;
  if (pendingRecipePatch.steps) nextStore.steps = pendingRecipePatch.steps;
  overrides[id] = nextStore;
  saveRecipeOverrides(overrides);

  const updated = mergeRecipeFromStored(base, nextStore);
  recipes = recipes.map((r) => (r.id === id ? updated : r));
  recipesById[id] = updated;

  pendingRecipePatch = null;
  renderPendingRecipePatch();
  renderConsultRecipeContext();
  renderRecipes();
  renderPlanner();
  renderPlanTables();
  alert("Zaktualizowano przepis w aplikacji (zapis lokalny dla tego profilu).");
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
  const isOriginalDriedFruit = isDriedFruit(originalNorm);
  const isTargetDriedFruit = isDriedFruit(targetNorm);

  const originalFruitKey = Object.keys(fruitEq).find((k) => containsAlias(originalNorm, k));
  const targetFruitKey = Object.keys(fruitEq).find((k) => containsAlias(targetNorm, k));

  // owoce świeże <-> suszone
  if (originalFruitKey && isTargetDriedFruit) {
    return Math.round((grams * 20) / 150);
  }
  if (isOriginalDriedFruit && targetFruitKey) {
    return Math.round((grams * 150) / 20);
  }

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

function isDriedFruit(textNorm) {
  return textNorm.includes("susz")
    || textNorm.includes("rodzyn")
    || textNorm.includes("daktyl")
    || textNorm.includes("morela suszona")
    || textNorm.includes("sliwka suszona")
    || textNorm.includes("zurawina suszona");
}

function formatCategory(c) {
  if (c === "sniadanie") return "śniadanie";
  if (c === "obiad") return "obiad";
  if (c === "kolacja") return "kolacja";
  return "przekąska";
}

async function saveMetric() {
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
  await saveMetricsRemote(entry);

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
  try { history = JSON.parse(localStorage.getItem(metricsKey()) || "[]"); } catch {}

  const latest = history[history.length - 1];
  ui.bmiNow.textContent = latest ? `BMI: ${latest.bmi} (${bmiLabel(latest.bmi)})` : "BMI: -";

  if (!history.length) {
    ui.metricsTable.innerHTML = "<p>Brak zapisanych pomiarów.</p>";
    return;
  }

  const metricCols = [
    { key: "date", label: "Data", val: (h) => h.date },
    { key: "gender", label: "Płeć", val: (h) => h.gender },
    { key: "age", label: "Wiek", val: (h) => h.age ?? "" },
    { key: "weight", label: "Waga", val: (h) => h.weight ?? "" },
    { key: "height", label: "Wzrost", val: (h) => h.height ?? "" },
    { key: "waist", label: "Talia", val: (h) => h.waist ?? "" },
    { key: "chest", label: "Klatka/Biust", val: (h) => h.chest ?? "" },
    { key: "hips", label: "Biodra", val: (h) => h.hips ?? "" },
    { key: "bmi", label: "BMI", val: (h) => `${h.bmi} (${bmiLabel(h.bmi)})` }
  ];

  ui.metricsTable.innerHTML = `
    <div class="table-scroll table-scroll--responsive">
      <table class="metric-table">
        <thead>
          <tr>
            ${metricCols.map((c) => `<th>${c.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${history.map((h) => `
            <tr class="metric-row">
              ${metricCols.map((c) => `<td data-label="${c.label}">${c.val(h)}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function initMenu() {
  ui.menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  });
}

function showSection(sectionKey) {
  Object.entries(ui.sections).forEach(([key, section]) => {
    section.classList.toggle("is-active", key === sectionKey);
  });

  ui.menuButtons.forEach((btn) => {
    const active = btn.dataset.section === sectionKey;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function getTargetKcal() {
  const localTarget = loadProfileSettings().targetKcal;
  return localTarget || planData.targetKcal || 2100;
}

function loadProfileSettings() {
  try {
    return JSON.parse(localStorage.getItem(settingsKey()) || "{}");
  } catch {
    return {};
  }
}

function fillSettingsFromState() {
  const settings = loadProfileSettings();
  ui.targetKcalInput.value = settings.targetKcal || planData.targetKcal || 2100;
  ui.themeSelect.value = document.body.dataset.theme || "dark";
}

async function saveSettings() {
  const targetKcal = Number(ui.targetKcalInput.value);
  if (!targetKcal || targetKcal < 1000 || targetKcal > 6000) {
    alert("Podaj cel kcal w zakresie 1000-6000.");
    return;
  }

  const settings = {
    targetKcal,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(settingsKey(), JSON.stringify(settings));
  applyTheme(ui.themeSelect.value);
  await saveSettingsRemote(targetKcal);

  ui.heroKcal.textContent = `Cel: ${getTargetKcal()} kcal dziennie`;
  renderPlanner();
  renderPlanTables();
  alert("Ustawienia zapisane.");
}

function resetPlannerForCurrentProfile() {
  if (!confirm("Na pewno zresetować planer dla tego profilu?")) return;
  localStorage.removeItem(plannerKey());
  if (supabase && authUser) {
    supabase.from("planner_entries")
      .delete()
      .eq("user_id", authUser.id)
      .eq("profile_id", currentProfile);
  }
  renderPlanner();
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  if (ui.themeSelect) ui.themeSelect.value = nextTheme;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", nextTheme === "light" ? "#f4f6ff" : "#0b1020");
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
