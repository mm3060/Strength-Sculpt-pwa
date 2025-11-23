// ---------------------- STATE ----------------------
const STORAGE_KEY = "ssculpt_v1";
let state = {
  selectedScreen: "exercises",
  selectedDay: "Day 1",
  workouts: [],
  meals: [],
  recipe: {
    ingredients: []
  }
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch (e) {
    console.error(e);
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
      const r = parseInt(repsInput.value || "0");

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
    alert("Camera failed.");
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

addMealBtn.addEventListener("click", () => {
  const name = mealNameInput.value.trim() || "Meal";
  const protein = parseFloat(mealProteinInput.value || "0");
  the Calories and the total meal.

---
