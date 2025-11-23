// ---------------------- STATE ----------------------
const STORAGE_KEY = "ssculpt_v1";

let state = {
  selectedScreen: "exercises",
  selectedDay: "Day 1",
  workouts: [],        // { ts, day, exercise, weight, reps }
  meals: [],           // { ts, name, protein, calories, source }
  recipe: {
    ingredients: []    // { name, amount }
  }
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving state:", e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Shallow merge so new fields don't break old state
      state = {
        ...state,
        ...parsed,
        recipe: {
          ...state.recipe,
          ...(parsed.recipe || {})
        }
      };
    }
  } catch (e) {
    console.error("Error loading state:", e);
  }
}

loadState();

// ---------------------- NAV ----------------------
const screens = {
  exercises: document.getElementById("screen-exercises"),
  nutrition: document.getElementById("screen-nutrition"),
  recipes: document.getElementById("screen-recipes"),
  progress: document.getElementById("screen-progress")
};

const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    setScreen(target);
  });
});

function setScreen(name) {
  state.selectedScreen = name;

  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle("active", key === name);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === name);
  });

  saveState();
  if (name === "progress") renderProgress();
}

setScreen(state.selectedScreen || "exercises");

// ---------------------- WORKOUTS ----------------------
const DAYS = ["Day 1", "Day 2", "Day 3", "Day 4"];

const EXERCISES = {
  "Day 1": [
    {
      name: "Incline Dumbbell Press",
      meta: "4 × 10",
      video: "https://www.youtube.com/embed/8iPEnn-ltC8"
    },
    {
      name: "Dumbbell Shoulder Press",
      meta: "3 × 10",
      video: "https://www.youtube.com/embed/qEwKCR5JCog"
    },
    {
      name: "Push-ups",
      meta: "3 × max",
      video: "https://www.youtube.com/embed/IODxDxX7oi4"
    }
  ],
  "Day 2": [
    {
      name: "1-Arm Dumbbell Row",
      meta: "4 × 10",
      video: "https://www.youtube.com/embed/pYcpY20QaE8"
    },
    {
      name: "Pull-ups",
      meta: "3 × max",
      video: "https://www.youtube.com/embed/eGo4IYlbE5g"
    },
    {
      name: "Dumbbell Deadlift",
      meta: "4 × 10",
      video: "https://www.youtube.com/embed/3b6C3QvKpCU"
    }
  ],
  "Day 3": [
    {
      name: "Brisk Walk / Light Jog",
      meta: "20–30 min"
    },
    {
      name: "Mobility / Stretching",
      meta: "10–15 min"
    }
  ],
  "Day 4": [
    {
      name: "Goblet Squat",
      meta: "4 × 12",
      video: "https://www.youtube.com/embed/6xw0L4x0YhQ"
    },
    {
      name: "Reverse Lunges",
      meta: "3 × 10 / leg",
      video: "https://www.youtube.com/embed/2JbQlaX6eX8"
    },
    {
      name: "Dumbbell RDL",
      meta: "4 × 10",
      video: "https://www.youtube.com/embed/5XnR9E2i7qU"
    }
  ]
};

const dayTabsContainer = document.getElementById("exercise-day-tabs");
const exerciseList = document.getElementById("exercise-list");

function renderDayTabs() {
  if (!dayTabsContainer) return;
  dayTabsContainer.innerHTML = "";

  DAYS.forEach((d) => {
    const pill = document.createElement("button");
    pill.className = "pill" + (state.selectedDay === d ? " active" : "");
    pill.textContent = d;

    pill.addEventListener("click", () => {
      state.selectedDay = d;
      saveState();
      renderDayTabs();
      renderExercises();
    });

    dayTabsContainer.appendChild(pill);
  });
}

