import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_KEY = "diet-app-v3";
const ACTIVE_PROFILE_KEY = "diet-active-profile";
const THEME_KEY = "diet-theme";
const ONBOARDING_KEY = "diet-onboarding-v1";
const MEAL_REMINDER_IDS = { meal1: 7101, meal2: 7102, meal3: 7103, snack: 7104 };
const DEFAULT_REMINDER_TIMES = {
  meal1: "08:00",
  meal2: "13:00",
  snack: "16:30",
  meal3: "19:00"
};
const REMINDER_PRESETS = {
  early: { meal1: "06:30", meal2: "11:30", snack: "15:30", meal3: "18:30" },
  standard: { meal1: "08:00", meal2: "13:00", snack: "16:30", meal3: "19:00" },
  late: { meal1: "09:30", meal2: "14:30", snack: "18:00", meal3: "21:00" }
};

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
    photoMeals: document.getElementById("section-photoMeals"),
    settings: document.getElementById("section-settings")
  },
  weekSelect: document.getElementById("weekSelect"),
  daySelect: document.getElementById("daySelect"),
  weekFilter: document.getElementById("weekFilter"),
  slotWrap: document.getElementById("slotWrap"),
  dayKcal: document.getElementById("dayKcal"),
  kcalDiff: document.getElementById("kcalDiff"),
  dayCompletion: document.getElementById("dayCompletion"),
  recipeSearch: document.getElementById("recipeSearch"),
  recipeCategoryFilter: document.getElementById("recipeCategoryFilter"),
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
  metricsProgress: document.getElementById("metricsProgress"),
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
  consultForceRecipePatch: document.getElementById("consultForceRecipePatch"),
  consultResponse: document.getElementById("consultResponse"),
  consultRecipeContext: document.getElementById("consultRecipeContext"),
  consultRecipePatch: document.getElementById("consultRecipePatch"),
  consultPatchHint: document.getElementById("consultPatchHint"),

  themeSelect: document.getElementById("themeSelect"),
  targetKcalInput: document.getElementById("targetKcalInput"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  resetPlannerBtn: document.getElementById("resetPlannerBtn"),
  syncLunchesBtn: document.getElementById("syncLunchesBtn"),
  reminderPreset: document.getElementById("reminderPreset"),
  reminderMeal1Time: document.getElementById("reminderMeal1Time"),
  reminderMeal2Time: document.getElementById("reminderMeal2Time"),
  reminderSnackTime: document.getElementById("reminderSnackTime"),
  reminderMeal3Time: document.getElementById("reminderMeal3Time"),
  enableMealRemindersBtn: document.getElementById("enableMealRemindersBtn"),
  disableMealRemindersBtn: document.getElementById("disableMealRemindersBtn"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importBackupBtn: document.getElementById("importBackupBtn"),
  importBackupInput: document.getElementById("importBackupInput"),
  saveAsNewPlanBtn: document.getElementById("saveAsNewPlanBtn"),
  newProfileName: document.getElementById("newProfileName"),
  createProfileBtn: document.getElementById("createProfileBtn"),
  newRecipeTitle: document.getElementById("newRecipeTitle"),
  newRecipeKcal: document.getElementById("newRecipeKcal"),
  newRecipeCategories: document.getElementById("newRecipeCategories"),
  newRecipeIngredients: document.getElementById("newRecipeIngredients"),
  newRecipeSteps: document.getElementById("newRecipeSteps"),
  addRecipeBtn: document.getElementById("addRecipeBtn"),
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
  consultRecipeSearch: document.getElementById("consultRecipeSearch"),
  photoMealDate: document.getElementById("photoMealDate"),
  photoMealSlot: document.getElementById("photoMealSlot"),
  photoMealImage: document.getElementById("photoMealImage"),
  photoMealNote: document.getElementById("photoMealNote"),
  photoMealAnalyzeBtn: document.getElementById("photoMealAnalyzeBtn"),
  photoMealResult: document.getElementById("photoMealResult"),
  photoMealHistory: document.getElementById("photoMealHistory"),
  onboardingBackdrop: document.getElementById("onboardingBackdrop"),
  onboardingCloseBtn: document.getElementById("onboardingCloseBtn")
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
let runtimeConfig = {};

init();

async function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || "dark");
  await initSupabase();
  fillWeekDaySelectors();
  initMenu();
  bindEvents();
  initShoppingSelectors();
  await restoreSessionAndBootstrap();
  renderOnboardingIfNeeded();
}

async function initSupabase() {
  const sources = ["runtime-config.json", "/api/runtime-config"];
  for (const source of sources) {
    try {
      const res = await fetch(source, { cache: "no-store" });
      if (!res.ok) continue;
      const config = await res.json();
      runtimeConfig = config && typeof config === "object" ? config : {};
      if (!config.supabaseUrl || !config.supabaseAnonKey) continue;
      supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      return;
    } catch {
      // Try the next source.
    }
  }
  runtimeConfig = {};
  supabase = null;
}

function chatDietEndpoint() {
  const rawBase = String(runtimeConfig?.apiBaseUrl || "").trim();
  if (!rawBase) return "/api/chat-diet";
  const cleanBase = rawBase.replace(/\/+$/, "");
  return `${cleanBase}/api/chat-diet`;
}

function mealPhotoEndpoint() {
  const rawBase = String(runtimeConfig?.apiBaseUrl || "").trim();
  if (!rawBase) return "/api/meal-photo-estimate";
  const cleanBase = rawBase.replace(/\/+$/, "");
  return `${cleanBase}/api/meal-photo-estimate`;
}

