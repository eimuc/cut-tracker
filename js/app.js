// ==================== SUPABASE ====================
const SB_URL = "https://kcjydkorcohwcnwwncjb.supabase.co";
const SB_KEY = "sb_publishable_DbckVKe1MyV14uoNBneM6g_cv7mBIpt";

async function sbGet(id) {
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/app_data?id=eq.${id}&select=data`,
      {
        headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
      },
    );
    const rows = await r.json();
    return rows && rows[0] ? rows[0].data : null;
  } catch (e) {
    console.warn("sbGet failed", e);
    return null;
  }
}

async function sbSet(id, data) {
  try {
    await fetch(`${SB_URL}/rest/v1/app_data`, {
      method: "POST",
      headers: {
        apikey: SB_KEY,
        Authorization: "Bearer " + SB_KEY,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ id, data, updated_at: new Date().toISOString() }),
    });
  } catch (e) {
    console.warn("sbSet failed", e);
  }
}

async function syncToCloud() {
  await sbSet("config", config);
  await sbSet("dailyLog", dailyLog);
  await sbSet("workoutLog", workoutLog);
  await sbSet("weightLog", weightLog);
  showToast("☁️ Išsaugota debesyje");
}

async function loadFromCloud() {
  const [cfg, dl, wl, wlog] = await Promise.all([
    sbGet("config"),
    sbGet("dailyLog"),
    sbGet("workoutLog"),
    sbGet("weightLog"),
  ]);
  if (cfg) {
    config = cfg;
    save("config", config);
  }
  if (dl) {
    dailyLog = dl;
    save("dailyLog", dailyLog);
  }
  if (wl) {
    workoutLog = wl;
    save("workoutLog", workoutLog);
  }
  if (wlog) {
    weightLog = wlog;
    save("weightLog", weightLog);
  }
  return !!cfg;
}

// ==================== DATA ====================
const TRAINING_PLAN = {
  monday: {
    label: "Pirmadienis",
    emoji: "🔥",
    focus: "Push + Abs",
    sections: [
      {
        name: "🏋️ Jėga",
        exercises: [
          {
            id: "bar_dips",
            name: "Bar Dips",
            target: "4 × 6–10",
            bodyweight: true,
          },
          {
            id: "push_ups",
            name: "Push Ups",
            target: "3 × 20–30",
            bodyweight: true,
          },
          {
            id: "floor_press",
            name: "Dumbbell Floor Press",
            target: "3 × 10–12",
            hint: "15–20 kg",
          },
          {
            id: "shoulder_press",
            name: "Dumbbell Shoulder Press",
            target: "3 × 10–12",
            hint: "10–14 kg",
          },
          {
            id: "lateral_raises",
            name: "Dumbbell Lateral Raises",
            target: "3 × 12–15",
            hint: "4–7 kg",
          },
        ],
      },
      {
        name: "🧱 Abs",
        exercises: [
          { id: "plank", name: "Plank", target: "3 × 45–60 sek", time: true },
          {
            id: "leg_raises",
            name: "Leg Raises",
            target: "3 × 12–15",
            bodyweight: true,
          },
        ],
      },
    ],
  },
  wednesday: {
    label: "Trečiadienis",
    emoji: "🔥",
    focus: "Pull + Legs",
    sections: [
      {
        name: "🧗 Pull",
        exercises: [
          {
            id: "pull_ups",
            name: "Pull Ups",
            target: "5 × 3–5",
            bodyweight: true,
          },
          {
            id: "chin_ups",
            name: "Chin Ups",
            target: "3 × max",
            bodyweight: true,
          },
          {
            id: "db_row",
            name: "One Arm Dumbbell Row",
            target: "4 × 10–12",
            hint: "20–30 kg",
          },
          {
            id: "bicep_curls",
            name: "Dumbbell Bicep Curls",
            target: "3 × 10–12",
            hint: "8–14 kg",
          },
        ],
      },
      {
        name: "🦵 Kojos",
        exercises: [
          {
            id: "goblet_squat",
            name: "Goblet Squats",
            target: "4 × 10–15",
            hint: "20–35 kg",
          },
          {
            id: "rdl",
            name: "Dumbbell Romanian Deadlift",
            target: "3 × 10–12",
            hint: "20–35 kg",
          },
        ],
      },
      {
        name: "🧱 Abs",
        exercises: [
          {
            id: "hanging_knee",
            name: "Hanging Knee Raises",
            target: "3 × 10–15",
            bodyweight: true,
          },
        ],
      },
    ],
  },
  friday: {
    label: "Penktadienis",
    emoji: "🔥",
    focus: "Full Body",
    sections: [
      {
        name: "🏋️ Jėga",
        exercises: [
          {
            id: "pull_ups_fri",
            name: "Pull Ups",
            target: "3 × max",
            bodyweight: true,
          },
          {
            id: "bar_dips_fri",
            name: "Bar Dips",
            target: "3 × max",
            bodyweight: true,
          },
          {
            id: "push_ups_fri",
            name: "Push Ups",
            target: "3 × max",
            bodyweight: true,
          },
          {
            id: "goblet_squat_fri",
            name: "Goblet Squats",
            target: "4 × 12–15",
            hint: "20–35 kg",
          },
          {
            id: "lunges",
            name: "Dumbbell Lunges",
            target: "3 × 10 k.k.",
            hint: "10–16 kg",
          },
          {
            id: "floor_press_fri",
            name: "Dumbbell Floor Press",
            target: "3 × 10–12",
            hint: "15–22 kg",
          },
        ],
      },
      {
        name: "🔥 Finisher",
        exercises: [
          {
            id: "mountain_climbers",
            name: "Mountain Climbers",
            target: "3 × 30–45 sek",
            time: true,
          },
        ],
      },
    ],
  },
};

const DAYS = ["monday", "wednesday", "friday"];
const DAY_LABELS = {
  monday: "Pirmad.",
  wednesday: "Trečiad.",
  friday: "Penktad.",
};

// ==================== STORAGE ====================
function load(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
  // Debounced cloud sync
  clearTimeout(window._syncTimer);
  window._syncTimer = setTimeout(() => syncToCloud(), 1500);
}

let config = load("config", null);
let dailyLog = load("dailyLog", {}); // { 'YYYY-MM-DD': { checklist: {}, cardio: [] } }
let workoutLog = load("workoutLog", {}); // { 'YYYY-MM-DD_day': { exercises: { id: [{kg, reps, secs}] } } }
let weightLog = load("weightLog", []); // [{ date, kg }]

// ==================== UTILS ====================
function todayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
function formatDate(str) {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("lt-LT", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function formatDateShort(str) {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("lt-LT", { month: "short", day: "numeric" });
}
function getDayOfWeek() {
  return [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][new Date().getDay()];
}
function isTodayTrainingDay() {
  return DAYS.includes(getDayOfWeek());
}
function todayTrainingDay() {
  const d = getDayOfWeek();
  return DAYS.includes(d) ? d : null;
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// ==================== SETUP ====================
function saveSetup() {
  const sw = parseFloat(document.getElementById("setupStartWeight").value);
  const gw = parseFloat(document.getElementById("setupGoalWeight").value);
  const wk = parseInt(document.getElementById("setupWeeks").value);
  const errEl = document.getElementById("setupError");
  if (isNaN(sw) || isNaN(gw) || isNaN(wk) || sw <= 0 || gw <= 0 || wk <= 0) {
    if (errEl) {
      errEl.style.display = "block";
    }
    return;
  }
  if (errEl) errEl.style.display = "none";
  config = {
    startWeight: sw,
    goalWeight: gw,
    weeks: wk,
    startDate: todayStr(),
  };
  save("config", config);
  document.getElementById("setupModal").style.display = "none";
  renderAll();
}

// ==================== NAVIGATION ====================
function showPage(name) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById("page" + name).classList.add("active");
  const btns = document.querySelectorAll(".nav-btn");
  const idx = [
    "Dashboard",
    "Workout",
    "Weight",
    "Progress",
    "Settings",
  ].indexOf(name);
  if (idx >= 0) btns[idx].classList.add("active");
  if (name === "Workout") renderWorkout();
  if (name === "Weight") renderWeight();
  if (name === "Progress") renderProgress();
  if (name === "Settings") renderSettings();
}

// ==================== DASHBOARD ====================
function renderDashboard() {
  const today = todayStr();
  const d = new Date(today + "T00:00:00");
  document.getElementById("dashDate").textContent = d.toLocaleDateString(
    "lt-LT",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Stats
  const latestW = weightLog.length
    ? weightLog[weightLog.length - 1].kg
    : config?.startWeight || null;
  const startW = config?.startWeight || null;
  const goalW = config?.goalWeight || null;
  const lost = startW && latestW ? +(startW - latestW).toFixed(1) : 0;
  const left = goalW && latestW ? +(latestW - goalW).toFixed(1) : 0;

  // Days elapsed
  let dayNum = "—",
    totalDays = "—";
  if (config?.startDate) {
    const s = new Date(config.startDate + "T00:00:00");
    const t = new Date(today + "T00:00:00");
    const diff = Math.floor((t - s) / 86400000) + 1;
    dayNum = Math.max(1, diff);
    totalDays = config.weeks * 7;
  }

  // Streak
  let streak = 0;
  const d2 = new Date(today + "T00:00:00");
  for (let i = 0; i < 90; i++) {
    const ds = d2.toISOString().split("T")[0];
    if (dailyLog[ds]?.completed) streak++;
    else break;
    d2.setDate(d2.getDate() - 1);
  }

  document.getElementById("dashStreak").textContent =
    streak > 0 ? `🔥 ${streak}` : "—";

  const statsHTML = `
    <div class="stat-box">
      <div class="stat-label">Diena</div>
      <div class="stat-value stat-accent">${dayNum}<span style="font-size:14px;color:var(--text2)"> / ${totalDays}</span></div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Svoris</div>
      <div class="stat-value">${latestW ? latestW + " kg" : "—"}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Numesta</div>
      <div class="stat-value ${lost > 0 ? "stat-green" : ""}">${lost > 0 ? "−" + lost : "0"} <span style="font-size:14px">kg</span></div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Liko</div>
      <div class="stat-value ${left > 0 ? "stat-accent" : "stat-green"}">${left > 0 ? left : "✓"} <span style="font-size:14px">${left > 0 ? "kg" : ""}</span></div>
    </div>
  `;
  document.getElementById("dashStats").innerHTML = statsHTML;

  // Progress bar
  if (startW && goalW && latestW) {
    const total = startW - goalW;
    const done = startW - latestW;
    const pct = Math.min(100, Math.max(0, (done / total) * 100));
    document.getElementById("progressFill").style.width = pct + "%";
    document.getElementById("progressStart").textContent = startW + " kg";
    document.getElementById("progressCurrent").textContent = latestW + " kg";
    document.getElementById("progressGoal").textContent = goalW + " kg";

    // Expected weight
    if (config?.startDate && config?.weeks) {
      const totalDaysN = config.weeks * 7;
      const s = new Date(config.startDate + "T00:00:00");
      const t = new Date(today + "T00:00:00");
      const elapsed = Math.floor((t - s) / 86400000);
      const totalKg = startW - goalW;
      const expected = +(startW - (totalKg * elapsed) / totalDaysN).toFixed(1);
      document.getElementById("expectedVal").textContent = expected + " kg";
      document.getElementById("expectedWeightBox").style.display = "flex";
      const status = document.getElementById("expectedStatus");
      if (latestW < expected) {
        status.textContent = "✅";
        status.title = "Lenki planą!";
      } else if (latestW > expected + 0.5) {
        status.textContent = "⚠️";
      } else {
        status.textContent = "👍";
      }
    }
  }

  // Daily checklist
  const todayDay = todayTrainingDay();
  const dl = dailyLog[today] || {};
  const checks = [
    { id: "breakfast", label: "Pusryčiai", icon: "🍳" },
    { id: "lunch", label: "Pietūs", icon: "🥗" },
    { id: "dinner", label: "Vakarienė", icon: "🍽" },
    { id: "diet", label: "Dietos laikiausi", icon: "✅" },
    ...(todayDay
      ? [
          {
            id: "workout",
            label:
              TRAINING_PLAN[todayDay].label +
              " — " +
              TRAINING_PLAN[todayDay].focus,
            icon: "🏋️",
          },
        ]
      : []),
    { id: "cardio", label: "Cardio / Vaikščiojimas", icon: "🏃" },
  ];

  const checksDone = checks.every((c) => dl.checklist?.[c.id]);
  let html = "";
  if (checksDone && checks.length > 0 && dl.checklist) {
    html += `<div class="complete-banner">🎯 Šiandien atlikai planą!</div>`;
  }
  checks.forEach((c) => {
    const done = dl.checklist?.[c.id];
    html += `<div class="check-item ${done ? "checked" : ""}" onclick="toggleCheck('${c.id}')">
      <div class="check-box">${done ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ""}</div>
      <span class="check-icon">${c.icon}</span>
      <span class="check-label">${c.label}</span>
    </div>`;
  });
  document.getElementById("dailyChecklist").innerHTML = html;

  // Week streak (last 7 days)
  const weekHTML = [];
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(today + "T00:00:00");
    dd.setDate(dd.getDate() - i);
    const ds = dd.toISOString().split("T")[0];
    const dayLabel = ["N", "P", "A", "T", "K", "Pn", "Š"][dd.getDay()];
    const done = dailyLog[ds]?.completed;
    const isToday = ds === today;
    weekHTML.push(
      `<div class="streak-dot ${done ? "done" : ""} ${isToday && !done ? "today" : ""}">${dayLabel}</div>`,
    );
  }
  document.getElementById("weekStreak").innerHTML = weekHTML.join("");
}

function toggleCheck(id) {
  const today = todayStr();
  if (!dailyLog[today]) dailyLog[today] = { checklist: {}, cardio: [] };
  if (!dailyLog[today].checklist) dailyLog[today].checklist = {};
  dailyLog[today].checklist[id] = !dailyLog[today].checklist[id];

  // Check if all done
  const todayDay = todayTrainingDay();
  const checks = [
    "breakfast",
    "lunch",
    "dinner",
    "diet",
    ...(todayDay ? ["workout"] : []),
    "cardio",
  ];
  dailyLog[today].completed = checks.every((c) => dailyLog[today].checklist[c]);

  save("dailyLog", dailyLog);
  renderDashboard();
  if (dailyLog[today].completed) showToast("🎯 Šiandien atlikai planą!");
}

// ==================== WORKOUT ====================
let activeWorkoutDay = null;
let workoutSets = {}; // { exerciseId: [{kg, reps}] }

function renderWorkout() {
  const today = todayStr();
  document.getElementById("workoutDate").textContent = formatDate(today);

  // Default to today's day or first
  const todayDay = todayTrainingDay();
  if (!activeWorkoutDay) activeWorkoutDay = todayDay || "monday";

  // Tabs
  let tabsHTML = "";
  DAYS.forEach((d) => {
    const plan = TRAINING_PLAN[d];
    const logKey = `${today}_${d}`;
    const hasLog = workoutLog[logKey];
    tabsHTML += `<button class="day-tab ${d === activeWorkoutDay ? "active" : ""} ${hasLog ? "completed" : ""}" onclick="switchWorkoutDay('${d}')">${DAY_LABELS[d]}</button>`;
  });
  document.getElementById("dayTabs").innerHTML = tabsHTML;

  renderWorkoutDay();
}

function switchWorkoutDay(day) {
  activeWorkoutDay = day;
  const today = todayStr();
  const logKey = `${today}_${day}`;
  workoutSets = workoutLog[logKey]?.exercises
    ? JSON.parse(JSON.stringify(workoutLog[logKey].exercises))
    : {};
  renderWorkout();
}

function renderWorkoutDay() {
  const today = todayStr();
  const day = activeWorkoutDay;
  const plan = TRAINING_PLAN[day];
  const logKey = `${today}_${day}`;

  if (!workoutSets || Object.keys(workoutSets).length === 0) {
    const existing = workoutLog[logKey];
    workoutSets = existing?.exercises
      ? JSON.parse(JSON.stringify(existing.exercises))
      : {};
  }

  let html = "";

  // Previous workout info
  const prevKey = getPrevWorkoutKey(day, today);
  const prevData = prevKey ? workoutLog[prevKey] : null;

  plan.sections.forEach((section) => {
    html += `<div class="section-divider">${section.name}</div>`;
    section.exercises.forEach((ex) => {
      const sets = workoutSets[ex.id] || [];
      const progress = getExerciseProgress(ex.id, today);

      html += `<div class="exercise-block">
        <div class="exercise-name">
          ${ex.name}
          ${ex.bodyweight ? '<span class="bw-badge">BW</span>' : ""}
          <span class="exercise-target">${ex.target}</span>
          ${ex.hint ? `<span style="font-size:11px;color:var(--text3)">${ex.hint}</span>` : ""}
          ${progress ? `<span class="exercise-progress-badge ${progress.cls}">${progress.label}</span>` : ""}
        </div>`;

      // Sets table
      if (!ex.time) {
        html += `<table class="sets-table">
          <thead><tr>
            <th>Setas</th>
            ${!ex.bodyweight ? "<th>kg</th>" : ""}
            <th>Reps</th>
            <th></th>
          </tr></thead>
          <tbody id="sets_${ex.id}">`;

        if (sets.length === 0) {
          // Default sets from target
          const defaultSets = getDefaultSets(ex);
          defaultSets.forEach((s, i) => {
            html += renderSetRow(ex, i, s.kg, s.reps);
          });
          workoutSets[ex.id] = defaultSets;
        } else {
          sets.forEach((s, i) => {
            html += renderSetRow(ex, i, s.kg, s.reps);
          });
        }

        html += `</tbody></table>
          <button class="add-set-btn" onclick="addSet('${ex.id}', ${ex.bodyweight}, ${ex.time || false})">+ setas</button>`;
      } else {
        // Time-based
        html += `<table class="sets-table">
          <thead><tr><th>Setas</th><th>Sek.</th><th></th></tr></thead>
          <tbody id="sets_${ex.id}">`;
        const timeSets = sets.length > 0 ? sets : getDefaultSets(ex);
        if (sets.length === 0) workoutSets[ex.id] = timeSets;
        timeSets.forEach((s, i) => {
          html += `<tr>
            <td style="color:var(--text2);font-size:13px">${i + 1}</td>
            <td><input class="set-input" type="number" value="${s.secs || ""}" placeholder="45"
              oninput="updateSet('${ex.id}', ${i}, 'secs', this.value)"></td>
            <td><button class="remove-set-btn" onclick="removeSet('${ex.id}', ${i})">×</button></td>
          </tr>`;
        });
        html += `</tbody></table>
          <button class="add-set-btn" onclick="addSet('${ex.id}', false, true)">+ setas</button>`;
      }

      html += `</div>`;
    });
  });

  html += `<button class="save-btn" onclick="saveWorkout()">💾 Išsaugoti treniruotę</button>`;

  document.getElementById("workoutContent").innerHTML = html;
}

function renderSetRow(ex, i, kg, reps) {
  return `<tr>
    <td style="color:var(--text2);font-size:13px">${i + 1}</td>
    ${
      !ex.bodyweight
        ? `<td><input class="set-input" type="number" value="${kg || ""}" placeholder="—"
      oninput="updateSet('${ex.id}', ${i}, 'kg', this.value)"></td>`
        : ""
    }
    <td><input class="set-input" type="number" value="${reps || ""}" placeholder="—"
      oninput="updateSet('${ex.id}', ${i}, 'reps', this.value)"></td>
    <td><button class="remove-set-btn" onclick="removeSet('${ex.id}', ${i})">×</button></td>
  </tr>`;
}

function getDefaultSets(ex) {
  // Parse target like "4 × 6–10"
  const match = ex.target.match(/^(\d+)/);
  const count = match ? parseInt(match[1]) : 3;
  const sets = [];
  for (let i = 0; i < count; i++)
    sets.push({ kg: null, reps: null, secs: null });
  return sets;
}

function updateSet(exId, idx, field, val) {
  if (!workoutSets[exId]) workoutSets[exId] = [];
  if (!workoutSets[exId][idx]) workoutSets[exId][idx] = {};
  workoutSets[exId][idx][field] = val ? parseFloat(val) : null;
}

function addSet(exId, bodyweight, time) {
  if (!workoutSets[exId]) workoutSets[exId] = [];
  workoutSets[exId].push({ kg: null, reps: null, secs: null });
  // Find exercise to re-render
  renderWorkoutDay();
}

function removeSet(exId, idx) {
  if (workoutSets[exId]) {
    workoutSets[exId].splice(idx, 1);
    renderWorkoutDay();
  }
}

function saveWorkout() {
  const today = todayStr();
  const logKey = `${today}_${activeWorkoutDay}`;
  workoutLog[logKey] = {
    date: today,
    day: activeWorkoutDay,
    exercises: JSON.parse(JSON.stringify(workoutSets)),
  };
  save("workoutLog", workoutLog);

  // Mark workout done in daily log
  if (!dailyLog[today]) dailyLog[today] = { checklist: {}, cardio: [] };
  if (!dailyLog[today].checklist) dailyLog[today].checklist = {};
  dailyLog[today].checklist.workout = true;
  save("dailyLog", dailyLog);

  showToast("✅ Treniruotė išsaugota!");
  renderWorkout();
}

function getPrevWorkoutKey(day, beforeDate) {
  const keys = Object.keys(workoutLog)
    .filter((k) => k.endsWith("_" + day) && k.split("_")[0] < beforeDate)
    .sort()
    .reverse();
  return keys[0] || null;
}

function getExerciseProgress(exId, today) {
  // Compare today (if saved) vs last session
  const todayKey = `${today}_${activeWorkoutDay}`;
  const prevKey = getPrevWorkoutKey(activeWorkoutDay, today);
  if (!prevKey) return null;

  const prevSets = workoutLog[prevKey]?.exercises?.[exId];
  const todayEntry = workoutLog[todayKey];
  if (!prevSets || !todayEntry) return null;

  const todaySets = todayEntry.exercises?.[exId];
  if (!todaySets) return null;

  const prevMaxKg = Math.max(...prevSets.map((s) => s.kg || 0));
  const todayMaxKg = Math.max(...todaySets.map((s) => s.kg || 0));
  const prevTotalReps = prevSets.reduce((a, s) => a + (s.reps || 0), 0);
  const todayTotalReps = todaySets.reduce((a, s) => a + (s.reps || 0), 0);

  if (todayMaxKg > prevMaxKg)
    return {
      label: `+${+(todayMaxKg - prevMaxKg).toFixed(1)} kg ↑`,
      cls: "badge-up",
    };
  if (todayTotalReps > prevTotalReps)
    return {
      label: `+${todayTotalReps - prevTotalReps} reps ↑`,
      cls: "badge-up",
    };
  if (todaySets.length > prevSets.length)
    return { label: "+1 setas ↑", cls: "badge-up" };
  return { label: "= lygis", cls: "badge-same" };
}

// ==================== WEIGHT ====================
function renderWeight() {
  const today = todayStr();
  document.getElementById("weightDate").value = today;

  const logs = [...weightLog].sort((a, b) => b.date.localeCompare(a.date));
  const config2 = config;

  // Log list
  let html = "";
  if (logs.length === 0) {
    html = `<div class="empty-state"><div>⚖️</div><div>Dar nėra įrašų</div></div>`;
  } else {
    logs.forEach((entry, i) => {
      const prev = logs[i + 1];
      const delta = prev ? +(entry.kg - prev.kg).toFixed(1) : null;
      let deltaHtml = "";
      if (delta !== null) {
        if (delta < 0)
          deltaHtml = `<span class="weight-delta delta-down">−${Math.abs(delta)} kg</span>`;
        else if (delta > 0)
          deltaHtml = `<span class="weight-delta delta-up">+${delta} kg</span>`;
        else deltaHtml = `<span class="weight-delta delta-same">= </span>`;
      }
      html += `<div class="weight-row">
        <div>
          <div class="weight-date">${formatDate(entry.date)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          ${deltaHtml}
          <div class="weight-val">${entry.kg} kg</div>
          <button class="remove-set-btn" onclick="removeWeight('${entry.date}')" style="margin-left:4px">×</button>
        </div>
      </div>`;
    });
  }
  document.getElementById("weightLog").innerHTML = html;

  // Chart
  const sorted = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length >= 2) {
    document.getElementById("weightChartCard").style.display = "block";
    drawWeightChart(sorted);
  } else {
    document.getElementById("weightChartCard").style.display = "none";
  }
}

function addWeight() {
  const date = document.getElementById("weightDate").value;
  const kg = parseFloat(document.getElementById("weightVal").value);
  if (!date || !kg) return;
  weightLog = weightLog.filter((e) => e.date !== date);
  weightLog.push({ date, kg });
  weightLog.sort((a, b) => a.date.localeCompare(b.date));
  save("weightLog", weightLog);
  document.getElementById("weightVal").value = "";
  showToast("⚖️ Svoris išsaugotas!");
  renderWeight();
  renderDashboard();
}

function removeWeight(date) {
  if (!confirm("Ištrinti šį įrašą?")) return;
  weightLog = weightLog.filter((e) => e.date !== date);
  save("weightLog", weightLog);
  renderWeight();
  renderDashboard();
}

function drawWeightChart(data) {
  const svg = document.getElementById("weightChart");
  const W = 340,
    H = 100,
    PAD = 20;
  const vals = data.map((d) => d.kg);
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const n = data.length;

  const x = (i) => PAD + (i / (n - 1)) * (W - PAD * 2);
  const y = (v) => PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2);

  let points = data.map((d, i) => `${x(i)},${y(d.kg)}`).join(" ");

  // Goal line
  const goalKg = config?.goalWeight;
  let goalLine = "";
  if (goalKg) {
    const gy = y(goalKg);
    if (gy >= 0 && gy <= H) {
      goalLine = `<line x1="${PAD}" y1="${gy}" x2="${W - PAD}" y2="${gy}" stroke="#4ade80" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>`;
    }
  }

  svg.innerHTML = `
    ${goalLine}
    <polyline points="${points}" fill="none" stroke="#ff6b35" stroke-width="2.5" stroke-linejoin="round"/>
    ${data.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.kg)}" r="3" fill="#ff6b35"/>`).join("")}
    ${data.map((d, i) => (i === 0 || i === n - 1 ? `<text x="${x(i)}" y="${y(d.kg) - 7}" text-anchor="middle" fill="#888" font-size="9">${d.kg}</text>` : "")).join("")}
  `;
}

// ==================== PROGRESS ====================
function renderProgress() {
  // Collect all exercises across all days
  const allExercises = [];
  DAYS.forEach((day) => {
    TRAINING_PLAN[day].sections.forEach((s) => {
      s.exercises.forEach((ex) => {
        if (!allExercises.find((e) => e.id === ex.id)) {
          allExercises.push({ ...ex, day });
        }
      });
    });
  });

  // Gather logs per exercise
  let html = "";
  let hasAny = false;

  allExercises.forEach((ex) => {
    const logs = [];
    Object.keys(workoutLog)
      .sort()
      .forEach((key) => {
        const entry = workoutLog[key];
        const sets = entry.exercises?.[ex.id];
        if (sets && sets.length > 0) {
          const validSets = sets.filter((s) => s.reps || s.secs);
          if (validSets.length > 0) {
            logs.push({ date: entry.date, sets: validSets });
          }
        }
      });

    if (logs.length === 0) return;
    hasAny = true;

    // Calculate progress
    const first = logs[0];
    const last = logs[logs.length - 1];
    const firstMaxKg = Math.max(...first.sets.map((s) => s.kg || 0));
    const lastMaxKg = Math.max(...last.sets.map((s) => s.kg || 0));
    const firstTotalReps = first.sets.reduce((a, s) => a + (s.reps || 0), 0);
    const lastTotalReps = last.sets.reduce((a, s) => a + (s.reps || 0), 0);

    let gainLabel = "",
      gainCls = "";
    if (lastMaxKg > firstMaxKg) {
      gainLabel = `+${+(lastMaxKg - firstMaxKg).toFixed(1)} kg`;
      gainCls = "badge-up";
    } else if (lastTotalReps > firstTotalReps) {
      gainLabel = `+${lastTotalReps - firstTotalReps} reps`;
      gainCls = "badge-up";
    } else if (logs.length > 1) {
      gainLabel = "= lygis";
      gainCls = "badge-same";
    }

    html += `<div class="card exercise-progress-card">
      <div class="ep-header">
        <div class="ep-name">${ex.name}</div>
        ${gainLabel ? `<span class="ep-gain ${gainCls}">${gainLabel}</span>` : ""}
      </div>`;

    logs.forEach((log, i) => {
      const prevLog = logs[i - 1];
      let trend = "";
      if (prevLog) {
        const prevMax = Math.max(...prevLog.sets.map((s) => s.kg || 0));
        const curMax = Math.max(...log.sets.map((s) => s.kg || 0));
        const prevReps = prevLog.sets.reduce((a, s) => a + (s.reps || 0), 0);
        const curReps = log.sets.reduce((a, s) => a + (s.reps || 0), 0);
        if (curMax > prevMax || curReps > prevReps) trend = "↑";
        else if (curMax < prevMax || curReps < prevReps) trend = "↓";
        else trend = "→";
      }

      const setsStr = log.sets
        .map((s) => {
          if (s.secs) return `${s.secs}s`;
          if (ex.bodyweight) return `${s.reps || "?"}`;
          return `${s.kg || "?"}kg×${s.reps || "?"}`;
        })
        .join(" / ");

      html += `<div class="ep-log-row">
        <span class="ep-date">${formatDateShort(log.date)}</span>
        <span class="ep-sets">${setsStr}</span>
        <span class="ep-trend" style="color:${trend === "↑" ? "var(--green)" : trend === "↓" ? "var(--red)" : "var(--text3)"}">${trend}</span>
      </div>`;
    });

    html += `</div>`;
  });

  if (!hasAny) {
    html = `<div class="empty-state"><div>📈</div><div>Dar nėra treniruočių įrašų</div></div>`;
  }

  document.getElementById("progressContent").innerHTML = html;
}

// ==================== SETTINGS ====================
function renderSettings() {
  if (!config) {
    document.getElementById("settingsInfo").innerHTML =
      `<div style="color:var(--text2);font-size:13px">Nustatymai nėra sukurti.</div>`;
    return;
  }
  const start = new Date(config.startDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + config.weeks * 7);
  document.getElementById("settingsInfo").innerHTML = `
    <div class="settings-row"><span class="settings-label">Starto svoris</span><span class="settings-val">${config.startWeight} kg</span></div>
    <div class="settings-row"><span class="settings-label">Tikslinis svoris</span><span class="settings-val">${config.goalWeight} kg</span></div>
    <div class="settings-row"><span class="settings-label">Trukm&eogon;</span><span class="settings-val">${config.weeks} sav.</span></div>
    <div class="settings-row"><span class="settings-label">Pradžia</span><span class="settings-val">${config.startDate}</span></div>
    <div class="settings-row"><span class="settings-label">Pabaiga</span><span class="settings-val">${end.toISOString().split("T")[0]}</span></div>
  `;
}

function exportData() {
  const data = {
    config,
    dailyLog,
    workoutLog,
    weightLog,
    exportDate: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cut-tracker-backup-${todayStr()}.json`;
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.config) {
        config = data.config;
        save("config", config);
      }
      if (data.dailyLog) {
        dailyLog = data.dailyLog;
        save("dailyLog", dailyLog);
      }
      if (data.workoutLog) {
        workoutLog = data.workoutLog;
        save("workoutLog", workoutLog);
      }
      if (data.weightLog) {
        weightLog = data.weightLog;
        save("weightLog", weightLog);
      }
      showToast("✅ Duomenys atstatyti!");
      renderAll();
    } catch {
      alert("Nepavyko nuskaityti failo.");
    }
  };
  reader.readAsText(file);
}

function resetData() {
  if (
    !confirm(
      "Ar tikrai nori ištrinti VISUS duomenis? Šio veiksmo negalima atšaukti.",
    )
  )
    return;
  localStorage.clear();
  location.reload();
}

// ==================== SYNC UI ====================
function showSyncIndicator(msg) {
  let el = document.getElementById("syncIndicator");
  if (!el) {
    el = document.createElement("div");
    el.id = "syncIndicator";
    el.style.cssText =
      "position:fixed;top:12px;right:12px;background:#1a1a1a;border:1px solid #333;border-radius:99px;padding:6px 14px;font-size:12px;font-weight:700;color:#888;z-index:9000;";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = "block";
}
function hideSyncIndicator() {
  const el = document.getElementById("syncIndicator");
  if (el) el.style.display = "none";
}

// ==================== INIT ====================
function renderAll() {
  renderDashboard();
}

// Try loading from cloud first
(async () => {
  showSyncIndicator("☁️ Kraunama...");
  const loaded = await loadFromCloud();
  hideSyncIndicator();
  if (!config) {
    document.getElementById("setupModal").style.display = "flex";
  } else {
    document.getElementById("setupModal").style.display = "none";
    renderAll();
  }
})();