function renderExercises() {
  if (!exerciseList) return;
  exerciseList.innerHTML = "";
  const list = EXERCISES[state.selectedDay] || [];

  list.forEach((ex) => {
    const card = document.createElement("div");
    card.className = "exercise-card";

    const header = document.createElement("div");
    header.className = "exercise-header";

    const left = document.createElement("div");
    left.innerHTML = `
      <div class="exercise-name">${ex.name}</div>
      <div class="exercise-meta">${ex.meta}</div>
    `;
    header.appendChild(left);

    card.appendChild(header);

    if (ex.video) {
      const vid = document.createElement("div");
      vid.className = "exercise-video";
      vid.innerHTML = `
        <iframe width="100%" height="180"
          src="${ex.video}"
          title="${ex.name}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write;
          encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      `;
      card.appendChild(vid);
    }

    const actions = document.createElement("div");
    actions.className = "exercise-actions";

    const weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.placeholder = "lbs";

    const repsInput = document.createElement("input");
    repsInput.type = "number";
    repsInput.placeholder = "reps";

    const logBtn = document.createElement("button");
    logBtn.className = "btn";
    logBtn.textContent = "Log Set";

    logBtn.addEventListener("click", () => {
      const w = parseFloat(weightInput.value || "0");
      const r = parseInt(repsInput.value || "0", 10);

      if (!w || !r) return;

      state.workouts.push({
        ts: new Date().toISOString(),
        day: state.selectedDay,
        exercise: ex.name,
        weight: w,
        reps: r
      });

      saveState();
      weightInput.value = "";
      repsInput.value = "";
    });

    const camBtn = document.createElement("button");
    camBtn.className = "btn secondary";
    camBtn.textContent = "Form Camera";

    camBtn.addEventListener("click", () => {
      startCameraPreview();
    });

    actions.appendChild(weightInput);
    actions.appendChild(repsInput);
    actions.appendChild(logBtn);
    actions.appendChild(camBtn);

    card.appendChild(actions);
    exerciseList.appendChild(card);
  });
}

renderDayTabs();
renderExercises();

// ---------------------- CAMERA ----------------------
async function startCameraPreview() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera not supported.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    alert("Camera on. (Preview mode only.)");
    stream.getTracks().forEach((t) => t.stop());
  } catch (e) {
    console.error(e);
    alert("Camera failed.");
  }
}

// ---------------------- USDA API (NUTRITION) ----------------------
const USDA_API_KEY = "QQkHPEgBJPGvjOCCWe7JZfnfmVM9mDh6kAuHm0Ev";
const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

async function searchFood(query) {
  const url = `${USDA_SEARCH_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(
    query
  )}&dataType=Branded,Survey%20(FNDDS),Foundation`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0]; // best match

    let calories = null;
    let protein = null;
    let carbs = null;
    let fat = null;

    if (food.foodNutrients) {
      food.foodNutrients.forEach((nutrient) => {
        switch (nutrient.nutrientName) {
          case "Energy":
            calories = nutrient.value;
            break;
          case "Protein":
            protein = nutrient.value;
            break;
          case "Carbohydrate, by difference":
            carbs = nutrient.value;
            break;
          case "Total lipid (fat)":
            fat = nutrient.value;
            break;
        }
      });
    }

    return {
      name: food.description,
      calories,
      protein,
      carbs,
      fat
    };
  } catch (error) {
    console.error("USDA API error:", error);
    return null;
  }
}

// ---------------------- NUTRITION (MEALS) ----------------------
const proteinStat = document.getElementById("stat-protein");
const caloriesStat = document.getElementById("stat-calories");
const mealLog = document.getElementById("meal-log");

const addMealBtn = document.getElementById("btn-add-meal");
const mealNameInput = document.getElementById("meal-name");
const mealProteinInput = document.getElementById("meal-protein");
const mealCaloriesInput = document.getElementById("meal-calories");

// USDA search UI
const foodInput = document.getElementById("foodInput");
const searchBtn = document.getElementById("searchBtn");
const nutritionOutput = document.getElementById("nutritionOutput");