async function restoreSessionAndBootstrap() {
  if (!supabase) {
    await loadProfiles();
    setAuthUi(null, "Tryb lokalny (bez logowania).", true);
    await switchProfile(currentProfile);
    return;
  }

  const { data } = await supabase.auth.getSession();
  authUser = data.session?.user || null;
  setAuthUi(authUser);

  if (authUser) {
    await loadProfiles();
    if (!currentProfile) return;
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
  if (ui.createProfileBtn) ui.createProfileBtn.disabled = !signed;
  if (ui.newProfileName) ui.newProfileName.disabled = !signed;
  ui.appShell.forEach((el) => el.classList.toggle("hidden", !signed && !forceShowApp));
  ui.authCard.classList.toggle("hidden", signed || forceShowApp);
  refreshHeroKcal();
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
  await loadProfiles();
  if (!currentProfile) return;
  await switchProfile(currentProfile);
  await pullRemoteState();
}

async function logoutUser() {
  if (!supabase) return;
  await supabase.auth.signOut();
  authUser = null;
  setAuthUi(null, "Wylogowano.");
  profiles = [];
  currentProfile = "";
  ui.profileSelect.innerHTML = "";
  ui.profileSelect.disabled = true;
}

async function pullRemoteState() {
  if (!supabase || !authUser || !currentProfile) return;
  await ensureUserProfile();

  const profile = await loadRemoteProfileSettings();
  if (profile) localStorage.setItem(settingsKey(), JSON.stringify(profile));
  if (profile?.mealChecks && typeof profile.mealChecks === "object") {
    localStorage.setItem(mealChecksKey(), JSON.stringify(profile.mealChecks));
  } else {
    const localChecks = getMealChecksState();
    if (Object.keys(localChecks).length) {
      await saveSettingsRemote(Number(loadProfileSettings().targetKcal || getTargetKcal()), currentProfile);
    }
  }

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

  const photoLogs = await loadMealPhotoLogsRemote();
  if (photoLogs?.length) {
    setPhotoMealsState(photoLogs);
  }

  renderPlanner();
  renderPlanTables();
  renderMetrics();
  renderPhotoMealHistory();
  fillSettingsFromState();
  applyStickyMetricFormDefaults({ setTodayDate: false });
}

async function ensureUserProfile(profileId = currentProfile) {
  if (!supabase || !authUser || !profileId) return;
  const payload = {
    user_id: authUser.id,
    profile_id: profileId,
    target_kcal: Number(loadProfileSettings().targetKcal || planData.targetKcal || 2100),
    theme: document.body.dataset.theme || "dark",
    meal_checks: getMealChecksState(),
    reminder_times: normalizeReminderTimes(loadProfileSettings().reminderTimes),
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id,profile_id" });
  if (!error) return;
  // Fallback for older schema without meal_checks/reminder_times columns.
  await supabase.from("profiles").upsert({
    user_id: authUser.id,
    profile_id: profileId,
    target_kcal: payload.target_kcal,
    theme: payload.theme,
    updated_at: payload.updated_at
  }, { onConflict: "user_id,profile_id" });
}

async function loadRemoteProfileSettings() {
  let data = null;
  let fullError = null;
  const full = await supabase
    .from("profiles")
    .select("target_kcal,theme,meal_checks,reminder_times")
    .eq("user_id", authUser.id)
    .eq("profile_id", currentProfile)
    .maybeSingle();
  data = full.data || null;
  fullError = full.error;
  if (fullError) {
    const legacy = await supabase
      .from("profiles")
      .select("target_kcal,theme")
      .eq("user_id", authUser.id)
      .eq("profile_id", currentProfile)
      .maybeSingle();
    data = legacy.data || null;
  }
  if (!data) return null;
  if (data.theme) applyTheme(data.theme);
  return {
    targetKcal: data.target_kcal,
    reminderTimes: normalizeReminderTimes(data.reminder_times),
    mealChecks: data.meal_checks && typeof data.meal_checks === "object" ? data.meal_checks : {},
    updatedAt: new Date().toISOString()
  };
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

async function savePlannerEntryRemote(week, day, entry, profileId = currentProfile) {
  if (!supabase || !authUser || !profileId) return;
  await supabase.from("planner_entries").upsert({
    user_id: authUser.id,
    profile_id: profileId,
    week,
    day,
    meal1: entry.meal1 || "",
    meal2: entry.meal2 || "",
    meal3: entry.meal3 || "",
    snack: entry.snack || "",
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,profile_id,week,day" });
}

async function saveSettingsRemote(targetKcal, profileId = currentProfile) {
  if (!supabase || !authUser || !profileId) return;
  await ensureUserProfile(profileId);
  const payload = {
    user_id: authUser.id,
    profile_id: profileId,
    target_kcal: targetKcal,
    theme: document.body.dataset.theme || "dark",
    meal_checks: getMealChecksState(),
    reminder_times: normalizeReminderTimes(loadProfileSettings().reminderTimes),
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id,profile_id" });
  if (!error) return;
  await supabase.from("profiles").upsert({
    user_id: payload.user_id,
    profile_id: payload.profile_id,
    target_kcal: payload.target_kcal,
    theme: payload.theme,
    updated_at: payload.updated_at
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

async function loadUserRecipesRemote(profileId = currentProfile) {
  if (!supabase || !authUser || !profileId) return [];
  const { data, error } = await supabase
    .from("user_recipes")
    .select("recipe_id,title,kcal,ingredients,steps,categories")
    .eq("user_id", authUser.id)
    .eq("profile_id", profileId);
  if (error) return [];
  return data || [];
}

function mergeRecipesWithUserEntries(baseRecipes, userRows) {
  if (!Array.isArray(userRows) || !userRows.length) return baseRecipes;
  const merged = Object.fromEntries(baseRecipes.map((r) => [r.id, { ...r }]));
  userRows.forEach((row) => {
    merged[row.recipe_id] = {
      id: row.recipe_id,
      title: row.title,
      kcal: Number(row.kcal || 0),
      ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
      steps: Array.isArray(row.steps) ? row.steps : [],
      categories: Array.isArray(row.categories) ? row.categories : []
    };
  });
  return Object.values(merged);
}

async function upsertUserRecipeRemote(recipe, profileId = currentProfile) {
  if (!supabase || !authUser || !profileId || !recipe?.id) return;
  await supabase.from("user_recipes").upsert({
    user_id: authUser.id,
    profile_id: profileId,
    recipe_id: recipe.id,
    title: recipe.title,
    kcal: Number(recipe.kcal || 0),
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    categories: recipe.categories || [],
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,profile_id,recipe_id" });
}

async function loadMealPhotoLogsRemote(profileId = currentProfile) {
  if (!supabase || !authUser || !profileId) return [];
  const { data, error } = await supabase
    .from("meal_photo_logs")
    .select("id,date,meal_slot,note,image_data_url,estimated_kcal,protein_g,fat_g,carbs_g,confidence,model,created_at")
    .eq("user_id", authUser.id)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    date: row.date,
    slotId: row.meal_slot || "",
    note: row.note || "",
    imageDataUrl: row.image_data_url || "",
    estimatedKcal: Number(row.estimated_kcal) || 0,
    proteinG: row.protein_g == null ? null : Number(row.protein_g),
    fatG: row.fat_g == null ? null : Number(row.fat_g),
    carbsG: row.carbs_g == null ? null : Number(row.carbs_g),
    confidence: row.confidence == null ? null : Number(row.confidence),
    model: row.model || "",
    createdAt: row.created_at || new Date().toISOString()
  }));
}

async function insertMealPhotoLogRemote(entry, profileId = currentProfile) {
  if (!supabase || !authUser || !profileId) return;
  await supabase.from("meal_photo_logs").insert({
    user_id: authUser.id,
    profile_id: profileId,
    date: entry.date,
    meal_slot: entry.slotId || null,
    note: entry.note || null,
    image_data_url: entry.imageDataUrl || null,
    estimated_kcal: Number(entry.estimatedKcal) || 0,
    protein_g: entry.proteinG,
    fat_g: entry.fatG,
    carbs_g: entry.carbsG,
    confidence: entry.confidence,
    model: entry.model || null,
    created_at: entry.createdAt || new Date().toISOString()
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
    if (!id) return;
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
  ui.recipeCategoryFilter?.addEventListener("change", renderRecipes);
  ui.saveMetricBtn.addEventListener("click", saveMetric);
  ui.copyDayBtn.addEventListener("click", copySelectedDayPlan);
  ui.autoPlanBtn.addEventListener("click", autoFillFullPlan);
  ui.saveSettingsBtn.addEventListener("click", saveSettings);
  ui.resetPlannerBtn.addEventListener("click", resetPlannerForCurrentProfile);
  ui.syncLunchesBtn?.addEventListener("click", syncLunchesBetweenProfiles);
  ui.enableMealRemindersBtn?.addEventListener("click", enableMealReminders);
  ui.disableMealRemindersBtn?.addEventListener("click", disableMealReminders);
  ui.reminderPreset?.addEventListener("change", () => {
    applyReminderPreset(ui.reminderPreset.value);
  });
  ui.exportBackupBtn?.addEventListener("click", exportBackupToFile);
  ui.importBackupBtn?.addEventListener("click", () => ui.importBackupInput?.click());
  ui.importBackupInput?.addEventListener("change", importBackupFromFile);
  ui.photoMealAnalyzeBtn?.addEventListener("click", analyzePhotoMeal);
  ui.createProfileBtn.addEventListener("click", createProfileFromInput);
  ui.saveAsNewPlanBtn.addEventListener("click", saveAsNewPlan);
  ui.addRecipeBtn.addEventListener("click", addRecipeFromForm);
  ui.themeSelect.addEventListener("change", () => applyTheme(ui.themeSelect.value));
  ui.generateShoppingBtn.addEventListener("click", generateShoppingList);
  ui.copyShoppingBtn.addEventListener("click", copyShoppingList);
  ui.shareShoppingBtn.addEventListener("click", shareShoppingList);
  ui.consultAskBtn.addEventListener("click", askDietAssistant);
  ui.consultTargetRecipe.addEventListener("change", () => {
    renderConsultRecipeContext();
    pendingRecipePatch = null;
    renderPendingRecipePatch();
  });
  ui.consultRecipeSearch.addEventListener("input", refreshConsultRecipeOptions);
  ui.consultForceRecipePatch?.addEventListener("change", renderConsultPatchHint);
  ui.onboardingCloseBtn?.addEventListener("click", closeOnboarding);

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#recipe-"]');
    if (!link) return;
    showSection("recipes");
  });
}

async function loadProfiles() {
  if (supabase && authUser) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("profile_id,name")
      .order("name", { ascending: true });
    if (!error) {
      profiles = (data || []).map((p) => ({ id: p.profile_id, name: p.name }));
    }
  } else {
    try {
      const res = await fetch("plans/profiles.json");
      profiles = await res.json();
    } catch {
      profiles = [{ id: "bartek", name: "Bartek" }, { id: "paulina", name: "Paulina" }];
    }
  }

  ui.profileSelect.innerHTML = profiles.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
  ui.profileSelect.disabled = profiles.length === 0;
  ui.profileSelect.innerHTML = profiles.length
    ? ui.profileSelect.innerHTML
    : `<option value="">Brak profili</option>`;

  const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
  const exists = profiles.some((p) => p.id === saved);
  currentProfile = exists ? saved : (profiles[0]?.id || "");
  ui.profileSelect.value = currentProfile || "";
}

function slugifyProfileId(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function createProfileFromInput() {
  if (!supabase || !authUser) return;
  const name = ui.newProfileName.value.trim();
  if (!name) {
    alert("Podaj nazwę profilu.");
    return;
  }
  let profileId = slugifyProfileId(name);
  if (!profileId) profileId = `profil-${Date.now()}`;
  const baseId = profileId;
  let suffix = 1;
  while (profiles.some((p) => p.id === profileId)) {
    suffix += 1;
    profileId = `${baseId}-${suffix}`;
  }

  const { error } = await supabase.from("user_profiles").insert({
    user_id: authUser.id,
    profile_id: profileId,
    name
  });
  if (error) {
    alert(`Nie udało się utworzyć profilu: ${error.message}`);
    return;
  }
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  await loadProfiles();
  ui.newProfileName.value = "";
  if (currentProfile) {
    await switchProfile(currentProfile);
    await pullRemoteState();
  }
}

async function saveAsNewPlan() {
  if (!supabase || !authUser) {
    alert("Ta opcja działa po zalogowaniu.");
    return;
  }
  const sourceProfile = currentProfile;
  const sourcePlanner = getPlannerState();
  const sourceSettings = loadProfileSettings();
  const name = prompt("Nazwa nowego planu/profilu", "Nowy plan");
  if (name === null) return;
  ui.newProfileName.value = name;
  await createProfileFromInput();
  if (!currentProfile || currentProfile === sourceProfile) return;
  localStorage.setItem(settingsKey(), JSON.stringify(sourceSettings || {}));
  setPlannerState(sourcePlanner || {});
  await saveSettingsRemote(Number(sourceSettings?.targetKcal || getTargetKcal()), currentProfile);
  for (const key of Object.keys(sourcePlanner || {})) {
    const [week, day] = key.split("-").map(Number);
    await savePlannerEntryRemote(week, day, sourcePlanner[key], currentProfile);
  }
  renderPlanner();
  renderPlanTables();
  alert("Utworzono nowy profil z kopią planu.");
}

async function switchProfile(profileId) {
  if (!profileId) {
    currentProfile = "";
    ui.slotWrap.innerHTML = "<p>Utwórz profil, aby rozpocząć planowanie.</p>";
    ui.planTables.innerHTML = "";
    ui.recipesList.innerHTML = "";
    return;
  }
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

  const userRecipes = await loadUserRecipesRemote(currentProfile);
  recipes = mergeRecipesWithUserEntries(recipes, userRecipes);

  recipes = addCategoriesFromPlan(recipes, planData.defaultPlan || {});
  recipesById = Object.fromEntries(recipes.map((r) => [r.id, r]));

  selectedWeek = 1;
  selectedDay = 1;
  ui.weekSelect.value = "1";
  ui.daySelect.value = "1";
  ui.weekFilter.value = "all";

  refreshHeroKcal();
  fillSettingsFromState();
  ui.shoppingWeekSelect.value = "1";
  ui.shoppingDaySelect.value = "1";
  ui.shoppingOutput.innerHTML = "";
  pendingRecipePatch = null;
  setConsultResponseText("");
  ui.consultRecipePatch.innerHTML = "";
  ui.consultRecipePatch.setAttribute("hidden", "");
  refreshConsultRecipeOptions();
  renderConsultRecipeContext();
  renderConsultPatchHint();

  renderPlanner();
  renderPlanTables();
  renderRecipes();
  renderMetrics();
  renderPhotoMealHistory();
  applyStickyMetricFormDefaults({ setTodayDate: true });
  if (ui.photoMealDate && !ui.photoMealDate.value) ui.photoMealDate.valueAsDate = new Date();
}

function addCategoriesFromPlan(list, defaultPlan) {
  const map = {};
  Object.values(defaultPlan).forEach((rows) => {
    rows.forEach((row) => {
      slotConfig.forEach((slot) => {
        const id = row[slot.id];
        if (!id) return;
        if (!map[id]) map[id] = new Set();
        map[id].add(slot.category);
      });
    });
  });

  return list.map((r) => {
    const fromPlan = Array.from(map[r.id] || []);
    const fromBase = Array.isArray(r.categories) ? r.categories : [];
    const fromFallback = fallbackRecipeCategories[r.id] || [];
    const cats = Array.from(new Set([
      ...fromBase,
      ...fromPlan,
      ...(fromBase.length || fromPlan.length ? [] : fromFallback)
    ]));
    if (cats.length) return { ...r, categories: cats };
    return { ...r, categories: [] };
  });
}

function plannerKey() {
  return `${APP_KEY}:${currentProfile}:planner`;
}
function plannerKeyForProfile(profileId) {
  return `${APP_KEY}:${profileId}:planner`;
}
function metricsKey() {
  return `${APP_KEY}:${currentProfile}:metrics`;
}
function settingsKey() {
  return `${APP_KEY}:${currentProfile}:settings`;
}
function mealChecksKey() {
  return `${APP_KEY}:${currentProfile}:meal-checks`;
}
function photoMealsKey() {
  return `${APP_KEY}:${currentProfile}:photo-meals`;
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

function getPlannerStateForProfile(profileId) {
  try {
    return JSON.parse(localStorage.getItem(plannerKeyForProfile(profileId)) || "{}");
  } catch {
    return {};
  }
}

function setPlannerStateForProfile(profileId, data) {
  localStorage.setItem(plannerKeyForProfile(profileId), JSON.stringify(data));
}

function getMealChecksState() {
  try {
    return JSON.parse(localStorage.getItem(mealChecksKey()) || "{}");
  } catch {
    return {};
  }
}

function setMealChecksState(data) {
  localStorage.setItem(mealChecksKey(), JSON.stringify(data));
}

function getPhotoMealsState() {
  try {
    return JSON.parse(localStorage.getItem(photoMealsKey()) || "[]");
  } catch {
    return [];
  }
}

function setPhotoMealsState(items) {
  localStorage.setItem(photoMealsKey(), JSON.stringify(items || []));
}

function formatPhotoSlot(slotId) {
  const slot = slotConfig.find((s) => s.id === slotId);
  return slot?.label || "Poza planem";
}

function normalizeReminderTimes(raw) {
  const fromRaw = (raw && typeof raw === "object") ? raw : {};
  const normalized = {};
  for (const key of Object.keys(DEFAULT_REMINDER_TIMES)) {
    const value = String(fromRaw[key] || DEFAULT_REMINDER_TIMES[key]);
    normalized[key] = /^\d{2}:\d{2}$/.test(value) ? value : DEFAULT_REMINDER_TIMES[key];
  }
  return normalized;
}

function getReminderTimesFromUi() {
  return normalizeReminderTimes({
    meal1: ui.reminderMeal1Time?.value,
    meal2: ui.reminderMeal2Time?.value,
    snack: ui.reminderSnackTime?.value,
    meal3: ui.reminderMeal3Time?.value
  });
}

function reminderPresetFromTimes(times) {
  const t = normalizeReminderTimes(times);
  for (const [preset, values] of Object.entries(REMINDER_PRESETS)) {
    const v = normalizeReminderTimes(values);
    if (v.meal1 === t.meal1 && v.meal2 === t.meal2 && v.snack === t.snack && v.meal3 === t.meal3) {
      return preset;
    }
  }
  return "custom";
}

function applyReminderPreset(preset) {
  if (!preset || preset === "custom") return;
  const values = REMINDER_PRESETS[preset];
  if (!values) return;
  if (ui.reminderMeal1Time) ui.reminderMeal1Time.value = values.meal1;
  if (ui.reminderMeal2Time) ui.reminderMeal2Time.value = values.meal2;
  if (ui.reminderSnackTime) ui.reminderSnackTime.value = values.snack;
  if (ui.reminderMeal3Time) ui.reminderMeal3Time.value = values.meal3;
}

function dayCompletionForEntry(entry, checks) {
  const planned = slotConfig.filter((slot) => String(entry?.[slot.id] || "").trim());
  const total = planned.length;
  const done = planned.filter((slot) => Boolean(checks?.[slot.id])).length;
  return { done, total };
}

async function loadDefaultPlanForProfile(profileId) {
  try {
    const res = await fetch(`plans/${profileId}/plan.json`);
    if (!res.ok) throw new Error("Brak planu");
    return await res.json();
  } catch {
    return { targetKcal: 2100, defaultPlan: { "1": [], "2": [], "3": [], "4": [] } };
  }
}

async function syncLunchesBetweenProfiles() {
  const bartekProfileId = profiles.find((p) => String(p.id || "").toLowerCase() === "bartek")?.id;
  const paulinaProfileId = profiles.find((p) => String(p.id || "").toLowerCase() === "paulina")?.id;
  if (!bartekProfileId || !paulinaProfileId) {
    alert("Synchronizacja działa tylko dla profili Bartek i Paulina.");
    return;
  }
  const currentLower = String(currentProfile || "").toLowerCase();
  const source = currentLower === "paulina" ? paulinaProfileId : bartekProfileId;
  const target = source === bartekProfileId ? paulinaProfileId : bartekProfileId;
  if (!confirm(`Skopiować obiady (meal2) z profilu ${source} do profilu ${target} dla wszystkich 28 dni?`)) return;

  const [sourcePlan, targetPlan] = await Promise.all([
    loadDefaultPlanForProfile(source),
    loadDefaultPlanForProfile(target)
  ]);
  const sourceState = getPlannerStateForProfile(source);
  const targetState = getPlannerStateForProfile(target);
  const writes = [];

  for (let week = 1; week <= 4; week++) {
    for (let day = 1; day <= 7; day++) {
      const key = `${week}-${day}`;
      const sourceBase = sourcePlan.defaultPlan?.[String(week)]?.[day - 1] || {};
      const targetBase = targetPlan.defaultPlan?.[String(week)]?.[day - 1] || {};
      const sourceLocal = sourceState[key] || {};
      const targetLocal = targetState[key] || {};
      const next = {
        meal1: targetLocal.meal1 ?? targetBase.meal1 ?? "",
        meal2: sourceLocal.meal2 ?? sourceBase.meal2 ?? "",
        meal3: targetLocal.meal3 ?? targetBase.meal3 ?? "",
        snack: targetLocal.snack ?? targetBase.snack ?? ""
      };
      targetState[key] = next;
      if (supabase && authUser) writes.push(savePlannerEntryRemote(week, day, next, target));
    }
  }

  setPlannerStateForProfile(target, targetState);
  if (writes.length) await Promise.all(writes);
  if (currentProfile === target) {
    renderPlanner();
    renderPlanTables();
  }
  alert(`Zsynchronizowano obiady z ${source} -> ${target}.`);
}

function getLocalNotificationsPlugin() {
  return window.Capacitor?.Plugins?.LocalNotifications || null;
}

async function enableMealReminders() {
  const plugin = getLocalNotificationsPlugin();
  if (!plugin) {
    alert("Powiadomienia lokalne są dostępne w aplikacji iOS/Android (nie w samej przeglądarce).");
    return;
  }
  const perm = await plugin.requestPermissions();
  const granted = perm?.display === "granted" || perm?.receive === "granted";
  if (!granted) {
    alert("Brak zgody na powiadomienia. Włącz je w ustawieniach iPhone.");
    return;
  }

  await plugin.cancel({ notifications: Object.values(MEAL_REMINDER_IDS).map((id) => ({ id })) });
  const reminderTimes = normalizeReminderTimes(loadProfileSettings().reminderTimes);
  const notifications = slotConfig.map((slot) => {
    const [hourRaw, minuteRaw] = String(reminderTimes[slot.id] || "12:00").split(":");
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    return {
      id: MEAL_REMINDER_IDS[slot.id],
      title: "Zacznij od zdrowia",
      body: `Czas na: ${slot.label}`,
      schedule: {
        repeats: true,
        on: { hour: Number.isFinite(hour) ? hour : 12, minute: Number.isFinite(minute) ? minute : 0 }
      }
    };
  });
  await plugin.schedule({ notifications });
  alert("Włączono codzienne przypomnienia o posiłkach.");
}

async function disableMealReminders() {
  const plugin = getLocalNotificationsPlugin();
  if (!plugin) return;
  await plugin.cancel({ notifications: Object.values(MEAL_REMINDER_IDS).map((id) => ({ id })) });
  alert("Wyłączono przypomnienia.");
}

function renderPlanner() {
  const state = getPlannerState();
  const checks = getMealChecksState();
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
  if (!checks[dayKey]) checks[dayKey] = {};

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
    const isEaten = Boolean(checks[dayKey]?.[slot.id]);
    const meta = chosen ? `<a href="#recipe-${chosen.id}">${escapeHtml(chosen.title)}</a> - ${chosen.kcal} kcal` : "Brak wybranego przepisu";

    return `
      <div class="slot-card ${isEaten ? "is-eaten" : ""}">
        <p class="slot-title">${slot.label}</p>
        <select data-slot="${slot.id}">${options}</select>
        <p class="slot-meta">${meta}</p>
        <div class="slot-actions">
          <label>
            <input type="checkbox" data-eaten-slot="${slot.id}" ${isEaten ? "checked" : ""} />
            Zjedzone
          </label>
        </div>
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
  ui.slotWrap.querySelectorAll('input[data-eaten-slot]').forEach((el) => {
    el.addEventListener("change", async () => {
      if (!checks[dayKey]) checks[dayKey] = {};
      checks[dayKey][el.dataset.eatenSlot] = el.checked;
      setMealChecksState(checks);
      if (supabase && authUser) {
        await saveSettingsRemote(Number(loadProfileSettings().targetKcal || getTargetKcal()), currentProfile);
      }
      renderPlanner();
    });
  });

  const dayKcal = slotConfig.reduce((sum, slot) => sum + (recipesById[selected[slot.id]]?.kcal || 0), 0);
  const diff = dayKcal - getTargetKcal();
  const completion = dayCompletionForEntry(selected, checks[dayKey] || {});

  ui.dayKcal.textContent = `Suma dnia: ${dayKcal} kcal`;
  ui.kcalDiff.textContent = diff === 0 ? "Idealnie pod cel." : diff > 0 ? `+${diff} kcal` : `${diff} kcal`;
  if (ui.dayCompletion) ui.dayCompletion.textContent = `Realizacja dnia: ${completion.done}/${completion.total}`;
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
  const checks = getMealChecksState();

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
              <th>Status</th>
              <th>Suma kcal</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, idx) => `
              <tr class="plan-row">
                <th scope="row" class="plan-day-cell" data-label="Dzień">${weekdayNames[idx] || `Dzień ${row.day}`}</th>
                ${slotConfig.map((slot) => `
                  <td class="plan-meal-cell" data-label="${slot.label}">${planRecipeCell(row[slot.id], {
                    week: w,
                    day: row.day,
                    slotId: slot.id,
                    checked: Boolean(checks[`${w}-${row.day}`]?.[slot.id])
                  })}</td>
                `).join("")}
                <td class="plan-status-cell" data-label="Status">${(() => {
                  const key = `${w}-${row.day}`;
                  const c = dayCompletionForEntry(row, checks[key] || {});
                  return c.total ? `${c.done}/${c.total}` : "-";
                })()}</td>
                <td class="plan-sum-cell" data-label="Suma kcal">${totalForRow(row) || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }).join("");

  ui.planTables.querySelectorAll('input[data-plan-eaten]').forEach((el) => {
    el.addEventListener("change", async () => {
      const week = Number(el.dataset.week);
      const day = Number(el.dataset.day);
      const slotId = String(el.dataset.slotId || "");
      if (!Number.isInteger(week) || !Number.isInteger(day) || !slotId) return;
      const key = `${week}-${day}`;
      const checks = getMealChecksState();
      if (!checks[key]) checks[key] = {};
      checks[key][slotId] = el.checked;
      setMealChecksState(checks);
      if (supabase && authUser) {
        await saveSettingsRemote(Number(loadProfileSettings().targetKcal || getTargetKcal()), currentProfile);
      }
      renderPlanTables();
      if (selectedWeek === week && selectedDay === day) renderPlanner();
    });
  });
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

  // Zakresy ilości (np. 50-80 g, 1-2 g) → jedna wartość (max), żeby parsowanie i sumowanie działały
  const fmtRangeQty = (hi) => {
    const n = Math.round(hi * 100) / 100;
    if (Number.isInteger(n) || Math.abs(n % 1) < 1e-6) return String(Math.round(n));
    return String(n).replace(".", ",");
  };
  s = s.replace(/\b(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s+(g|kg|ml|l)\b/gi, (_, a, b, u) => {
    const hi = Math.max(parseFloat(String(a).replace(",", ".")), parseFloat(String(b).replace(",", ".")));
    return `${fmtRangeQty(hi)} ${String(u).toLowerCase()}`;
  });
  s = s.replace(/\b(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)(g|kg|ml|l)\b/gi, (_, a, b, u) => {
    const hi = Math.max(parseFloat(String(a).replace(",", ".")), parseFloat(String(b).replace(",", ".")));
    return `${fmtRangeQty(hi)}${String(u).toLowerCase()}`;
  });

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

/**
 * Rozdziela listy typu „sól, pieprz, zioła” na osobne wpisy (sumowanie).
 * Nie dotyka linii z jedną ilością na końcu (np. „schab, szynka … 170g”).
 */
function expandCommaShoppingFragments(line) {
  const t = String(line || "").trim();
  if (!t) return [];
  if (/\d+(?:[.,]\d+)?\s*(?:g|kg|ml|l|szt)\s*$/i.test(t)) return [t];
  const parts = t
    .split(/\s*,\s*/)
    .map((p) => stripShoppingSlashAlternatives(p.trim()))
    .filter(Boolean);
  return parts.length ? parts : [t];
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
      "szczypiorek", "koperek", "koper", "banan", "jabłk", "pomarańcz", "grejpfrut", "cytryn", "kiwi",
      "malin", "truskawk",
      "borówk", "jagod", "wiśni", "czeresn", "winogron", "mango", "ananas", "śliwk", "sliwk",
      "brzoskwin", "gruszk", "awokado", "kaki", "mandaryn", "melon", "arbuz", "granat"
    ]
  },
  {
    title: "Mięso, drób i ryby",
    patterns: [
      "mięso mielone", "mielone mięso", "pulpety", "pierś z kurczaka", "pierś z indyka",
      "filet z kurczaka", "karkówka", "karkowka", "kurczak", "indyk", "wieprz", "wołow", "schab",
      "polędwic", "rostbef", "boczek", "szynk", "mięso", "mielone drobiowe", "tuńczyk", "łosoś",
      "dorsz", "mintaj", "pstrąg", "śledź", "makrel", "sandacz", "halibut", "morszczuk", "krewet",
      "drob", "indycze"
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
      "croissant", "bagiet", "bułka", "chleb", "chałka", "chalka", "tortilla", "wrap", "pita",
      "bajgiel", "grahamka", "pieczywo", "ciabatta", "tost pełnoziarnisty"
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
      " olej ", "masło klarowane", "smalec", "ghee", "masło", "maslo"
    ]
  },
  {
    title: "Napoje i buliony",
    patterns: [
      "napój sojowy", "napój owsiany", "napój migdałowy", "napój kokosowy", "bulion warzywny",
      "bulion drobiowy", "bulion wołowy", "bulion w proszku", "bulion w kostce", "kostka bulion",
      "bulion", "woda mineralna", "woda ", "herbata", "kawa", "napar", "sok ", "smoothie"
    ]
  },
  {
    title: "Słodzidła, przyprawy i sosy",
    patterns: [
      "erytrol", "ksylitol", "stewia", "miód", "syrop klonowy", "syrop z agawy", "cukier",
      "wanili", "cynamon", "kardamon", "curry", "kurkuma", "imbir mielony", "papryka słodka",
      "papryka ostra", "ziele angielskie", "laur", "goździk", "majeranek", "tymianek", "oregano",
      "bazylia", "natka", "koper włoski", "chrzan", "musztard", "majonez", "ketchup",
      "sos sojowy", "sos ", "ocet", "balsamiczny", "sól", "pieprz", "zioła",
      "przypraw", "ekstrakt waniliowy", "aromat"
    ]
  }
];

function normalizeShoppingText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Warianty „A / B” w nazwie → pierwsza opcja (np. szynka z kurczaka / indyka). */
function stripShoppingSlashAlternatives(name) {
  const t = String(name || "").trim();
  const idx = t.indexOf(" / ");
  if (idx === -1) return t;
  return t.slice(0, idx).trim();
}

/** Wspólny klucz przy sumowaniu tego samego produktu pod różnymi opisami. */
function canonicalMergeIngredientName(rawName) {
  const base = stripShoppingSlashAlternatives(String(rawName || "").trim());
  let s = normalizeShoppingText(base).replace(/\s+/g, " ").trim();
  if (!s) return s;

  if (/\bszynka\s+z\s+kurczaka\b/.test(s) || /\bszynka\s+kurczaka\b/.test(s)) return "szynka z kurczaka";
  if (/\bszynka\s+z\s+indyka\b/.test(s) || /\bszynka\s+indyka\b/.test(s)) return "szynka z indyka";

  if (/\bpiers\s+z\s+kurczaka\b/.test(s) || /\bpiers\s+kurczaka\b/.test(s)
    || /\bfilet\s+z\s+kurczaka\b/.test(s)) {
    return "piers z kurczaka";
  }
  if (/\bpiers\s+z\s+indyka\b/.test(s) || /\bpiers\s+indyka\b/.test(s)
    || /\bfilet\s+z\s+indyka\b/.test(s)) {
    return "piers z indyka";
  }

  if (s === "jajko" || /^jajko(\s|$)/.test(s)) return "jajka";
  if (/^jajka(\s|$)/.test(s)) return "jajka";

  const firstTok = s.split(/\s+/)[0] || "";
  if (firstTok === "sol") return "sol";
  if (firstTok === "pieprz") return "pieprz";
  if (firstTok === "erytrol" || firstTok === "erytrytol") return "erytrytol";

  return s;
}

function parseShoppingQuantity(line) {
  const t = String(line || "").trim();
  let m = t.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(szt)\.?$/i);
  if (m) {
    return {
      name: m[1].trim(),
      amount: parseFloat(m[2].replace(",", ".")),
      unit: "szt",
      count: 1
    };
  }
  m = t.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(g|kg|ml|l)\b$/i);
  if (m) {
    return {
      name: m[1].trim(),
      amount: parseFloat(m[2].replace(",", ".")),
      unit: m[3].toLowerCase(),
      count: 1
    };
  }
  m = t.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)(g|kg|ml|l)\b$/i);
  if (m) {
    return {
      name: m[1].trim(),
      amount: parseFloat(m[2].replace(",", ".")),
      unit: m[3].toLowerCase(),
      count: 1
    };
  }
  return { name: t, amount: null, unit: null, count: 1 };
}

function mergeShoppingIngredientLines(lines) {
  const map = new Map();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const p = parseShoppingQuantity(line);
    const mergeName = canonicalMergeIngredientName(p.name);
    const key = p.amount != null && p.unit
      ? `${mergeName}|${p.unit}`
      : `txt:${canonicalMergeIngredientName(line)}`;

    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        name: p.name,
        amount: p.amount,
        unit: p.unit,
        count: p.count || 1
      });
    } else if (p.amount != null && prev.amount != null && p.unit === prev.unit) {
      prev.amount += p.amount;
    } else if (p.amount == null && prev.amount == null) {
      prev.count = (prev.count || 1) + 1;
    }
  }

  const coalesceBareWithGram = new Set(["sol", "pieprz", "erytrytol"]);
  for (const [key, v] of [...map.entries()]) {
    const m = /^txt:(.+)$/.exec(key);
    if (!m || v.amount != null) continue;
    const canon = m[1];
    if (!coalesceBareWithGram.has(canon)) continue;
    const gKey = `${canon}|g`;
    if (map.has(gKey)) {
      const gNode = map.get(gKey);
      gNode.extraBare = (gNode.extraBare || 0) + (v.count || 1);
      map.delete(key);
    }
  }

  const out = [];
  for (const v of map.values()) {
    out.push(formatMergedShoppingLine(v));
  }
  return out.sort((a, b) => a.localeCompare(b, "pl", { sensitivity: "base" }));
}