function renderMeals() {
  if (!mealLog) return;

  mealLog.innerHTML = "";

  let totalProtein = 0;
  let totalCalories = 0;

  (state.meals || []).forEach((meal) => {
    totalProtein += meal.protein || 0;
    totalCalories += meal.calories || 0;

    const row = document.createElement("div");
    row.className = "meal-row";
    row.innerHTML = `
      <div class="meal-main">
        <div class="meal-name">${meal.name}</div>
        <div class="meal-meta">
          <span>${meal.protein.toFixed(1)} g protein</span> • 
          <span>${meal.calories.toFixed(0)} kcal</span>
          ${meal.source ? ` • <span class="meal-source">${meal.source}</span>` : ""}
        </div>
      </div>
      <div class="meal-time">
        ${new Date(meal.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    `;
    mealLog.appendChild(row);
  });

  if (proteinStat) proteinStat.textContent = totalProtein.toFixed(1) + " g";
  if (caloriesStat) caloriesStat.textContent = totalCalories.toFixed(0) + " kcal";
}

// Add meal manually (or after USDA autofill)
if (addMealBtn) {
  addMealBtn.addEventListener("click", () => {
    const name = (mealNameInput.value || "").trim() || "Meal";
    const protein = parseFloat(mealProteinInput.value || "0");
    const calories = parseFloat(mealCaloriesInput.value || "0");

    if (!protein && !calories) {
      alert("Enter at least protein or calories.");
      return;
    }

    state.meals.push({
      ts: new Date().toISOString(),
      name,
      protein: protein || 0,
      calories: calories || 0,
      source: "manual"
    });

    saveState();

    mealNameInput.value = "";
    mealProteinInput.value = "";
    mealCaloriesInput.value = "";

    renderMeals();
  });
}

// USDA search integration
if (searchBtn && foodInput && nutritionOutput) {
  searchBtn.addEventListener("click", async () => {
    const query = foodInput.value.trim();
    if (!query) {
      nutritionOutput.innerHTML = "<p>Please enter a food to search.</p>";
      return;
    }

    nutritionOutput.innerHTML = "<p>Searching USDA…</p>";

    const result = await searchFood(query);

    if (!result) {
      nutritionOutput.innerHTML = "<p>No results found.</p>";
      return;
    }

    nutritionOutput.innerHTML = `
      <h3>${result.name}</h3>
      <p><strong>Calories:</strong> ${result.calories ?? "N/A"}</p>
      <p><strong>Protein:</strong> ${result.protein ?? "N/A"} g</p>
      <p><strong>Carbs:</strong> ${result.carbs ?? "N/A"} g</p>
      <p><strong>Fat:</strong> ${result.fat ?? "N/A"} g</p>
      <p class="note">Values are per 100g or standard serving (USDA data).</p>
    `;

    // Autofill meal fields so user can tweak + log
    if (mealNameInput) mealNameInput.value = result.name;
    if (mealProteinInput && result.protein != null) {
      mealProteinInput.value = result.protein.toFixed(1);
    }
    if (mealCaloriesInput && result.calories != null) {
      mealCaloriesInput.value = result.calories.toFixed(0);
    }

    // Optionally: auto-add a meal from USDA
    state.meals.push({
      ts: new Date().toISOString(),
      name: result.name,
      protein: result.protein || 0,
      calories: result.calories || 0,
      source: "USDA"
    });
    saveState();
    renderMeals();
  });
}

// ---------------------- RECIPES ----------------------
const recipeIngredientsList = document.getElementById("recipe-ingredients");
const addIngredientBtn = document.getElementById("btn-add-ingredient");
const ingredientNameInput = document.getElementById("ingredient-name");
const ingredientAmountInput = document.getElementById("ingredient-amount");