function formatMergedShoppingLine(v) {
  if (v.amount == null || v.unit == null) {
    if ((v.count || 1) > 1) return `${v.name} (${v.count}×)`;
    return v.name;
  }
  let n = v.amount;
  if (v.unit === "szt") {
    n = Math.round(n * 1000) / 1000;
  } else {
    n = Math.round(n * 10) / 10;
  }
  let numStr;
  if (v.unit === "szt") {
    numStr = Number.isInteger(n) || Math.abs(n - Math.round(n)) < 1e-6 ? String(Math.round(n)) : String(n).replace(/\.?0+$/, "");
  } else {
    numStr = Number.isInteger(n) || Math.abs(n - Math.round(n)) < 1e-6 ? String(Math.round(n)) : String(n).replace(",", ".").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  const extraBare = v.extraBare ? ` (+${v.extraBare}× bez podanej masy)` : "";
  if (v.unit === "szt") return `${v.name} ${numStr} szt${extraBare}`;
  return `${v.name} ${numStr}${v.unit}${extraBare}`;
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

function formatShoppingListByCategoryHtml(title, mergedLines) {
  const groups = new Map();
  for (const line of mergedLines) {
    const cat = categorizeShoppingIngredient(line);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(line);
  }

  const chunks = [`<div class="shopping-title">${escapeHtml(title)}</div>`];
  for (const catTitle of SHOPPING_CATEGORY_ORDER) {
    const items = groups.get(catTitle);
    if (!items || !items.length) continue;
    chunks.push(`<div class="shopping-cat"><strong>${escapeHtml(catTitle)}</strong></div>`);
    [...items].sort((a, b) => a.localeCompare(b, "pl", { sensitivity: "base" })).forEach((item) => {
      chunks.push(`<div class="shopping-line">- ${escapeHtml(item)}</div>`);
    });
  }
  return chunks.join("");
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
    ui.shoppingOutput.innerHTML = `<div class="shopping-empty">${escapeHtml("Brak wybranych przepisów w tym zakresie.")}</div>`;
    return;
  }

  const ingredients = [];
  uniqueRecipeIds.forEach((id) => {
    const recipe = recipesById[id];
    if (!recipe) return;
    (recipe.ingredients || []).forEach((ing) => {
      const cleaned = simplifyShoppingIngredientLine(ing);
      expandCommaShoppingFragments(cleaned).forEach((frag) => {
        if (frag) ingredients.push(frag);
      });
    });
  });

  const title = scope === "week"
    ? `Lista zakupów - tydzień ${week}`
    : `Lista zakupów - tydzień ${week}, dzień ${day}`;
  const merged = mergeShoppingIngredientLines(ingredients);
  ui.shoppingOutput.innerHTML = formatShoppingListByCategoryHtml(title, merged);
}

function getShoppingListPlainText() {
  return ui.shoppingOutput.innerText.replace(/\n{3,}/g, "\n\n").trim();
}

async function copyShoppingList() {
  const text = getShoppingListPlainText();
  if (!text) {
    alert("Najpierw wygeneruj listę zakupów.");
    return;
  }
  await navigator.clipboard.writeText(text);
  alert("Lista zakupów skopiowana.");
}

async function shareShoppingList() {
  const text = getShoppingListPlainText();
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

function setConsultResponseText(value) {
  const el = ui.consultResponse;
  if (!el) return;
  el.textContent = value;
  if (String(value ?? "").trim()) {
    el.removeAttribute("hidden");
  } else {
    el.setAttribute("hidden", "");
  }
}

function renderConsultPatchHint() {
  const el = ui.consultPatchHint;
  if (!el) return;
  if (!ui.consultForceRecipePatch?.checked) {
    el.textContent = "Zaznacz checkbox, jeśli chcesz dostać gotową propozycję zmian konkretnego przepisu.";
    el.removeAttribute("hidden");
    return;
  }
  el.textContent = "Po wysłaniu asystent zwróci gotową propozycję zmian w tym przepisie. Potem możesz kliknąć \"Zastosuj w przepisie\".";
  el.removeAttribute("hidden");
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
  const forceRecipePatch = Boolean(ui.consultForceRecipePatch?.checked);
  let message = ui.consultPrompt.value.trim();

  if (!message && !forceRecipePatch) {
    alert("Wpisz pytanie do asystenta albo zaznacz oczekiwanie propozycji zmian w przepisie.");
    return;
  }

  const focus = getFocusRecipeForAssistant();
  if (!focus) {
    alert("Wybierz przepis z listy.");
    return;
  }

  if (!message && forceRecipePatch) {
    message = `Pracujesz wyłącznie nad przepisem ${focus.id} (${focus.title}). Zaproponuj zmiany w składnikach i krokach zgodnie z typową dietą redukcyjną, zachowując sens posiłku.`;
  }

  await askDietAssistantWithMessage(message, { forceRecipePatch });
}

async function askDietAssistantWithMessage(message, options = {}) {
  const focus = getFocusRecipeForAssistant();
  if (!focus) {
    alert("Wybierz przepis z listy.");
    return;
  }

  ui.consultAskBtn.disabled = true;
  if (ui.consultForceRecipePatch) ui.consultForceRecipePatch.disabled = true;
  setConsultResponseText("Przetwarzam...");
  ui.consultRecipePatch.innerHTML = "";
  pendingRecipePatch = null;

  try {
    const headers = { "Content-Type": "application/json" };
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
    }

    const endpoint = chatDietEndpoint();
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        mode: "recipe",
        context: { focusRecipe: focus },
        forceRecipePatch: Boolean(options.forceRecipePatch)
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Błąd ${response.status}`);
    }
    const answer = data.answer || "Brak odpowiedzi.";
    pendingRecipePatch = data.recipePatch || null;

    let shown = answer;
    if (options.forceRecipePatch && !pendingRecipePatch) {
      shown += "\n\n(Uwaga: nie udało się odczytać propozycji zmian przepisu — doprecyzuj pytanie lub spróbuj ponownie.)";
    }
    setConsultResponseText(shown);
    renderPendingRecipePatch();
    await saveConsultHistory(message, answer, [{ kind: "recipe_patch", recipeId: focus.id, patch: pendingRecipePatch }]);
    ui.consultPrompt.value = "";
    if (ui.consultForceRecipePatch) ui.consultForceRecipePatch.checked = false;
  } catch (err) {
    const msg = err?.message || "Nie udało się połączyć z asystentem.";
    const isCapacitor = Boolean(window.Capacitor);
    const missingApiBase = isCapacitor && !String(runtimeConfig?.apiBaseUrl || "").trim();
    setConsultResponseText(
      missingApiBase
        ? `${msg}\n\nDla aplikacji iOS ustaw API_BASE_URL w .env (adres publiczny backendu), potem uruchom: npm run cap:sync:ios`
        : msg
    );
    pendingRecipePatch = null;
    renderPendingRecipePatch();
  } finally {
    ui.consultAskBtn.disabled = false;
    if (ui.consultForceRecipePatch) ui.consultForceRecipePatch.disabled = false;
  }
}

function renderPendingRecipePatch() {
  if (!pendingRecipePatch) {
    ui.consultRecipePatch.innerHTML = "";
    ui.consultRecipePatch.setAttribute("hidden", "");
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
  ui.consultRecipePatch.removeAttribute("hidden");
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
  upsertUserRecipeRemote(updated);

  pendingRecipePatch = null;
  renderPendingRecipePatch();
  renderConsultRecipeContext();
  renderRecipes();
  renderPlanner();
  renderPlanTables();
  alert("Zaktualizowano przepis w aplikacji (zapis lokalny dla tego profilu).");
}

function nextRecipeId() {
  const maxLocal = recipes.reduce((max, r) => {
    const n = Number(String(r.id || "").replace(/^R/i, ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `R${maxLocal + 1}`;
}

async function addRecipeFromForm() {
  const title = ui.newRecipeTitle.value.trim();
  const kcal = Number(ui.newRecipeKcal.value);
  const ingredients = ui.newRecipeIngredients.value.split("\n").map((s) => s.trim()).filter(Boolean);
  const steps = ui.newRecipeSteps.value.split("\n").map((s) => s.trim()).filter(Boolean);
  const categories = ui.newRecipeCategories.value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!title || !kcal || !ingredients.length || !steps.length) {
    alert("Podaj nazwę, kcal, składniki i kroki.");
    return;
  }
  if (!currentProfile) {
    alert("Najpierw utwórz profil.");
    return;
  }

  const recipe = {
    id: nextRecipeId(),
    title,
    kcal,
    ingredients,
    steps,
    categories
  };
  recipes.push(recipe);
  recipesById[recipe.id] = recipe;
  await upsertUserRecipeRemote(recipe);

  ui.newRecipeTitle.value = "";
  ui.newRecipeKcal.value = "";
  ui.newRecipeIngredients.value = "";
  ui.newRecipeSteps.value = "";
  ui.newRecipeCategories.value = "";

  renderRecipes();
  renderPlanner();
  renderPlanTables();
  refreshConsultRecipeOptions();
}

function planRecipeCell(id, options = {}) {
  const r = recipesById[id];
  if (!r) return id || "-";
  const week = Number(options.week);
  const day = Number(options.day);
  const slotId = String(options.slotId || "");
  const checked = Boolean(options.checked);
  if (!Number.isInteger(week) || !Number.isInteger(day) || !slotId) {
    return `<a href="#recipe-${r.id}">${escapeHtml(r.title)}</a>`;
  }
  return `
    <div class="plan-meal-entry">
      <a href="#recipe-${r.id}">${escapeHtml(r.title)}</a>
      <label class="plan-eaten-toggle">
        <input type="checkbox" data-plan-eaten="1" data-week="${week}" data-day="${day}" data-slot-id="${slotId}" ${checked ? "checked" : ""} />
        zjedzone
      </label>
    </div>
  `;
}

function setPhotoMealResultHtml(html = "") {
  if (!ui.photoMealResult) return;
  ui.photoMealResult.innerHTML = html;
  if (String(html || "").trim()) ui.photoMealResult.removeAttribute("hidden");
  else ui.photoMealResult.setAttribute("hidden", "");
}

function renderPhotoMealHistory() {
  if (!ui.photoMealHistory) return;
  const items = getPhotoMealsState();
  if (!items.length) {
    ui.photoMealHistory.innerHTML = '<p class="settings-note">Brak zapisanych analiz zdjęć.</p>';
    return;
  }
  ui.photoMealHistory.innerHTML = items.map((item) => `
    <article class="recipe-card photo-meal-item">
      <div class="photo-meal-head">
        <strong>${escapeHtml(item.date || "-")} | ${escapeHtml(formatPhotoSlot(item.slotId))}</strong>
        <span>${escapeHtml(String(item.estimatedKcal || 0))} kcal</span>
      </div>
      ${item.imageDataUrl ? `<img src="${item.imageDataUrl}" alt="Zdjęcie posiłku" class="photo-meal-thumb" />` : ""}
      ${item.note ? `<p class="settings-note">${escapeHtml(item.note)}</p>` : ""}
      <p class="settings-note">B: ${item.proteinG ?? "-"} g | T: ${item.fatG ?? "-"} g | W: ${item.carbsG ?? "-"} g | Pewność: ${item.confidence != null ? `${Math.round(item.confidence * 100)}%` : "-"}</p>
      ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
    </article>
  `).join("");
}

async function analyzePhotoMeal() {
  const file = ui.photoMealImage?.files?.[0];
  if (!file) {
    alert("Wybierz zdjęcie posiłku.");
    return;
  }
  const date = ui.photoMealDate?.value || new Date().toISOString().slice(0, 10);
  const slotId = ui.photoMealSlot?.value || "";
  const note = ui.photoMealNote?.value?.trim() || "";

  ui.photoMealAnalyzeBtn.disabled = true;
  setPhotoMealResultHtml("Analizuję zdjęcie...");
  try {
    const imageDataUrl = await fileToCompressedDataUrl(file, 1024, 0.78);
    const headers = { "Content-Type": "application/json" };
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    }
    const response = await fetch(mealPhotoEndpoint(), {
      method: "POST",
      headers,
      body: JSON.stringify({ imageDataUrl, note })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Błąd ${response.status}`);

    const entry = {
      id: `local-${Date.now()}`,
      date,
      slotId,
      note,
      imageDataUrl,
      estimatedKcal: Number(data.estimatedKcal) || 0,
      proteinG: data.proteinG == null ? null : Number(data.proteinG),
      fatG: data.fatG == null ? null : Number(data.fatG),
      carbsG: data.carbsG == null ? null : Number(data.carbsG),
      confidence: data.confidence == null ? null : Number(data.confidence),
      summary: String(data.summary || ""),
      model: String(data.model || ""),
      createdAt: new Date().toISOString()
    };
    const next = [entry, ...getPhotoMealsState()].slice(0, 100);
    setPhotoMealsState(next);
    renderPhotoMealHistory();
    if (supabase && authUser) {
      try {
        await insertMealPhotoLogRemote(entry);
      } catch {
        // Keep local history even if remote save fails (e.g. schema not migrated yet).
      }
    }

    setPhotoMealResultHtml(`
      <p><strong>Szacowana kaloryczność:</strong> ${escapeHtml(String(entry.estimatedKcal))} kcal</p>
      <p class="settings-note">B: ${entry.proteinG ?? "-"} g | T: ${entry.fatG ?? "-"} g | W: ${entry.carbsG ?? "-"} g | Pewność: ${entry.confidence != null ? `${Math.round(entry.confidence * 100)}%` : "-"}</p>
      ${entry.summary ? `<p>${escapeHtml(entry.summary)}</p>` : ""}
    `);
    if (ui.photoMealImage) ui.photoMealImage.value = "";
  } catch (err) {
    setPhotoMealResultHtml(escapeHtml(err.message || "Nie udało się przeanalizować zdjęcia."));
  } finally {
    ui.photoMealAnalyzeBtn.disabled = false;
  }
}

async function fileToCompressedDataUrl(file, maxSize = 1024, quality = 0.78) {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Nie udało się przetworzyć zdjęcia."));
    img.src = src;
  });
}

function renderRecipes() {
  const q = ui.recipeSearch.value.trim().toLowerCase();
  const categoryFilter = ui.recipeCategoryFilter?.value || "all";
  const filtered = recipes.filter((r) =>
    `${r.id} ${r.title} ${r.ingredients.join(" ")} ${r.steps.join(" ")}`
      .toLowerCase()
      .includes(q)
    && (categoryFilter === "all" || (r.categories || []).includes(categoryFilter))
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

function todayLocalISODate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMetricsHistorySorted() {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(metricsKey()) || "[]");
  } catch {
    history = [];
  }
  history.sort((a, b) => a.date.localeCompare(b.date));
  return history;
}

/** Uzupełnia datę (dzisiaj), wiek, wzrost i płeć z ostatniego zapisanego pomiaru. */
function applyStickyMetricFormDefaults(options = {}) {
  const { setTodayDate = false } = options;
  if (!ui.mDate) return;

  if (setTodayDate || !String(ui.mDate.value || "").trim()) {
    ui.mDate.value = todayLocalISODate();
  }

  const history = getMetricsHistorySorted();
  const last = history.length ? history[history.length - 1] : null;
  if (!last) {
    ui.mAge.value = "";
    ui.mHeight.value = "";
    ui.mGender.value = "mezczyzna";
    return;
  }

  if (last.age != null && last.age !== "") ui.mAge.value = last.age;
  if (last.height != null && last.height !== "") ui.mHeight.value = last.height;
  if (last.gender) ui.mGender.value = last.gender;
}