function renderRecipe() {
  if (!recipeIngredientsList) return;
  recipeIngredientsList.innerHTML = "";

  (state.recipe.ingredients || []).forEach((ing, idx) => {
    const li = document.createElement("div");
    li.className = "ingredient-row";
    li.innerHTML = `
      <div>${ing.name} — ${ing.amount}</div>
      <button class="btn small" data-idx="${idx}">Remove</button>
    `;
    recipeIngredientsList.appendChild(li);
  });

  // Attach remove handlers
  const removeButtons = recipeIngredientsList.querySelectorAll("button[data-idx]");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      state.recipe.ingredients.splice(idx, 1);
      saveState();
      renderRecipe();
    });
  });
}

if (addIngredientBtn) {
  addIngredientBtn.addEventListener("click", () => {
    const name = (ingredientNameInput.value || "").trim();
    const amount = (ingredientAmountInput.value || "").trim();

    if (!name || !amount) {
      alert("Enter an ingredient name and amount.");
      return;
    }

    state.recipe.ingredients.push({ name, amount });
    saveState();

    ingredientNameInput.value = "";
    ingredientAmountInput.value = "";

    renderRecipe();
  });
}

// ---------------------- PROGRESS SCREEN ----------------------
const progressSummary = document.getElementById("progress-summary");
const progressWorkouts = document.getElementById("progress-workouts");
const progressMeals = document.getElementById("progress-meals");

function renderProgress() {
  // Basic stats
  const workouts = state.workouts || [];
  const meals = state.meals || [];

  const totalWorkouts = workouts.length;
  const totalMeals = meals.length;

  let totalVolume = 0; // sum of weight * reps
  workouts.forEach((w) => {
    totalVolume += (w.weight || 0) * (w.reps || 0);
  });

  let totalProtein = 0;
  let totalCalories = 0;
  meals.forEach((m) => {
    totalProtein += m.protein || 0;
    totalCalories += m.calories || 0;
  });

  if (progressSummary) {
    progressSummary.innerHTML = `
      <p><strong>Total Workouts Logged:</strong> ${totalWorkouts}</p>
      <p><strong>Total Volume (lbs × reps):</strong> ${totalVolume}</p>
      <p><strong>Total Meals Logged:</strong> ${totalMeals}</p>
      <p><strong>Total Protein Logged:</strong> ${totalProtein.toFixed(1)} g</p>
      <p><strong>Total Calories Logged:</strong> ${totalCalories.toFixed(0)} kcal</p>
    `;
  }

  if (progressWorkouts) {
    progressWorkouts.innerHTML = "";
    workouts
      .slice()
      .reverse()
      .slice(0, 10)
      .forEach((w) => {
        const row = document.createElement("div");
        row.className = "progress-row";
        row.innerHTML = `
          <div>
            <strong>${w.exercise}</strong> (${w.day})<br>
            ${w.weight} lbs × ${w.reps} reps
          </div>
          <div class="progress-time">
            ${new Date(w.ts).toLocaleDateString()}
          </div>
        `;
        progressWorkouts.appendChild(row);
      });
  }

  if (progressMeals) {
    progressMeals.innerHTML = "";
    meals
      .slice()
      .reverse()
      .slice(0, 10)
      .forEach((m) => {
        const row = document.createElement("div");
        row.className = "progress-row";
        row.innerHTML = `
          <div>
            <strong>${m.name}</strong><br>
            ${m.protein.toFixed(1)} g protein • ${m.calories.toFixed(0)} kcal
            ${m.source ? ` • <span class="meal-source">${m.source}</span>` : ""}
          </div>
          <div class="progress-time">
            ${new Date(m.ts).toLocaleDateString()}
          </div>
        `;
        progressMeals.appendChild(row);
      });
  }
}

// ---------------------- INITIAL RENDERS ----------------------
renderMeals();
renderRecipe();
// Progress will render automatically when you tap the Progress tab
// setScreen(...) above already calls renderProgress() when needed

// ---------------------- DEBUG (OPTIONAL) ----------------------
// Uncomment to quickly confirm USDA is working in the console:
// searchFood("lentils").then(result => console.log("USDA Test:", result));