async function saveMetric() {
  const date = ui.mDate.value || todayLocalISODate();
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

  ui.mWeight.value = "";
  ui.mWaist.value = "";
  ui.mChest.value = "";
  ui.mHips.value = "";
  applyStickyMetricFormDefaults({ setTodayDate: true });

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

function formatDeltaNumber(n, suffix, decimals = 1) {
  if (n == null || Number.isNaN(n)) return "—";
  const p = 10 ** decimals;
  const v = Math.round(n * p) / p;
  const sign = v > 0 ? "+" : "";
  return `${sign}${String(v).replace(".", ",")}${suffix}`;
}

function renderMetricsProgress(history) {
  const el = ui.metricsProgress;
  if (!el) return;

  if (history.length === 0) {
    el.hidden = true;
    el.innerHTML = "";
    return;
  }

  if (history.length === 1) {
    el.hidden = false;
    el.innerHTML = `<p class="settings-note metrics-progress-one">Dodaj drugi pomiar (inna data), aby zobaczyć porównanie i postęp w czasie.</p>`;
    return;
  }

  const first = history[0];
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];

  const dw = first.weight != null && latest.weight != null
    ? Number((latest.weight - first.weight).toFixed(1))
    : null;
  const dwPrev = prev.weight != null && latest.weight != null
    ? Number((latest.weight - prev.weight).toFixed(1))
    : null;

  const dbmi = first.bmi != null && latest.bmi != null
    ? Number((latest.bmi - first.bmi).toFixed(2))
    : null;
  const dbmiPrev = prev.bmi != null && latest.bmi != null
    ? Number((latest.bmi - prev.bmi).toFixed(2))
    : null;

  const dWaist = first.waist != null && latest.waist != null
    ? Number((latest.waist - first.waist).toFixed(1))
    : null;
  const dWaistPrev = prev.waist != null && latest.waist != null
    ? Number((latest.waist - prev.waist).toFixed(1))
    : null;

  let weightBarHtml = "";
  if (first.weight != null && latest.weight != null && first.weight > 0) {
    const lost = first.weight - latest.weight;
    const pctLoss = Math.min(100, Math.max(0, (lost / first.weight) * 100));
    const pctGain = Math.min(100, Math.max(0, (-lost / first.weight) * 100));
    const label = lost >= 0
      ? `Udział redukcji wagi względem pierwszego pomiaru: ${formatDeltaNumber(pctLoss, "%", 1)} masy startowej`
      : `Waga wyższa niż przy pierwszym pomiarze o ${formatDeltaNumber(-lost, " kg", 1)} (${formatDeltaNumber(pctGain, "%", 1)} masy startowej)`;
    weightBarHtml = `
      <div class="metrics-progress-bar-block">
        <div class="metrics-progress-bar-caption">${escapeHtml(label)}</div>
        <div class="metrics-progress-bar ${lost >= 0 ? "is-loss" : "is-gain"}" role="presentation">
          <div class="metrics-progress-bar-fill" style="width:${lost >= 0 ? pctLoss : pctGain}%"></div>
        </div>
      </div>`;
  }

  const bmiMin = 17;
  const bmiMax = 38;
  let bmiScaleHtml = "";
  if (latest.bmi != null) {
    const pos = Math.min(100, Math.max(0, ((latest.bmi - bmiMin) / (bmiMax - bmiMin)) * 100));
    bmiScaleHtml = `
      <div class="metrics-bmi-scale-block">
        <div class="metrics-bmi-scale-caption">BMI na skali (${bmiMin}–${bmiMax})</div>
        <div class="metrics-bmi-scale" aria-hidden="true">
          <div class="metrics-bmi-band metrics-bmi-band--low"></div>
          <div class="metrics-bmi-band metrics-bmi-band--ok"></div>
          <div class="metrics-bmi-band metrics-bmi-band--high"></div>
          <div class="metrics-bmi-band metrics-bmi-band--vhigh"></div>
          <div class="metrics-bmi-marker" style="left:${pos}%" title="${escapeHtml(String(latest.bmi))}"></div>
        </div>
        <div class="metrics-bmi-refs"><span>17</span><span>18,5</span><span>25</span><span>30</span><span>38</span></div>
      </div>`;
  }

  el.hidden = false;
  el.innerHTML = `
    <h3 class="metrics-progress-title">Postęp</h3>
    <p class="metrics-progress-intro">Od <strong>${escapeHtml(first.date)}</strong> (${escapeHtml(String(first.weight ?? "?"))} kg)
    do <strong>${escapeHtml(latest.date)}</strong> (${escapeHtml(String(latest.weight ?? "?"))} kg)
    — <span class="metrics-progress-count">${history.length} wpisów</span></p>
    <dl class="metrics-delta-list">
      <div><dt>Waga vs pierwszy pomiar</dt><dd class="${dw != null && dw < 0 ? "dd-good" : dw != null && dw > 0 ? "dd-warn" : ""}">${escapeHtml(formatDeltaNumber(dw, " kg", 1))}</dd></div>
      <div><dt>Waga vs poprzedni wpis</dt><dd class="${dwPrev != null && dwPrev < 0 ? "dd-good" : dwPrev != null && dwPrev > 0 ? "dd-warn" : ""}">${escapeHtml(formatDeltaNumber(dwPrev, " kg", 1))}</dd></div>
      <div><dt>BMI vs pierwszy</dt><dd class="${dbmi != null && dbmi < 0 ? "dd-good" : dbmi != null && dbmi > 0 ? "dd-warn" : ""}">${escapeHtml(formatDeltaNumber(dbmi, " pkt BMI", 2))}</dd></div>
      <div><dt>BMI vs poprzedni</dt><dd class="${dbmiPrev != null && dbmiPrev < 0 ? "dd-good" : dbmiPrev != null && dbmiPrev > 0 ? "dd-warn" : ""}">${escapeHtml(formatDeltaNumber(dbmiPrev, " pkt BMI", 2))}</dd></div>
      <div><dt>Talia vs pierwszy</dt><dd class="${dWaist != null && dWaist < 0 ? "dd-good" : dWaist != null && dWaist > 0 ? "dd-warn" : ""}">${escapeHtml(formatDeltaNumber(dWaist, " cm", 1))}</dd></div>
      <div><dt>Talia vs poprzedni</dt><dd class="${dWaistPrev != null && dWaistPrev < 0 ? "dd-good" : dWaistPrev != null && dWaistPrev > 0 ? "dd-warn" : ""}">${escapeHtml(formatDeltaNumber(dWaistPrev, " cm", 1))}</dd></div>
    </dl>
    ${weightBarHtml}
    ${bmiScaleHtml}
    <p class="settings-note metrics-progress-foot">Kolory: zwykle zielono = spadek wagi, BMI lub obwodu (często pożądany przy redukcji), czerwono = wzrost — znaczenie zależy od celu i sytuacji zdrowotnej.</p>
  `;
}

function renderMetrics() {
  let history = [];
  try { history = JSON.parse(localStorage.getItem(metricsKey()) || "[]"); } catch {}

  const latest = history[history.length - 1];
  ui.bmiNow.textContent = latest ? `BMI: ${latest.bmi} (${bmiLabel(latest.bmi)})` : "BMI: -";

  if (!history.length) {
    ui.metricsProgress.hidden = true;
    ui.metricsProgress.innerHTML = "";
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

  renderMetricsProgress(history);
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

  if (sectionKey === "metrics") {
    applyStickyMetricFormDefaults({ setTodayDate: true });
  }
}

function getTargetKcal() {
  const localTarget = loadProfileSettings().targetKcal;
  return localTarget || planData.targetKcal || 2100;
}

function refreshHeroKcal() {
  const el = ui.heroKcal;
  if (!el) return;
  const show = Boolean(authUser) || supabase === null;
  if (!show) {
    el.textContent = "";
    el.setAttribute("hidden", "");
    return;
  }
  el.removeAttribute("hidden");
  el.textContent = `Cel: ${getTargetKcal()} kcal dziennie`;
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
  const reminders = normalizeReminderTimes(settings.reminderTimes);
  if (ui.reminderMeal1Time) ui.reminderMeal1Time.value = reminders.meal1;
  if (ui.reminderMeal2Time) ui.reminderMeal2Time.value = reminders.meal2;
  if (ui.reminderSnackTime) ui.reminderSnackTime.value = reminders.snack;
  if (ui.reminderMeal3Time) ui.reminderMeal3Time.value = reminders.meal3;
  if (ui.reminderPreset) ui.reminderPreset.value = reminderPresetFromTimes(reminders);
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
    reminderTimes: getReminderTimesFromUi(),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(settingsKey(), JSON.stringify(settings));
  applyTheme(ui.themeSelect.value);
  await saveSettingsRemote(targetKcal);

  refreshHeroKcal();
  renderPlanner();
  renderPlanTables();
  alert("Ustawienia zapisane.");
}

function exportBackupToFile() {
  const snapshot = {};
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(`${APP_KEY}:`) || k === ACTIVE_PROFILE_KEY || k === THEME_KEY) keys.push(k);
  }
  keys.sort().forEach((k) => { snapshot[k] = localStorage.getItem(k); });
  const payload = {
    app: APP_KEY,
    exportedAt: new Date().toISOString(),
    currentProfile,
    data: snapshot
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `diet-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importBackupFromFile(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed?.data || typeof parsed.data !== "object") throw new Error("Nieprawidłowy format pliku.");
    for (const [k, v] of Object.entries(parsed.data)) {
      if (typeof v === "string") localStorage.setItem(k, v);
    }
    if (parsed.currentProfile) localStorage.setItem(ACTIVE_PROFILE_KEY, String(parsed.currentProfile));
    currentProfile = localStorage.getItem(ACTIVE_PROFILE_KEY) || currentProfile;
    await loadProfiles();
    if (currentProfile) {
      await switchProfile(currentProfile);
      await pullRemoteState();
    }
    alert("Przywrócono dane z kopii zapasowej.");
  } catch (err) {
    alert(`Nie udało się zaimportować kopii: ${err.message || err}`);
  } finally {
    if (ui.importBackupInput) ui.importBackupInput.value = "";
  }
}

function renderOnboardingIfNeeded() {
  if (!ui.onboardingBackdrop) return;
  const shown = localStorage.getItem(ONBOARDING_KEY) === "1";
  if (shown) {
    ui.onboardingBackdrop.classList.add("hidden");
    return;
  }
  ui.onboardingBackdrop.classList.remove("hidden");
}

function closeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, "1");
  ui.onboardingBackdrop?.classList.add("hidden");
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
