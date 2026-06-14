// ==========================================================================
// PulseFit - Core Application & Workout Logging State Management
// ==========================================================================

// // --- Default Exercise Database ---
const DEFAULT_EXERCISES = [
  { id: 'incline-chest-press-machine', name: 'Incline Chest Press (Machine)', category: 'Chest' },
  { id: 'shoulder-press-dumbbell', name: 'Shoulder Press (Dumbbell)', category: 'Shoulders' },
  { id: 'lateral-raise-machine', name: 'Lateral Raise (Machine)', category: 'Shoulders' },
  { id: 'triceps-rope-pushdown', name: 'Triceps Rope Pushdown', category: 'Arms' },
  { id: 'butterfly-pec-deck', name: 'Butterfly (Pec Deck)', category: 'Chest' },
  { id: 'skullcrusher-dumbbell', name: 'Skullcrusher (Dumbbell)', category: 'Arms' },
  { id: 'seated-row-machine', name: 'Seated Row (Machine)', category: 'Back' },
  { id: 'lat-pulldown-cable', name: 'Lat Pulldown (Cable)', category: 'Back' },
  { id: 'straight-arm-lat-pulldown-cable', name: 'Straight Arm Lat Pulldown (Cable)', category: 'Back' },
  { id: 'preacher-curl-machine', name: 'Preacher Curl (Machine)', category: 'Arms' },
  { id: 'rear-delt-reverse-fly-machine', name: 'Rear Delt Reverse Fly (Machine)', category: 'Shoulders' },
  { id: 'seated-incline-curl-dumbbell', name: 'Seated Incline Curl (Dumbbell)', category: 'Arms' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs' },
  { id: 'leg-press-horizontal-machine', name: 'Leg Press Horizontal (Machine)', category: 'Legs' },
  { id: 'leg-extension-machine', name: 'Leg Extension (Machine)', category: 'Legs' },
  { id: 'seated-leg-curl-machine', name: 'Seated Leg Curl (Machine)', category: 'Legs' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', category: 'Legs' },
  { id: 'hip-abduction-machine', name: 'Hip Abduction (Machine)', category: 'Legs' },
  { id: 'hip-adduction-machine', name: 'Hip Adduction (Machine)', category: 'Legs' }
];

// --- Templates ---
const ROUTINE_TEMPLATES = {
  push: {
    name: 'Day 1-push',
    notes: 'Chest, shoulders, and triceps focus.',
    exercises: [
      { id: 'incline-chest-press-machine', restTime: 150, notes: '4 sets x 6-8 reps. Press lower back flat into pad. Maximize weight.', sets: [{ weight: 100, reps: 6, type: 'normal' }, { weight: 100, reps: 6, type: 'normal' }, { weight: 100, reps: 6, type: 'normal' }, { weight: 100, reps: 6, type: 'normal' }] },
      { id: 'shoulder-press-dumbbell', restTime: 120, notes: '3 sets x 8-10 reps. Set the bench to an 80-degree incline. Lock your core.', sets: [{ weight: 40, reps: 9, type: 'normal' }, { weight: 40, reps: 9, type: 'normal' }, { weight: 40, reps: 9, type: 'normal' }] },
      { id: 'lateral-raise-machine', restTime: 60, notes: '3 sets x 12-15 reps. Keep your torso perfectly vertical.', sets: [{ weight: 50, reps: 12, type: 'normal' }, { weight: 50, reps: 12, type: 'normal' }, { weight: 50, reps: 12, type: 'normal' }] },
      { id: 'triceps-rope-pushdown', restTime: 60, notes: '3 sets x 10-12 reps. Stand upright. Keep elbows glued to your ribs.', sets: [{ weight: 60, reps: 10, type: 'normal' }, { weight: 60, reps: 10, type: 'normal' }, { weight: 60, reps: 10, type: 'normal' }] },
      { id: 'butterfly-pec-deck', restTime: 60, notes: '3 sets x 12-15 reps. Keep your back flat against the seat.', sets: [{ weight: 80, reps: 12, type: 'normal' }, { weight: 80, reps: 12, type: 'normal' }, { weight: 80, reps: 12, type: 'normal' }] },
      { id: 'skullcrusher-dumbbell', restTime: 60, notes: '3 sets x 10-12 reps. Feet flat on the bench. Use the knee kick-back to set up and the leg rock-up to sit up. No lifting from the floor.', sets: [{ weight: 30, reps: 10, type: 'normal' }, { weight: 30, reps: 10, type: 'normal' }, { weight: 30, reps: 10, type: 'normal' }] }
    ]
  },
  pull: {
    name: 'Day 2-Pull',
    notes: 'Back, rear delts, and biceps focus.',
    exercises: [
      { id: 'seated-row-machine', restTime: 150, notes: '3 sets x 6-8 reps. Your chest never leaves the pad.', sets: [{ weight: 120, reps: 7, type: 'normal' }, { weight: 120, reps: 7, type: 'normal' }, { weight: 120, reps: 7, type: 'normal' }] },
      { id: 'lat-pulldown-cable', restTime: 120, notes: '3 sets x 8-10 reps. Sit vertically. Lock your knees tight under the pads.', sets: [{ weight: 110, reps: 9, type: 'normal' }, { weight: 110, reps: 9, type: 'normal' }, { weight: 110, reps: 9, type: 'normal' }] },
      { id: 'straight-arm-lat-pulldown-cable', restTime: 60, notes: '3 sets x 12-15 reps. Stand with a slight, rigid hinge at the hips. Keep your arms straight and pull the bar down to your thighs. This isolates the lats to enhance the V-taper without loading the lower back.', sets: [{ weight: 50, reps: 13, type: 'normal' }, { weight: 50, reps: 13, type: 'normal' }, { weight: 50, reps: 13, type: 'normal' }] },
      { id: 'preacher-curl-machine', restTime: 60, notes: '3 sets x 10-12 reps. Triceps flat on the pad. No torso swinging.', sets: [{ weight: 50, reps: 10, type: 'normal' }, { weight: 50, reps: 10, type: 'normal' }, { weight: 50, reps: 10, type: 'normal' }] },
      { id: 'rear-delt-reverse-fly-machine', restTime: 60, notes: '3 sets x 12-15 reps. Chest glued to the pad.', sets: [{ weight: 70, reps: 12, type: 'normal' }, { weight: 70, reps: 12, type: 'normal' }, { weight: 70, reps: 12, type: 'normal' }] },
      { id: 'seated-incline-curl-dumbbell', restTime: 60, notes: '3 sets x 10-12 reps. Set a bench to a 60-degree angle. Lie back so your spine is 100% supported by the pad.', sets: [{ weight: 25, reps: 10, type: 'normal' }, { weight: 25, reps: 10, type: 'normal' }, { weight: 25, reps: 10, type: 'normal' }] }
    ]
  },
  legs: {
    name: 'Day 3-Legs',
    notes: 'Quad and hamstring dominant leg routine.',
    exercises: [
      { id: 'bulgarian-split-squat', restTime: 105, notes: '3 sets x 6-8 reps per leg. Hold dumbbells at your sides. Drop straight down. Keep your torso upright.', sets: [{ weight: 30, reps: 7, type: 'normal' }, { weight: 30, reps: 7, type: 'normal' }, { weight: 30, reps: 7, type: 'normal' }] },
      { id: 'leg-press-horizontal-machine', restTime: 120, notes: '3 sets x 10-12 reps.', sets: [{ weight: 200, reps: 10, type: 'normal' }, { weight: 200, reps: 10, type: 'normal' }, { weight: 200, reps: 10, type: 'normal' }] },
      { id: 'leg-extension-machine', restTime: 60, notes: '3 sets x 12-15 reps. Lower back flat against the seat. Hold the top contraction for 2 seconds. (Execute a 30% weight reduction drop-set to failure immediately at the end of the 3rd set.)', sets: [{ weight: 100, reps: 12, type: 'normal' }, { weight: 100, reps: 12, type: 'normal' }, { weight: 100, reps: 12, type: 'normal' }] },
      { id: 'seated-leg-curl-machine', restTime: 60, notes: '3 sets x 12-15 reps. Stick to seated. (Execute a 30% weight reduction drop-set to failure immediately at the end of the 3rd set.)', sets: [{ weight: 90, reps: 12, type: 'normal' }, { weight: 90, reps: 12, type: 'normal' }, { weight: 90, reps: 12, type: 'normal' }] },
      { id: 'seated-calf-raise', restTime: 60, notes: '3 sets x 15-20 reps. No standing calf raises to avoid vertical spinal compression.', sets: [{ weight: 45, reps: 10, type: 'normal' }, { weight: 45, reps: 10, type: 'normal' }, { weight: 45, reps: 10, type: 'normal' }] },
      { id: 'hip-abduction-machine', restTime: 60, notes: '3 sets x 15 reps. Sit upright and press your knees outward.', sets: [{ weight: 100, reps: 14, type: 'normal' }, { weight: 100, reps: 14, type: 'normal' }, { weight: 100, reps: 14, type: 'normal' }] },
      { id: 'hip-adduction-machine', restTime: 60, notes: '3 sets x 15 reps. Press the knees inward.', sets: [{ weight: 100, reps: 12, type: 'normal' }, { weight: 100, reps: 12, type: 'normal' }, { weight: 100, reps: 12, type: 'normal' }] }
    ]
  }
};

// --- App State ---
let workoutHistory = [];
let exercises = [];
let activeWorkout = null;
let settings = {
  apiKey: '',
  googleClientId: '413477786705-cks607s474q3tn75dm4fh5l5pnci7rmc.apps.googleusercontent.com',
  googleFolder: 'Pulsefit',
  weightUnit: 'lbs',
  defaultRest: 90,
  timerSound: true,
  activeModel: 'gemini-3.5-flash',
  userName: 'Saurabh'
};

// --- Access Control (Approval Gate) ---
const ACCESS_SHEET_ID = '1ltvM_wOrUzWsgnE2OOXptuEwGJO7NH8Q7CjpScBlKFk';

// --- Timer & Visuals State ---
let workoutTimerInterval = null;
let restTimerInterval = null;
let restTimerTotalSeconds = 0;
let restTimerSecondsRemaining = 0;
let analyticsChart = null;

// ==========================================================================
// Initialization & Storage
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initUI();
  initNutrition();
  lucide.createIcons();
  initAccessCheck();
});

function loadData() {
  // Load settings
  const storedSettings = localStorage.getItem('pulsefit_settings');
  if (storedSettings) {
    settings = { ...settings, ...JSON.parse(storedSettings) };
    if (!settings.googleClientId || settings.googleClientId.trim() === '') {
      settings.googleClientId = '413477786705-cks607s474q3tn75dm4fh5l5pnci7rmc.apps.googleusercontent.com';
    }
  }
  
  // Load exercise DB
  const storedExercises = localStorage.getItem('pulsefit_exercises');
  if (storedExercises) {
    exercises = JSON.parse(storedExercises);
  } else {
    exercises = [...DEFAULT_EXERCISES];
    saveExercises();
  }
  
  // Load history
  const storedHistory = localStorage.getItem('pulsefit_history');
  if (storedHistory) {
    workoutHistory = JSON.parse(storedHistory);
  }
  
  // Load active workout if crashed/reloaded
  const storedActiveWorkout = localStorage.getItem('pulsefit_active_workout');
  if (storedActiveWorkout) {
    activeWorkout = JSON.parse(storedActiveWorkout);
  }
}

function saveSettings() {
  localStorage.setItem('pulsefit_settings', JSON.stringify(settings));
  updateAPIStatusPill();
  if (typeof updateGDriveStatus === 'function') {
    updateGDriveStatus(isGDriveConnected() ? 'connected' : 'disconnected');
  }
}

function saveExercises() {
  localStorage.setItem('pulsefit_exercises', JSON.stringify(exercises));
}

function saveHistory() {
  localStorage.setItem('pulsefit_history', JSON.stringify(workoutHistory));
}

function saveActiveWorkoutState() {
  if (activeWorkout) {
    localStorage.setItem('pulsefit_active_workout', JSON.stringify(activeWorkout));
  } else {
    localStorage.removeItem('pulsefit_active_workout');
  }
}

// ==========================================================================
// UI Initialization
// ==========================================================================

function initUI() {
  // Setup API Status Pill
  updateAPIStatusPill();
  
  // Navigation / Tabs
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Active workout check
  if (activeWorkout) {
    restoreActiveWorkout();
  } else {
    renderStartWorkoutView();
  }
  
  // Event listeners for Settings
  document.getElementById('open-settings-btn').addEventListener('click', openSettingsModal);
  document.getElementById('close-settings-modal').addEventListener('click', closeSettingsModal);
  document.getElementById('save-api-key-btn').addEventListener('click', saveAPIKey);
  document.getElementById('test-api-key-btn').addEventListener('click', async () => {
    const keyInput = document.getElementById('settings-api-key');
    const keyValue = keyInput.value.trim();
    const resultSpan = document.getElementById('api-key-test-result');
    const modelsListDiv = document.getElementById('api-key-models-list');
    
    if (keyValue === '') {
      resultSpan.textContent = 'Please enter a key first.';
      resultSpan.style.color = 'var(--danger)';
      if (modelsListDiv) modelsListDiv.style.display = 'none';
      return;
    }
    
    resultSpan.textContent = 'Testing connection...';
    resultSpan.style.color = 'var(--text-muted)';
    if (modelsListDiv) modelsListDiv.style.display = 'none';
    
    try {
      // 1. Fetch available models
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyValue}`);
      const modelsData = await modelsResponse.json();
      
      let modelsSupported = [];
      if (modelsResponse.ok && modelsData.models) {
        modelsSupported = modelsData.models.map(m => m.name.replace('models/', ''));
        if (modelsListDiv) {
          modelsListDiv.innerHTML = `<strong>Available models:</strong><br>${modelsSupported.join(', ')}`;
          modelsListDiv.style.display = 'block';
        }
      }
      
      // 2. Build prioritized models list from the supported models
      const flashModels = modelsSupported.filter(m => m.includes('flash'));
      const proModels = modelsSupported.filter(m => m.includes('pro'));
      const otherModels = modelsSupported.filter(m => !m.includes('flash') && !m.includes('pro'));
      
      const preferredKeywords = ['3.5-flash', '3.1-flash', '3-flash', '2.5-flash', '2.0-flash', '1.5-flash', 'flash-latest', 'flash-lite', 'flash'];
      const prioritizedModels = [];
      
      for (let keyword of preferredKeywords) {
        const matches = flashModels.filter(m => m.includes(keyword) && !prioritizedModels.includes(m));
        prioritizedModels.push(...matches);
      }
      
      flashModels.forEach(m => {
        if (!prioritizedModels.includes(m)) prioritizedModels.push(m);
      });
      
      prioritizedModels.push(...proModels);
      prioritizedModels.push(...otherModels);
      
      if (prioritizedModels.length === 0) {
        prioritizedModels.push('gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash');
      }
      
      const uniqueModels = [...new Set(prioritizedModels)];
      
      // 3. Perform a test generateContent call using the fallback chain
      let response = null;
      let testModel = 'gemini-3.5-flash';
      let errorDetails = '';
      
      for (let model of uniqueModels) {
        testModel = model;
        console.log(`Testing content generation with model: ${model}`);
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyValue}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': keyValue
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'ping' }] }]
            })
          });
          if (response.ok) break;
          
          const errJson = await response.json().catch(() => ({}));
          errorDetails = errJson.error?.message || response.statusText || 'Unknown Error';
          console.warn(`Test Connection: Failed for ${model} (HTTP ${response.status}): ${errorDetails}`);
        } catch (err) {
          errorDetails = err.message;
          console.warn(`Test Connection: Network error for ${model}: ${errorDetails}`);
        }
      }
      
      if (response && response.ok) {
        settings.activeModel = testModel;
        saveSettings();
        resultSpan.textContent = `Success! (${testModel} active)`;
        resultSpan.style.color = '#10b981'; // green
      } else {
        resultSpan.textContent = `Error: ${errorDetails || (response ? response.statusText : 'Unknown Error')}`;
        resultSpan.style.color = 'var(--danger)';
      }
    } catch (err) {
      resultSpan.textContent = `Network Error: ${err.message}`;
      resultSpan.style.color = 'var(--danger)';
      console.error('Gemini Key Test Connection Network Exception:', err);
    }
  });
  document.getElementById('api-status-pill').addEventListener('click', () => {
    if (settings.apiKey === '') openSettingsModal();
  });
  
  // Event listeners for Settings Preferences
  const unitLbs = document.getElementById('unit-lbs');
  const unitKg = document.getElementById('unit-kg');
  unitLbs.addEventListener('click', () => setWeightUnit('lbs'));
  unitKg.addEventListener('click', () => setWeightUnit('kg'));
  
  const restTimerSelect = document.getElementById('settings-default-rest');
  restTimerSelect.value = settings.defaultRest;
  restTimerSelect.addEventListener('change', (e) => {
    settings.defaultRest = parseInt(e.target.value);
    saveSettings();
  });
  
  const timerSoundCheckbox = document.getElementById('settings-timer-sound');
  timerSoundCheckbox.checked = settings.timerSound;
  timerSoundCheckbox.addEventListener('change', (e) => {
    settings.timerSound = e.target.checked;
    saveSettings();
  });
  
  // Backup & Restore
  document.getElementById('export-data-btn').addEventListener('click', exportData);
  document.getElementById('import-data-file').addEventListener('change', importData);
  document.getElementById('reset-app-btn').addEventListener('click', resetAppData);
  
  // Access Control UI listeners
  const createAccessBtn = document.getElementById('create-access-sheet-btn');
  if (createAccessBtn) {
    createAccessBtn.addEventListener('click', () => {
      if (typeof createAccessControlSheet === 'function') {
        createAccessControlSheet();
      }
    });
  }
  
  const accessLoginBtn = document.getElementById('access-login-btn');
  if (accessLoginBtn) {
    accessLoginBtn.addEventListener('click', connectAccessGateGoogle);
  }
  
  // Save Username Listener
  document.getElementById('save-username-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('settings-username');
    const nameValue = nameInput.value.trim();
    if (!nameValue) {
      alert('User Name cannot be empty!');
      return;
    }
    settings.userName = nameValue;
    saveSettings();
    updateUserNameUI();
    alert('User Name saved successfully!');
  });

  // Google Drive Sync Listeners
  document.getElementById('save-google-client-id-btn').addEventListener('click', () => {
    const cid = document.getElementById('settings-google-client-id').value.trim();
    settings.googleClientId = cid;
    saveSettings();
    alert('Google Client ID saved!');
  });

  document.getElementById('save-google-folder-btn').addEventListener('click', () => {
    const folder = document.getElementById('settings-google-folder').value.trim();
    if (!folder) {
      alert('Google Drive Folder Name cannot be empty!');
      return;
    }
    settings.googleFolder = folder;
    saveSettings();
    alert('Google Drive Folder Name saved!');
  });
  
  document.getElementById('connect-gdrive-btn').addEventListener('click', () => {
    if (typeof connectGoogleDrive === 'function') connectGoogleDrive();
  });
  
  document.getElementById('toggle-gdrive-help').addEventListener('click', () => {
    const help = document.getElementById('gdrive-help-content');
    help.classList.toggle('hidden');
  });
  
  // Close Modals
  document.getElementById('close-plate-modal').onclick = () => document.getElementById('plate-modal').classList.add('hidden');
  document.getElementById('close-ex-info-modal').onclick = () => document.getElementById('exercise-info-modal').classList.add('hidden');
  document.getElementById('close-log-viewer-modal').onclick = () => document.getElementById('log-viewer-modal').classList.add('hidden');
  
  document.getElementById('view-gdrive-log-btn').addEventListener('click', () => {
    if (typeof viewDriveLog === 'function') viewDriveLog();
  });
  
  document.getElementById('sync-gdrive-data-btn').addEventListener('click', async () => {
    const btn = document.getElementById('sync-gdrive-data-btn');
    const originalHTML = btn.innerHTML;
    try {
      btn.disabled = true;
      btn.textContent = 'Syncing...';
      
      if (typeof pullAndMergeDataFromDrive === 'function') {
        const success = await pullAndMergeDataFromDrive();
        if (success) {
          alert('Synchronization complete! All workouts and nutrition logs have been synced.');
          renderNutritionTab();
          renderHistory();
          renderRoutineTemplates();
        } else {
          alert('Synchronization failed. Please check your network and Google Drive connection.');
        }
      }
    } catch (err) {
      console.error("Manual sync failed:", err);
      alert(`Sync Error: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      if (window.lucide) window.lucide.createIcons();
    }
  });
  
  // Active Workout Buttons
  document.getElementById('start-workout-btn').addEventListener('click', () => startWorkout());
  renderRoutineTemplates();
  
  document.getElementById('cancel-workout-btn').addEventListener('click', cancelActiveWorkout);
  document.getElementById('finish-workout-btn').addEventListener('click', finishActiveWorkout);
  document.getElementById('add-exercise-btn').addEventListener('click', openExerciseModal);
  document.getElementById('close-exercise-modal').addEventListener('click', closeExerciseModal);
  
  // Exercise Modal Search & Filters
  document.getElementById('exercise-search').addEventListener('input', filterExercises);
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterExercises();
    });
  });
  
  document.getElementById('create-custom-exercise-btn').addEventListener('click', createCustomExercise);
  
  // History tab events
  document.getElementById('history-search').addEventListener('input', renderHistoryTab);
  
  // Analytics tab events
  document.getElementById('analytics-exercise-select').addEventListener('change', updateAnalyticsChart);
  document.getElementById('analytics-metric-select').addEventListener('change', updateAnalyticsChart);
  
  // Rest Timer buttons
  document.getElementById('timer-minus-30').addEventListener('click', () => adjustRestTimer(-30));
  document.getElementById('timer-plus-30').addEventListener('click', () => adjustRestTimer(30));
  document.getElementById('timer-skip').addEventListener('click', skipRestTimer);
  
  // Init Settings Fields
  document.getElementById('settings-username').value = settings.userName || 'Saurabh';
  document.getElementById('settings-api-key').value = settings.apiKey;
  document.getElementById('settings-google-client-id').value = settings.googleClientId || '';
  document.getElementById('settings-google-folder').value = settings.googleFolder || 'Pulsefit';
  const accessSheetIdInput = document.getElementById('settings-access-sheet-id');
  if (accessSheetIdInput) {
    accessSheetIdInput.value = ACCESS_SHEET_ID || 'Disabled (Public Site)';
  }
  if (settings.weightUnit === 'kg') {
    unitLbs.classList.remove('active');
    unitKg.classList.add('active');
  }
  
  updateUserNameUI();
  
  if (typeof updateGDriveStatus === 'function') {
    updateGDriveStatus(isGDriveConnected() ? 'connected' : 'disconnected');
  }
}

function switchTab(tabId) {
  // Deactivate all
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  // Activate selected
  const activeBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  const activePane = document.getElementById(tabId);
  
  if (activeBtn && activePane) {
    activeBtn.classList.add('active');
    activePane.classList.add('active');
    
    // Update topbar title
    const pageTitle = document.getElementById('page-title');
    if (tabId === 'tab-logger') {
      pageTitle.textContent = activeWorkout ? 'Active Workout' : 'Log Workout';
    } else if (tabId === 'tab-history') {
      pageTitle.textContent = 'Workout History';
      renderHistoryTab();
    } else if (tabId === 'tab-analytics') {
      pageTitle.textContent = 'Analytics';
      renderAnalyticsTab();
    } else if (tabId === 'tab-coach') {
      pageTitle.textContent = 'Gemini Fitness Coach';
      initGeminiCoachUI();
    } else if (tabId === 'tab-nutrition') {
      pageTitle.textContent = 'Nutrition & Macros';
      renderNutritionTab();
    }
  }
}

function updateAPIStatusPill() {
  const pill = document.getElementById('api-status-pill');
  const text = document.getElementById('api-status-text');
  
  if (settings.apiKey && settings.apiKey.trim().length > 10) {
    pill.className = 'api-status-pill success';
    text.textContent = 'API Key Active';
  } else {
    pill.className = 'api-status-pill error';
    text.textContent = 'No API Key';
  }
}

// ==========================================================================
// Settings Modal Functions
// ==========================================================================

function openSettingsModal() {
  const testResult = document.getElementById('api-key-test-result');
  if (testResult) testResult.textContent = '';
  const modelsListDiv = document.getElementById('api-key-models-list');
  if (modelsListDiv) {
    modelsListDiv.style.display = 'none';
    modelsListDiv.innerHTML = '';
  }
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function saveAPIKey() {
  const keyInput = document.getElementById('settings-api-key');
  const keyValue = keyInput.value.trim();
  
  if (keyValue === '') {
    settings.apiKey = '';
    saveSettings();
    alert('API Key cleared.');
    closeSettingsModal();
    return;
  }
  
  if (keyValue.length < 10) {
    alert('Invalid Gemini API Key. The key appears to be too short.');
    return;
  }
  
  settings.apiKey = keyValue;
  saveSettings();
  alert('Gemini API Key saved successfully!');
  closeSettingsModal();
}

function setWeightUnit(unit) {
  settings.weightUnit = unit;
  document.getElementById('unit-lbs').classList.toggle('active', unit === 'lbs');
  document.getElementById('unit-kg').classList.toggle('active', unit === 'kg');
  
  // Update standard metric units in DOM if needed
  const metricOptions = document.getElementById('analytics-metric-select');
  if (metricOptions) {
    metricOptions.options[0].text = `Estimated 1RM (${unit})`;
    metricOptions.options[1].text = `Total Volume (${unit})`;
    metricOptions.options[2].text = `Max Weight (${unit})`;
  }
  
  saveSettings();
  
  // Re-render currently active lists
  if (activeWorkout) {
    renderActiveWorkoutExercises();
  }
}

// Backup & Recovery
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
    settings,
    exercises,
    workoutHistory
  }, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `pulsefit_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(e) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const parsedData = JSON.parse(event.target.result);
      if (parsedData.settings) settings = { ...settings, ...parsedData.settings };
      if (parsedData.exercises) exercises = parsedData.exercises;
      if (parsedData.workoutHistory) workoutHistory = parsedData.workoutHistory;
      
      saveSettings();
      saveExercises();
      saveHistory();
      
      alert('Data imported successfully!');
      location.reload();
    } catch (err) {
      alert('Failed to parse JSON backup file.');
    }
  };
  fileReader.readAsText(e.target.files[0]);
}

function resetAppData() {
  if (confirm('Are you absolutely sure you want to delete all workouts, settings, and custom exercises? This cannot be undone.')) {
    localStorage.clear();
    alert('Application data reset successfully.');
    location.reload();
  }
}

// ==========================================================================
// Workout Logging - Session Management
// ==========================================================================

function renderStartWorkoutView() {
  document.getElementById('start-workout-view').classList.remove('hidden');
  document.getElementById('active-workout-view').classList.add('hidden');
  document.getElementById('active-workout-pill').classList.add('hidden');
  
  // Reset Title
  document.getElementById('page-title').textContent = 'Log Workout';
}

function startWorkout(templateId = null) {
  // Check if there's already an active workout
  if (activeWorkout) return;
  
  let name = 'Morning Workout';
  const hour = new Date().getHours();
  if (hour >= 12 && hour < 17) name = 'Afternoon Workout';
  else if (hour >= 17 && hour < 22) name = 'Evening Workout';
  else if (hour >= 22 || hour < 5) name = 'Night Workout';
  
  let workoutExercises = [];
  let notes = '';
  
  if (templateId && ROUTINE_TEMPLATES[templateId]) {
    const template = ROUTINE_TEMPLATES[templateId];
    name = template.name;
    notes = template.notes;
    
    // Map template exercises to full objects
    workoutExercises = template.exercises.map(te => {
      const dbExercise = exercises.find(ex => ex.id === te.id);
      return {
        id: te.id,
        name: dbExercise ? dbExercise.name : te.id,
        category: dbExercise ? dbExercise.category : 'Other',
        restTime: te.restTime || 90, // Map routine rest time
        notes: te.notes || '',       // Map routine notes
        sets: te.sets.map((s, index) => ({
          weight: s.weight,
          reps: s.reps,
          completed: false,
          type: s.type || 'normal'   // Map type (normal/warmup/etc)
        }))
      };
    });
  }
  
  activeWorkout = {
    name: name,
    startTime: Date.now(),
    notes: notes,
    exercises: workoutExercises
  };
  
  saveActiveWorkoutState();
  restoreActiveWorkout();
}

function restoreActiveWorkout() {
  document.getElementById('start-workout-view').classList.add('hidden');
  document.getElementById('active-workout-view').classList.remove('hidden');
  
  // Update inputs
  document.getElementById('workout-name-input').value = activeWorkout.name;
  document.getElementById('workout-notes-input').value = activeWorkout.notes || '';
  
  // Setup Page Title
  document.getElementById('page-title').textContent = 'Active Workout';
  
  // Start duration timer
  startWorkoutDurationTimer();
  
  // Render exercises
  renderActiveWorkoutExercises();
  
  // Setup name and notes changes
  document.getElementById('workout-name-input').oninput = (e) => {
    activeWorkout.name = e.target.value;
    saveActiveWorkoutState();
  };
  
  document.getElementById('workout-notes-input').oninput = (e) => {
    activeWorkout.notes = e.target.value;
    saveActiveWorkoutState();
  };
}

function startWorkoutDurationTimer() {
  const timerPill = document.getElementById('active-workout-pill');
  const timerText = document.getElementById('workout-timer-text');
  timerPill.classList.remove('hidden');
  
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  
  function updateTimer() {
    if (!activeWorkout) return;
    const elapsedMs = Date.now() - activeWorkout.startTime;
    const totalSecs = Math.floor(elapsedMs / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    let timeStr = '';
    if (hrs > 0) {
      timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    timerText.textContent = timeStr;
  }
  
  updateTimer();
  workoutTimerInterval = setInterval(updateTimer, 1000);
}

function renderActiveWorkoutExercises() {
  const container = document.getElementById('workout-exercises-list');
  container.innerHTML = '';
  
  if (activeWorkout.exercises.length === 0) {
    container.innerHTML = `
      <div class="workout-hero" style="padding: 30px; border-style: dashed; background: none; box-shadow: none;">
        <i data-lucide="plus-circle" style="width: 24px; height: 24px; color: var(--text-muted); margin-bottom: 8px;"></i>
        <p style="margin-bottom: 0;">Add your first exercise to start logging.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  activeWorkout.exercises.forEach((ex, exIndex) => {
    const card = document.createElement('div');
    card.className = 'logger-exercise-card';
    
    const notesHTML = ex.notes ? `<div class="logger-exercise-notes">${ex.notes}</div>` : '';
    const restTimeFormatted = ex.restTime 
      ? `${Math.floor(ex.restTime / 60)}m ${ex.restTime % 60}s`
      : `${Math.floor(settings.defaultRest / 60)}m ${settings.defaultRest % 60}s`;
      
    const metaHTML = `
      <div class="logger-exercise-meta">
        <div class="logger-exercise-meta-item">
          <i data-lucide="timer"></i>
          <span>Rest: ${restTimeFormatted}</span>
        </div>
        <div class="logger-exercise-meta-item btn-action" onclick="openPlateCalcForExercise(${exIndex})">
          <i data-lucide="calculator"></i>
          <span>Plate Calc</span>
        </div>
        <div class="logger-exercise-meta-item btn-action" onclick="openExerciseHistory('${ex.id}', '${ex.name}', \`${ex.notes || ''}\`)">
          <i data-lucide="history"></i>
          <span>History & Guides</span>
        </div>
      </div>
    `;
    
    card.innerHTML = `
      <div class="logger-exercise-header">
        <div class="logger-exercise-title">
          <h4>${ex.name}</h4>
          <span>${ex.category}</span>
        </div>
        <button class="btn-remove-exercise" onclick="removeExerciseFromActive(${exIndex})" title="Remove Exercise">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      ${notesHTML}
      ${metaHTML}
      
      <table class="set-table" style="margin-top: 10px;">
        <thead>
          <tr>
            <th width="10%" class="center">Set</th>
            <th width="30%">Previous</th>
            <th width="26%" class="center">${settings.weightUnit}</th>
            <th width="22%" class="center">Reps</th>
            <th width="8%" class="center">Done</th>
          </tr>
        </thead>
        <tbody id="exercise-${exIndex}-sets">
          <!-- Sets dynamically populated -->
        </tbody>
      </table>
      
      <button class="btn-add-set" onclick="addSetToActiveExercise(${exIndex})">
        <i data-lucide="plus"></i> Add Set
      </button>
    `;
    
    container.appendChild(card);
    
    // Find previous workout sets for this exercise to show as target
    const prevSets = getPreviousSetsForExercise(ex.id);
    
    // Render sets for this exercise
    const setsBody = document.getElementById(`exercise-${exIndex}-sets`);
    ex.sets.forEach((set, setIndex) => {
      const prevText = prevSets && prevSets[setIndex] 
        ? `${prevSets[setIndex].weight} ${settings.weightUnit} x ${prevSets[setIndex].reps}`
        : '&mdash;';
        
      const setRow = document.createElement('tr');
      setRow.className = `set-row ${set.completed ? 'completed-row' : ''}`;
      setRow.innerHTML = `
        <td class="center">
          <button class="set-badge ${set.type || 'normal'}" onclick="cycleSetType(${exIndex}, ${setIndex})" title="Click to change set type">
            ${getSetTypeChar(set.type || 'normal', setIndex + 1)}
          </button>
        </td>
        <td><span class="set-prev-label">${prevText}</span></td>
        <td class="center">
          <div style="display:inline-flex; align-items:center; gap:4px;">
            <input type="number" step="any" class="set-input weight-input" 
              value="${set.weight !== null ? set.weight : ''}" 
              placeholder="0"
              onchange="updateSetData(${exIndex}, ${setIndex}, 'weight', this.value)"
              ${set.completed ? 'disabled' : ''} style="width: 58px;">
            <button class="btn-timer-ctrl" onclick="openPlateCalcForWeight(${set.weight || 0})" style="padding:4px; width:22px; height:22px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.03);" title="Plate Calculator" ${set.completed ? 'disabled' : ''}>
              <i data-lucide="calculator" style="width:10px; height:10px;"></i>
            </button>
          </div>
        </td>
        <td class="center">
          <input type="number" class="set-input reps-input" 
            value="${set.reps !== null ? set.reps : ''}" 
            placeholder="0"
            onchange="updateSetData(${exIndex}, ${setIndex}, 'reps', this.value)"
            ${set.completed ? 'disabled' : ''}>
        </td>
        <td class="center">
          <button class="btn-complete-set ${set.completed ? 'completed' : ''}" 
            onclick="toggleSetCompletion(${exIndex}, ${setIndex})">
            <i data-lucide="check"></i>
          </button>
        </td>
        <td width="4%">
          <button class="btn-delete-set" onclick="removeSetFromActiveExercise(${exIndex}, ${setIndex})" title="Delete Set">
            <i data-lucide="x"></i>
          </button>
        </td>
      `;
      setsBody.appendChild(setRow);
    });
  });
  
  lucide.createIcons();
}

function getPreviousSetsForExercise(exerciseId) {
  // Scan backward through history to find the most recent completed workout containing this exercise
  for (let i = workoutHistory.length - 1; i >= 0; i--) {
    const workout = workoutHistory[i];
    const match = workout.exercises.find(ex => ex.id === exerciseId);
    if (match) return match.sets;
  }
  return null;
}

function updateSetData(exIndex, setIndex, field, value) {
  const val = parseFloat(value);
  activeWorkout.exercises[exIndex].sets[setIndex][field] = isNaN(val) ? null : val;
  saveActiveWorkoutState();
}

function addSetToActiveExercise(exIndex) {
  const sets = activeWorkout.exercises[exIndex].sets;
  let weight = 0;
  let reps = 10;
  
  // Copy weights/reps from previous set if it exists
  if (sets.length > 0) {
    const lastSet = sets[sets.length - 1];
    weight = lastSet.weight;
    reps = lastSet.reps;
  } else {
    // Attempt to copy from historical previous workout
    const prevSets = getPreviousSetsForExercise(activeWorkout.exercises[exIndex].id);
    if (prevSets && prevSets.length > 0) {
      weight = prevSets[0].weight;
      reps = prevSets[0].reps;
    }
  }
  
  sets.push({ weight, reps, completed: false });
  saveActiveWorkoutState();
  renderActiveWorkoutExercises();
}

function removeSetFromActiveExercise(exIndex, setIndex) {
  activeWorkout.exercises[exIndex].sets.splice(setIndex, 1);
  saveActiveWorkoutState();
  renderActiveWorkoutExercises();
}

function toggleSetCompletion(exIndex, setIndex) {
  const ex = activeWorkout.exercises[exIndex];
  const set = ex.sets[setIndex];
  set.completed = !set.completed;
  
  saveActiveWorkoutState();
  renderActiveWorkoutExercises();
  
  // Trigger rest timer on completed set (if checked)
  if (set.completed) {
    // Fill in default values if user completed a set without typing weights/reps
    if (set.weight === null) set.weight = 0;
    if (set.reps === null) set.reps = 0;
    
    const restSeconds = ex.restTime !== undefined ? ex.restTime : settings.defaultRest;
    startRestTimer(restSeconds);
  }
}

function removeExerciseFromActive(exIndex) {
  if (confirm(`Remove "${activeWorkout.exercises[exIndex].name}" from this workout?`)) {
    activeWorkout.exercises.splice(exIndex, 1);
    saveActiveWorkoutState();
    renderActiveWorkoutExercises();
  }
}

// ==========================================================================
// Exercise Selection Modal
// ==========================================================================

function openExerciseModal() {
  document.getElementById('exercise-modal').classList.remove('hidden');
  document.getElementById('exercise-search').value = '';
  document.getElementById('exercise-search').focus();
  filterExercises();
}

function closeExerciseModal() {
  document.getElementById('exercise-modal').classList.add('hidden');
}

function filterExercises() {
  const searchVal = document.getElementById('exercise-search').value.toLowerCase().trim();
  const selectedCategory = document.querySelector('.category-pill.active').getAttribute('data-category');
  const listContainer = document.getElementById('exercise-select-list');
  listContainer.innerHTML = '';
  
  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchVal);
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Sort alphabetically
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  
  if (filtered.length === 0) {
    listContainer.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;">No exercises found.</p>`;
    return;
  }
  
  filtered.forEach(ex => {
    const item = document.createElement('button');
    item.className = 'exercise-select-item';
    item.innerHTML = `
      <div class="exercise-select-info">
        <h4>${ex.name}</h4>
        <span>${ex.category}</span>
      </div>
      <i data-lucide="chevron-right"></i>
    `;
    item.addEventListener('click', () => {
      addExerciseToActive(ex);
      closeExerciseModal();
    });
    listContainer.appendChild(item);
  });
  
  lucide.createIcons();
}

function addExerciseToActive(exercise) {
  // Check if exercise already exists in workout
  const exists = activeWorkout.exercises.some(ex => ex.id === exercise.id);
  if (exists) {
    alert(`"${exercise.name}" is already in this workout.`);
    return;
  }
  
  // Create first set copying previous workout or default
  let weight = 0;
  let reps = 10;
  const prevSets = getPreviousSetsForExercise(exercise.id);
  if (prevSets && prevSets.length > 0) {
    weight = prevSets[0].weight;
    reps = prevSets[0].reps;
  }
  
  activeWorkout.exercises.push({
    id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    sets: [{ weight, reps, completed: false }]
  });
  
  saveActiveWorkoutState();
  renderActiveWorkoutExercises();
}

function createCustomExercise() {
  const nameInput = document.getElementById('custom-exercise-name');
  const catSelect = document.getElementById('custom-exercise-category');
  const name = nameInput.value.trim();
  const category = catSelect.value;
  
  if (name === '') {
    alert('Please enter an exercise name.');
    return;
  }
  
  // Check if exists
  const exists = exercises.some(ex => ex.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert('An exercise with this name already exists.');
    return;
  }
  
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newExercise = { id, name, category };
  
  exercises.push(newExercise);
  saveExercises();
  
  nameInput.value = '';
  filterExercises();
  alert(`Custom exercise "${name}" created!`);
}

// ==========================================================================
// Finish / Cancel Session
// ==========================================================================

function cancelActiveWorkout() {
  if (confirm('Are you sure you want to cancel and delete this workout? This cannot be undone.')) {
    activeWorkout = null;
    saveActiveWorkoutState();
    
    // Stop timers
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    document.getElementById('active-workout-pill').classList.add('hidden');
    skipRestTimer();
    
    renderStartWorkoutView();
  }
}

function finishActiveWorkout() {
  if (activeWorkout.exercises.length === 0) {
    alert('Please add at least one exercise to finish your workout.');
    return;
  }
  
  // Filter out exercises that have no completed sets
  const completedExercises = activeWorkout.exercises.map(ex => {
    return {
      id: ex.id,
      name: ex.name,
      category: ex.category,
      sets: ex.sets.filter(s => s.completed)
    };
  }).filter(ex => ex.sets.length > 0);
  
  if (completedExercises.length === 0) {
    alert('Please complete at least one set to finish the workout. Click the checkbox on completed sets.');
    return;
  }
  
  const finalWorkout = {
    id: 'workout_' + Date.now(),
    name: activeWorkout.name || 'Workout',
    notes: activeWorkout.notes || '',
    startTime: activeWorkout.startTime,
    endTime: Date.now(),
    exercises: completedExercises,
    weightUnit: settings.weightUnit
  };
  
  // Save to history
  workoutHistory.push(finalWorkout);
  saveHistory();
  
  // Reset active state
  activeWorkout = null;
  saveActiveWorkoutState();
  
  // Timers cleanup
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  document.getElementById('active-workout-pill').classList.add('hidden');
  skipRestTimer();
  
  // Check Google Drive Sync
  if (typeof isGDriveConnected === 'function' && isGDriveConnected()) {
    // Show a temporary visual indication
    console.log("Google Drive connected, syncing workout in background...");
    syncWorkoutToDrive(finalWorkout).then(syncSuccess => {
      if (syncSuccess) {
        alert('Workout saved locally and successfully synced to Google Drive!');
        if (typeof backupDataToDrive === 'function') {
          backupDataToDrive();
        }
      } else {
        alert('Workout saved locally, but Google Drive sync failed. Please check your credentials in Settings.');
      }
    });
  } else {
    alert('Workout saved successfully!');
  }
  
  // Navigate to History Tab
  switchTab('tab-history');
}

// ==========================================================================
// Rest Timer Overlay
// ==========================================================================

function startRestTimer(seconds) {
  restTimerTotalSeconds = seconds;
  restTimerSecondsRemaining = seconds;
  
  const timerOverlay = document.getElementById('floating-timer');
  const digits = document.getElementById('timer-digits');
  const progressBar = document.getElementById('timer-progress-bar');
  
  timerOverlay.classList.remove('hidden');
  updateRestTimerUI();
  
  if (restTimerInterval) clearInterval(restTimerInterval);
  
  restTimerInterval = setInterval(() => {
    restTimerSecondsRemaining--;
    updateRestTimerUI();
    
    if (restTimerSecondsRemaining <= 0) {
      clearInterval(restTimerInterval);
      playTimerAlertSound();
      timerOverlay.classList.add('hidden');
    }
  }, 1000);
}

function updateRestTimerUI() {
  const digits = document.getElementById('timer-digits');
  const progressBar = document.getElementById('timer-progress-bar');
  
  const mins = Math.floor(restTimerSecondsRemaining / 60);
  const secs = restTimerSecondsRemaining % 60;
  digits.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const percent = (restTimerSecondsRemaining / restTimerTotalSeconds) * 100;
  progressBar.style.width = `${percent}%`;
}

function adjustRestTimer(seconds) {
  restTimerSecondsRemaining += seconds;
  if (restTimerSecondsRemaining < 0) restTimerSecondsRemaining = 0;
  
  // If we increased beyond the initial total, update total to keep progress bar clean
  if (restTimerSecondsRemaining > restTimerTotalSeconds) {
    restTimerTotalSeconds = restTimerSecondsRemaining;
  }
  updateRestTimerUI();
}

function skipRestTimer() {
  if (restTimerInterval) clearInterval(restTimerInterval);
  document.getElementById('floating-timer').classList.add('hidden');
}

function playTimerAlertSound() {
  if (!settings.timerSound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);
    
    // Second tone after 400ms
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    }, 400);
  } catch (e) {
    console.error('AudioContext error:', e);
  }
}

// ==========================================================================
// History Tab Rendering
// ==========================================================================

function renderHistoryTab() {
  const container = document.getElementById('workout-history-list');
  const searchVal = document.getElementById('history-search').value.toLowerCase().trim();
  container.innerHTML = '';
  
  if (workoutHistory.length === 0) {
    container.innerHTML = `
      <div class="workout-hero" style="background:none; border:none; box-shadow:none;">
        <i data-lucide="history" style="width:40px; height:40px; color:var(--text-muted); margin-bottom:12px;"></i>
        <h3>No Workouts Logged Yet</h3>
        <p>Your history will appear here once you finish a workout.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  // Sort reverse chronological
  const sortedHistory = [...workoutHistory].sort((a, b) => b.startTime - a.startTime);
  
  const filteredHistory = sortedHistory.filter(w => {
    if (searchVal === '') return true;
    
    const matchesName = w.name.toLowerCase().includes(searchVal);
    const matchesNotes = w.notes && w.notes.toLowerCase().includes(searchVal);
    const matchesExercise = w.exercises.some(ex => ex.name.toLowerCase().includes(searchVal));
    
    return matchesName || matchesNotes || matchesExercise;
  });
  
  if (filteredHistory.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;">No matching workouts found.</p>`;
    return;
  }
  
  filteredHistory.forEach(workout => {
    const durationMin = Math.round((workout.endTime - workout.startTime) / 60000);
    const dateStr = new Date(workout.startTime).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Sum total weight volume
    const totalVolume = workout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((setAcc, s) => setAcc + (s.weight * s.reps), 0);
    }, 0);
    
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-header">
        <div class="history-card-title">
          <h4>${workout.name}</h4>
          <span class="history-card-date">${dateStr}</span>
        </div>
        <button class="btn-remove-exercise" onclick="deleteHistoryWorkout('${workout.id}', event)" title="Delete Workout">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      
      <div class="history-card-meta">
        <div class="history-card-meta-item">
          <i data-lucide="clock"></i>
          <span>${durationMin} mins</span>
        </div>
        <div class="history-card-meta-item">
          <i data-lucide="weight"></i>
          <span>${totalVolume} ${workout.weightUnit || 'lbs'} volume</span>
        </div>
        <div class="history-card-meta-item">
          <i data-lucide="dumbbell"></i>
          <span>${workout.exercises.length} exercises</span>
        </div>
      </div>
      
      ${workout.notes ? `<p class="history-card-notes">${workout.notes}</p>` : ''}
      
      <div class="history-card-exercises">
        ${workout.exercises.map(ex => `
          <div class="history-exercise-row">
            <span class="history-exercise-name">${ex.name}</span>
            <span class="history-exercise-sets">
              ${ex.sets.map(s => `${s.weight} ${workout.weightUnit || 'lbs'} x ${s.reps}`).join(', ')}
            </span>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(card);
  });
  
  lucide.createIcons();
}

function deleteHistoryWorkout(workoutId, event) {
  event.stopPropagation(); // Stop trigger history details toggles/other events
  
  if (confirm('Delete this workout from history? This action is permanent.')) {
    workoutHistory = workoutHistory.filter(w => w.id !== workoutId);
    saveHistory();
    renderHistoryTab();
  }
}

// ==========================================================================
// Analytics Tab Rendering (Chart.js)
// ==========================================================================

function renderAnalyticsTab() {
  const select = document.getElementById('analytics-exercise-select');
  const selectedIndex = select.selectedIndex;
  const currentSelectedValue = selectedIndex >= 0 ? select.options[selectedIndex].value : '';
  
  select.innerHTML = '';
  
  // Gather unique completed exercises from history
  const uniqueExercises = {};
  workoutHistory.forEach(w => {
    w.exercises.forEach(ex => {
      uniqueExercises[ex.id] = ex.name;
    });
  });
  
  const exerciseIds = Object.keys(uniqueExercises);
  
  if (exerciseIds.length === 0) {
    document.getElementById('analytics-insights-summary').innerHTML = `
      <h4><i data-lucide="info"></i> No Data Yet</h4>
      <p>Please log a workout history first. Analytics charts will render once you have completed at least two sets of an exercise.</p>
    `;
    lucide.createIcons();
    return;
  }
  
  // Populate exercise list
  exerciseIds.forEach(id => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.text = uniqueExercises[id];
    if (id === currentSelectedValue) opt.selected = true;
    select.appendChild(opt);
  });
  
  updateAnalyticsChart();
}

function updateAnalyticsChart() {
  const select = document.getElementById('analytics-exercise-select');
  if (select.options.length === 0) return;
  
  const exerciseId = select.value;
  const metric = document.getElementById('analytics-metric-select').value;
  
  // Gather data points
  const dataPoints = [];
  
  // Sort history chronological
  const sortedHistory = [...workoutHistory].sort((a, b) => a.startTime - b.startTime);
  
  sortedHistory.forEach(workout => {
    const match = workout.exercises.find(ex => ex.id === exerciseId);
    if (!match || match.sets.length === 0) return;
    
    let value = 0;
    const dateLabel = new Date(workout.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    if (metric === '1rm') {
      // Epley Formula: 1RM = w * (1 + r / 30) for each set, select the highest
      const oneRMs = match.sets.map(s => {
        if (s.reps === 1) return s.weight;
        return s.weight * (1 + s.reps / 30);
      });
      value = Math.round(Math.max(...oneRMs));
    } else if (metric === 'volume') {
      value = match.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
    } else if (metric === 'max-weight') {
      value = Math.max(...match.sets.map(s => s.weight));
    } else if (metric === 'reps') {
      value = match.sets.reduce((acc, s) => acc + s.reps, 0);
    }
    
    dataPoints.push({
      date: dateLabel,
      value: value,
      unit: workout.weightUnit || settings.weightUnit
    });
  });
  
  // Setup Chart
  const ctx = document.getElementById('analyticsChart').getContext('2d');
  
  if (analyticsChart) {
    analyticsChart.destroy();
  }
  
  if (dataPoints.length === 0) {
    return;
  }
  
  const labelText = document.getElementById('analytics-metric-select').options[document.getElementById('analytics-metric-select').selectedIndex].text;
  
  analyticsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataPoints.map(dp => dp.date),
      datasets: [{
        label: labelText,
        data: dataPoints.map(dp => dp.value),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8b5cf6',
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
        },
        tooltip: {
          backgroundColor: '#0d1127',
          titleColor: '#fff',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          displayColors: false,
          titleFont: { family: 'Outfit', weight: 'bold' },
          bodyFont: { family: 'Outfit' }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#64748b', font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#64748b', font: { family: 'Outfit' } }
        }
      }
    }
  });
  
  // Render analytical insights text
  generateAnalyticsInsights(dataPoints, select.options[select.selectedIndex].text, labelText);
}

function generateAnalyticsInsights(dataPoints, exerciseName, metricLabel) {
  const insightBox = document.getElementById('analytics-insights-summary');
  insightBox.innerHTML = '';
  
  if (dataPoints.length < 2) {
    insightBox.innerHTML = `
      <h4><i data-lucide="sparkles"></i> Insights Panel</h4>
      <p>Log this exercise in a few more workouts to view progression trends and growth forecasts.</p>
    `;
    lucide.createIcons();
    return;
  }
  
  const firstVal = dataPoints[0].value;
  const lastVal = dataPoints[dataPoints.length - 1].value;
  const difference = lastVal - firstVal;
  const pctChange = firstVal !== 0 ? Math.round((difference / firstVal) * 100) : 0;
  
  let insightText = '';
  if (difference > 0) {
    insightText = `Outstanding progress! Your <strong>${exerciseName}</strong> (${metricLabel}) has increased by <strong>${difference} ${settings.weightUnit}</strong> (+${pctChange}%) since your first log on this app. Keep pushing the limits!`;
  } else if (difference < 0) {
    insightText = `Your <strong>${exerciseName}</strong> (${metricLabel}) is down by <strong>${Math.abs(difference)} ${settings.weightUnit}</strong> (${pctChange}%) compared to your starting baseline. Ensure you are getting adequate recovery and nutrition.`;
  } else {
    insightText = `Your <strong>${exerciseName}</strong> (${metricLabel}) has remained steady at <strong>${lastVal} ${settings.weightUnit}</strong>. Consider asking the Gemini Coach how to break this training plateau.`;
  }
  
  insightBox.innerHTML = `
    <h4><i data-lucide="sparkles"></i> Insights: ${exerciseName}</h4>
    <p>${insightText}</p>
  `;
  
  lucide.createIcons();
}

// ==========================================================================
// Hevy Features Helpers (Set Types, Plate Calculator, Exercise History Modal)
// ==========================================================================

function getSetTypeChar(type, index) {
  if (type === 'warmup') return 'W';
  if (type === 'drop') return 'D';
  if (type === 'failure') return 'F';
  return index;
}

function cycleSetType(exIndex, setIndex) {
  const set = activeWorkout.exercises[exIndex].sets[setIndex];
  const types = ['normal', 'warmup', 'drop', 'failure'];
  const currentIdx = types.indexOf(set.type || 'normal');
  const nextIdx = (currentIdx + 1) % types.length;
  set.type = types[nextIdx];
  
  saveActiveWorkoutState();
  renderActiveWorkoutExercises();
}

// Open Plate Calculator for specific exercise card (highest logged weight in sets)
function openPlateCalcForExercise(exIndex) {
  const ex = activeWorkout.exercises[exIndex];
  const weights = ex.sets.map(s => s.weight || 0);
  const maxWeight = Math.max(...weights, 0);
  openPlateCalcForWeight(maxWeight);
}

// Plate calculator engine
function openPlateCalcForWeight(targetWeight) {
  const modal = document.getElementById('plate-modal');
  const weightTitle = document.getElementById('plate-calc-weight-title');
  const barbellDesc = document.getElementById('plate-calc-barbell-desc');
  const leftVisuals = document.getElementById('plate-visuals-left');
  const rightVisuals = document.getElementById('plate-visuals-right');
  const listOutput = document.getElementById('plate-list-output');
  
  modal.classList.remove('hidden');
  weightTitle.textContent = `${targetWeight} ${settings.weightUnit}`;
  
  // Barbell weight (standard: 45 lbs or 20 kg)
  const barWeight = settings.weightUnit === 'lbs' ? 45 : 20;
  barbellDesc.textContent = `${barWeight} ${settings.weightUnit} Barbell + ${((targetWeight - barWeight) / 2).toFixed(1)} ${settings.weightUnit} per side`;
  
  // Reset visuals and lists
  leftVisuals.innerHTML = '';
  rightVisuals.innerHTML = '';
  listOutput.innerHTML = '';
  
  const weightPerSide = (targetWeight - barWeight) / 2;
  if (weightPerSide <= 0) {
    listOutput.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:13px;">No plates required.</p>';
    return;
  }
  
  // Standard plates available
  const lbsPlates = [45, 35, 25, 10, 5, 2.5];
  const kgPlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const platesConfig = settings.weightUnit === 'lbs' ? lbsPlates : kgPlates;
  
  let remainingWeight = weightPerSide;
  const calculatedPlates = {};
  
  platesConfig.forEach(plate => {
    const qty = Math.floor(remainingWeight / plate);
    if (qty > 0) {
      calculatedPlates[plate] = qty;
      remainingWeight = remainingWeight % plate;
    }
  });
  
  const calculatedKeys = Object.keys(calculatedPlates).map(Number).sort((a, b) => b - a);
  
  if (calculatedKeys.length === 0) {
    listOutput.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:13px;">No plates matching configuration.</p>';
    return;
  }
  
  // Render list and visuals
  calculatedKeys.forEach(plateSize => {
    const qty = calculatedPlates[plateSize];
    
    // Add row to list
    const row = document.createElement('div');
    row.className = 'plate-list-row';
    
    // Plate color mapping
    let colorDot = '#6b7280';
    if (settings.weightUnit === 'lbs') {
      if (plateSize === 45) colorDot = '#ef4444';
      else if (plateSize === 35) colorDot = '#3b82f6';
      else if (plateSize === 25) colorDot = '#eab308';
      else if (plateSize === 10) colorDot = '#10b981';
    } else {
      if (plateSize === 25) colorDot = '#ef4444';
      else if (plateSize === 20) colorDot = '#3b82f6';
      else if (plateSize === 15) colorDot = '#eab308';
      else if (plateSize === 10) colorDot = '#10b981';
    }
    
    row.innerHTML = `
      <div class="plate-list-row-left">
        <span class="plate-color-dot" style="background-color:${colorDot};"></span>
        <span style="font-weight:600;">${plateSize} ${settings.weightUnit}</span>
      </div>
      <span class="plate-quantity-pill">x${qty}</span>
    `;
    listOutput.appendChild(row);
    
    // Add visual plates to barbell (replace dot in CSS with dash)
    const sizeStr = plateSize.toString().replace('.', '-');
    for (let i = 0; i < qty; i++) {
      const visualLeftPlate = document.createElement('div');
      visualLeftPlate.className = `barbell-plate plate-${settings.weightUnit}-${sizeStr}`;
      visualLeftPlate.textContent = plateSize;
      leftVisuals.appendChild(visualLeftPlate);
      
      const visualRightPlate = document.createElement('div');
      visualRightPlate.className = `barbell-plate plate-${settings.weightUnit}-${sizeStr}`;
      visualRightPlate.textContent = plateSize;
      rightVisuals.appendChild(visualRightPlate);
    }
  });
}

// Exercise history popup in active session
function openExerciseHistory(exerciseId, exerciseName, routineNotes) {
  const modal = document.getElementById('exercise-info-modal');
  const title = document.getElementById('ex-info-title');
  const notes = document.getElementById('ex-info-notes');
  const list = document.getElementById('ex-info-history-list');
  
  modal.classList.remove('hidden');
  title.textContent = exerciseName;
  notes.textContent = routineNotes || 'No specific cues configured for this routine.';
  list.innerHTML = '';
  
  // Fetch historical entries for this exercise
  const historyEntries = [];
  workoutHistory.forEach(workout => {
    const match = workout.exercises.find(ex => ex.id === exerciseId);
    if (match && match.sets.length > 0) {
      historyEntries.push({
        date: new Date(workout.startTime).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric'
        }),
        sets: match.sets,
        unit: workout.weightUnit || settings.weightUnit
      });
    }
  });
  
  // Sort reverse chronological
  historyEntries.reverse();
  
  if (historyEntries.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:13px;padding:20px 0;">No completed history logs found for this exercise.</p>';
    return;
  }
  
  historyEntries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'info-history-entry';
    card.innerHTML = `
      <div class="info-history-entry-header">
        <span>${entry.date}</span>
      </div>
      <div class="info-history-entry-sets">
        ${entry.sets.map((s, idx) => `
          <span style="display:inline-block;margin-right:12px;font-size:12px;">
            <strong style="color:var(--primary);">${getSetTypeChar(s.type || 'normal', idx + 1)}:</strong> ${s.weight} ${entry.unit} x ${s.reps}
          </span>
        `).join('')}
      </div>
    `;
    list.appendChild(card);
  });
}

function renderRoutineTemplates() {
  const grid = document.getElementById('template-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  Object.keys(ROUTINE_TEMPLATES).forEach(key => {
    const template = ROUTINE_TEMPLATES[key];
    const card = document.createElement('div');
    card.className = 'template-card';
    card.setAttribute('data-template', key);
    
    // Count exercises in this template
    const count = template.exercises.length;
    
    card.innerHTML = `
      <div class="template-card-header">
        <h4>${template.name}</h4>
        <span class="exercise-count">${count} Exercises</span>
      </div>
      <p class="template-summary" style="font-size:13px; color:var(--text-secondary); margin-top:4px;">${template.notes || ''}</p>
      <button class="btn btn-secondary btn-sm start-template-btn" style="margin-top:10px; width:100%;" data-template="${key}">Start</button>
    `;
    
    // Clicking the "Start" button triggers starting the workout
    card.querySelector('.start-template-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      startWorkout(key);
    });
    
    // Clicking the card itself also launches the workout
    card.addEventListener('click', () => {
      startWorkout(key);
    });
    
    grid.appendChild(card);
  });
}

// ==========================================================================
// Nutrition Tracking & Macro Synchronization Logic
// ==========================================================================

// --- Nutrition Tracking State ---
let nutritionLog = {};
let nutritionTargets = { calories: 1950, protein: 130, carbs: 200, fat: 70 };
let sheetFoods = [];
let foodImageBase64 = null;
let foodImageMimeType = null;

function initNutrition() {
  loadNutritionData();
  
  const saveTargetsBtn = document.getElementById('save-nutrition-targets-btn');
  if (saveTargetsBtn) {
    saveTargetsBtn.addEventListener('click', saveNutritionTargets);
  }
  
  const syncSheetBtn = document.getElementById('refresh-sheet-btn');
  if (syncSheetBtn) {
    syncSheetBtn.addEventListener('click', () => {
      fetchGoogleSheetFoods();
    });
  }
  
  const logFoodBtn = document.getElementById('log-food-btn');
  if (logFoodBtn) {
    logFoodBtn.addEventListener('click', handleLogFood);
  }
  
  const uploadZone = document.getElementById('photo-upload-zone');
  const imageInput = document.getElementById('food-image-input');
  const fallbackCameraInput = document.getElementById('food-camera-fallback-input');
  const removePreviewBtn = document.getElementById('btn-remove-preview');
  
  if (uploadZone && imageInput) {
    uploadZone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-preview')) return;
      if (foodImageBase64) return; // Prevent clicks if a photo is already previewed
      
      const isCameraBtn = e.target.closest('#btn-camera-capture');
      const isFileBtn = e.target.closest('#btn-file-select');
      
      if (isCameraBtn) {
        openCameraCapture();
      } else if (isFileBtn || !e.target.closest('.upload-option-btn')) {
        imageInput.click();
      }
    });
    imageInput.addEventListener('change', handleFoodImageSelect);
  }
  
  if (fallbackCameraInput) {
    fallbackCameraInput.addEventListener('change', handleFoodImageSelect);
  }
  
  if (removePreviewBtn) {
    removePreviewBtn.addEventListener('click', clearFoodImagePreview);
  }
  
  // Set up camera modal listeners
  const closeCameraBtn = document.getElementById('close-camera-modal');
  if (closeCameraBtn) {
    closeCameraBtn.addEventListener('click', closeCameraModal);
  }
  
  const cameraSwitchBtn = document.getElementById('btn-camera-switch');
  if (cameraSwitchBtn) {
    cameraSwitchBtn.addEventListener('click', switchCamera);
  }
  
  const cameraShutterBtn = document.getElementById('btn-camera-shutter');
  if (cameraShutterBtn) {
    cameraShutterBtn.addEventListener('click', capturePhoto);
  }
  
  // Set up auto calorie calculation from macro inputs
  const proteinInput = document.getElementById('target-protein-input');
  const carbsInput = document.getElementById('target-carbs-input');
  const fatInput = document.getElementById('target-fat-input');
  if (proteinInput && carbsInput && fatInput) {
    proteinInput.addEventListener('input', updateTargetCaloriesFromInputs);
    carbsInput.addEventListener('input', updateTargetCaloriesFromInputs);
    fatInput.addEventListener('input', updateTargetCaloriesFromInputs);
  }
  
  fetchGoogleSheetFoods();
}

function updateTargetCaloriesFromInputs() {
  const proteinInput = document.getElementById('target-protein-input');
  const carbsInput = document.getElementById('target-carbs-input');
  const fatInput = document.getElementById('target-fat-input');
  const calInput = document.getElementById('target-calories-input');
  
  if (proteinInput && carbsInput && fatInput && calInput) {
    const pro = parseInt(proteinInput.value) || 0;
    const carb = parseInt(carbsInput.value) || 0;
    const fat = parseInt(fatInput.value) || 0;
    const cal = (pro * 4) + (carb * 4) + (fat * 9);
    calInput.value = cal;
  }
}

function loadNutritionData() {
  const storedTargets = localStorage.getItem('pulsefit_nutrition_targets');
  if (storedTargets) {
    nutritionTargets = JSON.parse(storedTargets);
  }
  
  const calInput = document.getElementById('target-calories-input');
  const proInput = document.getElementById('target-protein-input');
  const carbInput = document.getElementById('target-carbs-input');
  const fatInput = document.getElementById('target-fat-input');
  
  if (calInput) calInput.value = nutritionTargets.calories;
  if (proInput) proInput.value = nutritionTargets.protein;
  if (carbInput) carbInput.value = nutritionTargets.carbs;
  if (fatInput) fatInput.value = nutritionTargets.fat;
  
  // Trigger initial calculation to ensure math is consistent
  updateTargetCaloriesFromInputs();
  
  // Update state with the calculated calories value
  if (calInput) {
    nutritionTargets.calories = parseInt(calInput.value) || 1950;
  }
  
  const storedLogs = localStorage.getItem('pulsefit_nutrition_log');
  if (storedLogs) {
    nutritionLog = JSON.parse(storedLogs);
  }
  
  const cachedFoods = localStorage.getItem('pulsefit_sheet_foods');
  if (cachedFoods) {
    sheetFoods = JSON.parse(cachedFoods);
    updateSheetStatusUI('success');
  }
}

function saveNutritionTargets() {
  // Ensure the inputs are fully computed before saving
  updateTargetCaloriesFromInputs();
  
  const cal = parseInt(document.getElementById('target-calories-input').value);
  const pro = parseInt(document.getElementById('target-protein-input').value);
  const carb = parseInt(document.getElementById('target-carbs-input').value);
  const fat = parseInt(document.getElementById('target-fat-input').value);
  
  if (isNaN(cal) || isNaN(pro) || isNaN(carb) || isNaN(fat)) {
    alert("Please enter valid numeric values for targets.");
    return;
  }
  
  nutritionTargets = { calories: cal, protein: pro, carbs: carb, fat: fat };
  localStorage.setItem('pulsefit_nutrition_targets', JSON.stringify(nutritionTargets));
  
  alert("Nutrition targets saved!");
  renderNutritionTab();
  
  if (typeof backupDataToDrive === 'function') {
    backupDataToDrive();
  }
}

function updateSheetStatusUI(status) {
  const badge = document.getElementById('sheet-status-badge');
  const textEl = document.getElementById('sheet-status-text');
  if (!badge || !textEl) return;
  
  if (status === 'success') {
    textEl.textContent = 'Sheet: Synced';
    badge.className = 'gdrive-status-badge connected';
  } else if (status === 'cached') {
    textEl.textContent = 'Sheet: Offline Cache';
    badge.className = 'gdrive-status-badge connected';
  } else if (status === 'error') {
    textEl.textContent = 'Sheet: Sync Failed';
    badge.className = 'gdrive-status-badge disconnected';
  } else {
    textEl.textContent = 'Sheet: Loading...';
    badge.className = 'gdrive-status-badge disconnected';
  }
}

async function fetchGoogleSheetFoods() {
  updateSheetStatusUI('loading');
  const url = "https://docs.google.com/spreadsheets/d/1qnftLt1842tN1A8OhhJDW7ylH6mahN4ut7LlWfKxJnU/export?format=csv&gid=1729071175";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    parseSheetCSV(csvText);
    
    localStorage.setItem('pulsefit_sheet_foods', JSON.stringify(sheetFoods));
    updateSheetStatusUI('success');
  } catch (error) {
    console.error("Failed to fetch sheet foods, loading from cache...", error);
    const cached = localStorage.getItem('pulsefit_sheet_foods');
    if (cached) {
      sheetFoods = JSON.parse(cached);
      updateSheetStatusUI('cached');
    } else {
      updateSheetStatusUI('error');
    }
  }
}

function parseSheetCSV(csvText) {
  const lines = csvText.split('\n');
  const parsed = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = parseCSVLine(line);
    if (cols.length < 5) continue;
    
    const food = cols[0].trim();
    if (!food || food === "Food") continue;
    
    const carb = parseFloat(cols[1]);
    const protein = parseFloat(cols[2]);
    const fat = parseFloat(cols[3]);
    const calories = parseFloat(cols[4]);
    const unit = cols[5] ? cols[5].trim() : "";
    
    parsed.push({
      name: food,
      carbs: isNaN(carb) ? 0 : carb,
      protein: isNaN(protein) ? 0 : protein,
      fat: isNaN(fat) ? 0 : fat,
      calories: isNaN(calories) ? 0 : calories,
      unit: unit
    });
  }
  sheetFoods = parsed;
}

function parseCSVLine(text) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function resizeAndCompressImage(file, maxDimension = 1024, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

async function handleFoodImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  foodImageMimeType = 'image/jpeg';
  
  try {
    const compressedDataUrl = await resizeAndCompressImage(file);
    const commaIdx = compressedDataUrl.indexOf(',');
    foodImageBase64 = compressedDataUrl.substring(commaIdx + 1);
    
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    if (previewContainer && previewImg) {
      previewImg.src = compressedDataUrl;
      previewContainer.classList.remove('hidden');
    }
  } catch (err) {
    console.error("Failed to compress image:", err);
    alert("Failed to process image. Please try another photo.");
  }
}

function clearFoodImagePreview() {
  foodImageBase64 = null;
  foodImageMimeType = null;
  
  const fileInput = document.getElementById('food-image-input');
  if (fileInput) fileInput.value = '';
  
  const fallbackInput = document.getElementById('food-camera-fallback-input');
  if (fallbackInput) fallbackInput.value = '';
  
  const previewContainer = document.getElementById('image-preview-container');
  if (previewContainer) {
    previewContainer.classList.add('hidden');
  }
}

// --- Webcam / Camera Capture Management ---
let cameraStream = null;
let cameraFacingMode = 'environment'; // Rear-facing camera by default for food photos

function openCameraCapture() {
  const cameraModal = document.getElementById('camera-modal');
  const cameraVideo = document.getElementById('camera-video');
  const cameraLoading = document.getElementById('camera-loading');
  const cameraError = document.getElementById('camera-error');
  
  if (!cameraModal) return;
  
  // Show modal
  cameraModal.classList.remove('hidden');
  if (cameraLoading) cameraLoading.classList.remove('hidden');
  if (cameraError) cameraError.classList.add('hidden');
  
  // Refresh icons in modal if Lucide is available
  if (window.lucide) {
    window.lucide.createIcons();
  }
  
  // Check browser/protocol support for getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn("getUserMedia not supported on this browser/context. Triggering native camera fallback.");
    closeCameraModal();
    triggerNativeCameraFallback();
    return;
  }
  
  startCameraStream();
}

function closeCameraModal() {
  const cameraModal = document.getElementById('camera-modal');
  if (cameraModal) {
    cameraModal.classList.add('hidden');
  }
  stopCameraStream();
}

function stopCameraStream() {
  if (cameraStream) {
    try {
      cameraStream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Error stopping camera tracks:", err);
    }
    cameraStream = null;
  }
  const cameraVideo = document.getElementById('camera-video');
  if (cameraVideo) {
    cameraVideo.srcObject = null;
  }
}

async function startCameraStream() {
  const cameraVideo = document.getElementById('camera-video');
  const cameraLoading = document.getElementById('camera-loading');
  const cameraError = document.getElementById('camera-error');
  const cameraErrorMessage = document.getElementById('camera-error-message');
  
  stopCameraStream();
  
  if (cameraLoading) cameraLoading.classList.remove('hidden');
  if (cameraError) cameraError.classList.add('hidden');
  
  const constraints = {
    video: {
      facingMode: cameraFacingMode,
      width: { ideal: 1024 },
      height: { ideal: 768 }
    },
    audio: false
  };
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraStream = stream;
    if (cameraVideo) {
      cameraVideo.srcObject = stream;
    }
    if (cameraLoading) cameraLoading.classList.add('hidden');
  } catch (err) {
    console.error("Error starting camera stream:", err);
    if (cameraLoading) cameraLoading.classList.add('hidden');
    
    let errMsg = "Could not access the camera. Make sure camera permissions are enabled.";
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errMsg = "Camera access denied. Please grant permission or choose an image from your gallery.";
    }
    
    if (cameraError && cameraErrorMessage) {
      cameraErrorMessage.textContent = errMsg;
      cameraError.classList.remove('hidden');
    }
    
    // Auto-trigger native camera capture if it's a device failure rather than direct user denial
    if (err.name !== 'NotAllowedError' && err.name !== 'PermissionDeniedError') {
      setTimeout(() => {
        closeCameraModal();
        triggerNativeCameraFallback();
      }, 1500);
    }
  }
}

function triggerNativeCameraFallback() {
  const fallbackInput = document.getElementById('food-camera-fallback-input');
  if (fallbackInput) {
    fallbackInput.click();
  }
}

function switchCamera() {
  cameraFacingMode = (cameraFacingMode === 'environment') ? 'user' : 'environment';
  startCameraStream();
}

function capturePhoto() {
  const cameraVideo = document.getElementById('camera-video');
  if (!cameraVideo || !cameraStream) return;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth || 640;
    canvas.height = cameraVideo.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    
    // Apply client-side resizing and JPEG compression directly to the frame
    const maxDimension = 1024;
    const quality = 0.7;
    let width = canvas.width;
    let height = canvas.height;
    
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }
    
    const compressCanvas = document.createElement('canvas');
    compressCanvas.width = width;
    compressCanvas.height = height;
    const compressCtx = compressCanvas.getContext('2d');
    compressCtx.drawImage(canvas, 0, 0, width, height);
    
    const compressedDataUrl = compressCanvas.toDataURL('image/jpeg', quality);
    const commaIdx = compressedDataUrl.indexOf(',');
    foodImageBase64 = compressedDataUrl.substring(commaIdx + 1);
    foodImageMimeType = 'image/jpeg';
    
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    if (previewContainer && previewImg) {
      previewImg.src = compressedDataUrl;
      previewContainer.classList.remove('hidden');
    }
    
    closeCameraModal();
  } catch (err) {
    console.error("Error capturing photo from stream:", err);
    alert("Failed to capture photo. Please try choosing an image from your library.");
    closeCameraModal();
  }
}


async function handleLogFood() {
  const textInput = document.getElementById('food-input-text').value.trim();
  
  if (!textInput && !foodImageBase64) {
    alert("Please enter a food description or upload a photo.");
    return;
  }
  
  if (!settings.apiKey || settings.apiKey.trim().length < 10) {
    alert("Please enter a valid Gemini API Key in Settings first.");
    openSettingsModal();
    return;
  }
  
  const overlay = document.getElementById('nutrition-loading-overlay');
  const overlayText = document.getElementById('loading-overlay-text');
  if (overlay) {
    overlayText.textContent = foodImageBase64 ? "Analyzing photo & calculating macros..." : "Pulse Coach is parsing macros...";
    overlay.classList.remove('hidden');
  }
  
  try {
    const parsedItems = await parseFoodEntryWithGemini(
      textInput, 
      foodImageBase64, 
      foodImageMimeType, 
      sheetFoods
    );
    
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      throw new Error("No food items parsed by Gemini. Try describing the foods more clearly.");
    }
    
    const todayStr = getLocalDateString();
    if (!nutritionLog[todayStr]) {
      nutritionLog[todayStr] = {
        dateStr: todayStr,
        items: [],
        totals: { carbs: 0, protein: 0, fat: 0, calories: 0 }
      };
    }
    
    const dayLog = nutritionLog[todayStr];
    parsedItems.forEach(item => {
      dayLog.items.push({
        id: 'food-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        time: Date.now(),
        name: item.name || item.matchedFood || "Logged Food",
        carbs: item.carbs || 0,
        protein: item.protein || 0,
        fat: item.fat || 0,
        calories: item.calories || 0,
        source: item.source || "Internet"
      });
    });
    
    recalculateDayTotals(todayStr);
    saveNutritionLog();
    
    document.getElementById('food-input-text').value = '';
    clearFoodImagePreview();
    
    renderNutritionTab();
    
    if (typeof syncNutritionToDrive === 'function') {
      await syncNutritionToDrive(nutritionLog);
    }
    if (typeof backupDataToDrive === 'function') {
      await backupDataToDrive();
    }
    
  } catch (error) {
    console.error("Error logging food:", error);
    alert(`Failed to log food: ${error.message || error}`);
  } finally {
    if (overlay) overlay.classList.add('hidden');
  }
}

function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function recalculateDayTotals(dateStr) {
  const dayLog = nutritionLog[dateStr];
  if (!dayLog) return;
  
  let carbs = 0, protein = 0, fat = 0, calories = 0;
  dayLog.items.forEach(item => {
    carbs += item.carbs;
    protein += item.protein;
    fat += item.fat;
    calories += item.calories;
  });
  dayLog.totals = { carbs, protein, fat, calories };
}

function saveNutritionLog() {
  localStorage.setItem('pulsefit_nutrition_log', JSON.stringify(nutritionLog));
}

function renderNutritionTab() {
  const todayStr = getLocalDateString();
  const dayLog = nutritionLog[todayStr] || {
    items: [],
    totals: { carbs: 0, protein: 0, fat: 0, calories: 0 }
  };
  
  document.getElementById('nutrition-calories-target').textContent = nutritionTargets.calories;
  document.getElementById('nutrition-protein-target').textContent = nutritionTargets.protein;
  document.getElementById('nutrition-carbs-target').textContent = nutritionTargets.carbs;
  document.getElementById('nutrition-fat-target').textContent = nutritionTargets.fat;
  
  document.getElementById('nutrition-calories-current').textContent = Math.round(dayLog.totals.calories);
  document.getElementById('nutrition-protein-current').textContent = Math.round(dayLog.totals.protein);
  document.getElementById('nutrition-carbs-current').textContent = Math.round(dayLog.totals.carbs);
  document.getElementById('nutrition-fat-current').textContent = Math.round(dayLog.totals.fat);
  
  const ring = document.getElementById('calories-progress-ring');
  if (ring) {
    const radius = parseFloat(ring.getAttribute('r')) || 60;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = `${circumference} ${circumference}`;
    
    const percent = Math.min(100, (dayLog.totals.calories / nutritionTargets.calories) * 100);
    const offset = circumference - (percent / 100) * circumference;
    ring.style.strokeDashoffset = isNaN(offset) ? circumference : offset;
  }
  
  const pPercent = Math.min(100, (dayLog.totals.protein / nutritionTargets.protein) * 100);
  const cPercent = Math.min(100, (dayLog.totals.carbs / nutritionTargets.carbs) * 100);
  const fPercent = Math.min(100, (dayLog.totals.fat / nutritionTargets.fat) * 100);
  
  document.getElementById('nutrition-protein-bar').style.width = `${pPercent}%`;
  document.getElementById('nutrition-carbs-bar').style.width = `${cPercent}%`;
  document.getElementById('nutrition-fat-bar').style.width = `${fPercent}%`;
  
  const todayList = document.getElementById('today-food-log-list');
  const summaryEl = document.getElementById('today-log-summary');
  
  todayList.innerHTML = '';
  
  if (dayLog.items.length === 0) {
    todayList.innerHTML = `<p style="color:var(--text-muted);font-size:13px;padding:20px 0;text-align:center;">No foods logged today yet.</p>`;
  } else {
    dayLog.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'today-log-item';
      const badgeClass = item.source.toLowerCase() === 'sheet' ? 'sheet' : 'internet';
      el.innerHTML = `
        <div class="today-log-item-info">
          <div class="today-log-item-title">
            <span>${item.name}</span>
            <span class="today-log-item-source-badge ${badgeClass}">${item.source}</span>
          </div>
          <div class="today-log-item-macros">
            ${item.carbs.toFixed(1)}g C &bull; ${item.protein.toFixed(1)}g P &bull; ${item.fat.toFixed(1)}g F &bull; ${Math.round(item.calories)} kcal
          </div>
        </div>
        <button class="btn-delete-log-item" onclick="deleteFoodLogItem('${todayStr}', '${item.id}')" title="Delete Entry">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      `;
      todayList.appendChild(el);
    });
  }
  
  summaryEl.textContent = `Daily Intake Summary: ${Math.round(dayLog.totals.calories)} kcal | ${dayLog.totals.protein.toFixed(1)}g P | ${dayLog.totals.carbs.toFixed(1)}g C | ${dayLog.totals.fat.toFixed(1)}g F`;
  
  renderNutritionHistoryTable();
  lucide.createIcons();
}

function renderNutritionHistoryTable() {
  const tbody = document.getElementById('nutrition-history-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const dates = Object.keys(nutritionLog).sort((a, b) => b.localeCompare(a));
  
  if (dates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">No historical logs available.</td></tr>`;
    return;
  }
  
  dates.forEach(date => {
    const dayLog = nutritionLog[date];
    const tr = document.createElement('tr');
    const mealsText = dayLog.items.map(item => item.name).join(', ');
    const displayDate = new Date(date + "T00:00:00").toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric'
    });
    
    tr.innerHTML = `
      <td style="padding:12px 8px;font-weight:600;">${displayDate}</td>
      <td class="center" style="padding:12px 8px;">${Math.round(dayLog.totals.calories)} kcal</td>
      <td class="center" style="padding:12px 8px;">${Math.round(dayLog.totals.protein)}g</td>
      <td class="center" style="padding:12px 8px;">${Math.round(dayLog.totals.carbs)}g</td>
      <td class="center" style="padding:12px 8px;">${Math.round(dayLog.totals.fat)}g</td>
      <td style="padding:12px 8px;font-size:12px;color:var(--text-secondary);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${mealsText}">${mealsText}</td>
      <td class="center" style="padding:12px 8px;">
        <button class="btn btn-outline-danger btn-xs" onclick="deleteEntireDayLog('${date}')" title="Delete Day's Log" style="padding:4px 8px;font-size:10px;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteFoodLogItem(dateStr, itemId) {
  const dayLog = nutritionLog[dateStr];
  if (!dayLog) return;
  
  const idx = dayLog.items.findIndex(item => item.id === itemId);
  if (idx !== -1) {
    dayLog.items.splice(idx, 1);
    if (dayLog.items.length === 0) {
      delete nutritionLog[dateStr];
    } else {
      recalculateDayTotals(dateStr);
    }
    saveNutritionLog();
    renderNutritionTab();
    
    if (typeof syncNutritionToDrive === 'function') {
      await syncNutritionToDrive(nutritionLog);
    }
    if (typeof backupDataToDrive === 'function') {
      await backupDataToDrive();
    }
  }
}

async function deleteEntireDayLog(dateStr) {
  if (confirm(`Delete the entire food log for ${dateStr}?`)) {
    delete nutritionLog[dateStr];
    saveNutritionLog();
    renderNutritionTab();
    
    if (typeof syncNutritionToDrive === 'function') {
      await syncNutritionToDrive(nutritionLog);
    }
    if (typeof backupDataToDrive === 'function') {
      await backupDataToDrive();
    }
  }
}

// --- Two-Way Conflict-Free Data Merger ---
function mergePulseFitData(backupData) {
  let changed = false;

  // 1. Merge settings (sync basic options but preserve local Client ID / API Key)
  if (backupData.settings) {
    const s = backupData.settings;
    if (s.weightUnit && s.weightUnit !== settings.weightUnit) {
      settings.weightUnit = s.weightUnit;
      changed = true;
    }
    if (s.defaultRest && s.defaultRest !== settings.defaultRest) {
      settings.defaultRest = s.defaultRest;
      changed = true;
    }
    if (s.timerSound !== undefined && s.timerSound !== settings.timerSound) {
      settings.timerSound = s.timerSound;
      changed = true;
    }
    if (s.userName && s.userName !== settings.userName) {
      settings.userName = s.userName;
      changed = true;
    }
  }

  // 2. Merge nutritionTargets
  if (backupData.nutritionTargets) {
    const backupT = backupData.nutritionTargets;
    if (JSON.stringify(nutritionTargets) !== JSON.stringify(backupT)) {
      nutritionTargets = backupT;
      changed = true;
    }
  }

  // 3. Merge workoutHistory (by unique ID)
  if (backupData.workoutHistory && Array.isArray(backupData.workoutHistory)) {
    const localIds = new Set(workoutHistory.map(w => w.id));
    backupData.workoutHistory.forEach(w => {
      if (!localIds.has(w.id)) {
        workoutHistory.push(w);
        changed = true;
      }
    });
  }

  // 4. Merge nutritionLog (by date and logged food item ID)
  if (backupData.nutritionLog && typeof backupData.nutritionLog === 'object') {
    Object.keys(backupData.nutritionLog).forEach(date => {
      const backupDay = backupData.nutritionLog[date];
      if (!nutritionLog[date]) {
        nutritionLog[date] = backupDay;
        changed = true;
      } else {
        const localDay = nutritionLog[date];
        const localItemIds = new Set(localDay.items.map(item => item.id));
        let dayChanged = false;
        backupDay.items.forEach(item => {
          if (!localItemIds.has(item.id)) {
            localDay.items.push(item);
            dayChanged = true;
            changed = true;
          }
        });
        if (dayChanged) {
          recalculateDayTotals(date);
        }
      }
    });
  }

  // 5. Merge custom exercises
  if (backupData.exercises && Array.isArray(backupData.exercises)) {
    const localIds = new Set(exercises.map(e => e.id));
    backupData.exercises.forEach(e => {
      if (!localIds.has(e.id)) {
        exercises.push(e);
        changed = true;
      }
    });
  }

  if (changed) {
    saveSettings();
    saveExercises();
    saveHistory();
    saveNutritionLog();
    updateUserNameUI();
  }
  
  return changed;
}

// --- Update UI with User Name ---
function updateUserNameUI() {
  const name = settings.userName || 'Saurabh';
  
  // 1. Update topbar branding
  const topbarBranding = document.querySelector('.topbar-left div');
  if (topbarBranding) {
    topbarBranding.textContent = `${name}'s PulseFit`;
  }
  
  // 2. Update homepage welcome banner
  const welcomeTitle = document.querySelector('.welcome-header h2');
  if (welcomeTitle) {
    welcomeTitle.textContent = `Welcome, ${name}!`;
  }
}

// --- Access Control (Approval Gate) ---
function initAccessCheck() {
  if (!ACCESS_SHEET_ID || ACCESS_SHEET_ID.trim() === '') {
    console.log("Access Control: Disabled (Public Site).");
    return;
  }

  console.log("Access Control: Active. Checking permissions...");
  const overlay = document.getElementById('access-overlay');
  if (!overlay) return;

  // Show the overlay initially
  overlay.classList.remove('hidden');

  // Verify access using saved token
  const token = localStorage.getItem('pulsefit_gdrive_token');
  const expiry = localStorage.getItem('pulsefit_gdrive_token_expires');

  if (token && expiry && parseInt(expiry) > Date.now()) {
    verifyUserAccess(token);
  } else {
    // Show sign-in required state
    showAccessGateState('login');
  }
}

// Helper to switch overlay states
function showAccessGateState(state, email = '', extra = '') {
  const overlay = document.getElementById('access-overlay');
  const title = document.getElementById('access-title');
  const msg = document.getElementById('access-message');
  const spinner = document.getElementById('access-spinner');
  const loginBtn = document.getElementById('access-login-btn');
  const requestBtn = document.getElementById('access-request-btn');
  const statusIcon = document.getElementById('access-status-icon');

  if (!overlay) return;

  // Defaults
  loginBtn.classList.add('hidden');
  requestBtn.classList.add('hidden');
  spinner.classList.add('hidden');
  statusIcon.innerHTML = '';
  statusIcon.style.color = 'var(--primary)';
  statusIcon.style.background = 'rgba(99, 102, 241, 0.1)';

  switch (state) {
    case 'login':
      title.textContent = "Access Restricted";
      msg.textContent = "This application is private. Please sign in with your Google account to verify access.";
      loginBtn.classList.remove('hidden');
      statusIcon.innerHTML = '<i data-lucide="shield-alert" style="width: 32px; height: 32px;"></i>';
      break;

    case 'verifying':
      title.textContent = "Verifying Access";
      msg.textContent = "Checking your credentials against the approved user registry...";
      spinner.classList.remove('hidden');
      statusIcon.innerHTML = '<i data-lucide="shield" style="width: 32px; height: 32px;"></i>';
      break;

    case 'pending':
      title.textContent = "Access Pending Approval";
      msg.innerHTML = `Your account (<strong>${email}</strong>) is currently pending approval.<br><br>Please contact Saurabh to approve your access.`;
      statusIcon.innerHTML = '<i data-lucide="clock" style="width: 32px; height: 32px;"></i>';
      statusIcon.style.color = '#eab308';
      statusIcon.style.background = 'rgba(234, 179, 8, 0.1)';
      break;

    case 'denied':
      title.textContent = "Access Denied";
      msg.innerHTML = `Your account (<strong>${email}</strong>) is not registered.<br><br>Click below to request access.`;
      requestBtn.classList.remove('hidden');
      requestBtn.href = `mailto:sgoyal@gmail.com?subject=Pulsefit Access Request&body=Hi Saurabh,%0D%0A%0D%0APlease approve my email: ${email} for Pulsefit.`;
      statusIcon.innerHTML = '<i data-lucide="shield-x" style="width: 32px; height: 32px;"></i>';
      statusIcon.style.color = 'var(--danger)';
      statusIcon.style.background = 'rgba(239, 68, 68, 0.1)';
      break;

    case 'error':
      title.textContent = "Verification Error";
      msg.textContent = `An error occurred while validating access: ${extra}. Please try again.`;
      loginBtn.classList.remove('hidden');
      statusIcon.innerHTML = '<i data-lucide="alert-triangle" style="width: 32px; height: 32px;"></i>';
      statusIcon.style.color = 'var(--danger)';
      statusIcon.style.background = 'rgba(239, 68, 68, 0.1)';
      break;
  }

  // Make sure Lucide re-renders icons in the statusIcon
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({
      attrs: { class: 'lucide' },
      nameAttr: 'data-lucide'
    });
  }
}

async function verifyUserAccess(token) {
  showAccessGateState('verifying');

  try {
    // 1. Get user email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!userInfoResponse.ok) {
      throw new Error(`UserInfo API error: ${userInfoResponse.status}`);
    }

    const userInfo = await userInfoResponse.json();
    const email = userInfo.email.trim().toLowerCase();

    // 2. Fetch the access control sheet CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${ACCESS_SHEET_ID}/export?format=csv`;
    const csvResponse = await fetch(csvUrl);
    if (!csvResponse.ok) {
      throw new Error(`Spreadsheet fetch failed (Check sheet sharing permissions)`);
    }

    const csvText = await csvResponse.text();
    const rows = csvText.split('\n');

    let approved = false;
    let found = false;

    // Row loop (skipping header)
    for (let i = 1; i < rows.length; i++) {
      const line = rows[i].trim();
      if (!line) continue;
      
      const cols = parseCSVLine(line);
      if (cols.length > 0) {
        const rowEmail = cols[0].trim().toLowerCase();
        const rowStatus = cols[1] ? cols[1].trim().toLowerCase() : '';

        if (rowEmail === email) {
          found = true;
          if (rowStatus === 'approved' || rowStatus === 'y' || rowStatus === 'yes') {
            approved = true;
          }
          break;
        }
      }
    }

    if (approved) {
      // Access allowed! Hide overlay
      const overlay = document.getElementById('access-overlay');
      if (overlay) overlay.classList.add('hidden');
      console.log(`Access Granted for user: ${email}`);
    } else if (found) {
      // Found but status not approved (e.g. pending)
      showAccessGateState('pending', email);
    } else {
      // Not found
      showAccessGateState('denied', email);
    }

  } catch (err) {
    console.error('Access verification error:', err);
    showAccessGateState('error', '', err.message || err);
  }
}

// --- Access Gate Sign In ---
function connectAccessGateGoogle() {
  if (!settings.googleClientId || settings.googleClientId.trim() === '') {
    alert('Please ensure Google Client ID is configured.');
    return;
  }

  showAccessGateState('verifying');

  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: settings.googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
      callback: (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          showAccessGateState('error', '', tokenResponse.error);
          return;
        }

        gdriveAccessToken = tokenResponse.access_token;
        gdriveTokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);

        // Save to localStorage
        localStorage.setItem('pulsefit_gdrive_token', gdriveAccessToken);
        localStorage.setItem('pulsefit_gdrive_token_expires', gdriveTokenExpiry.toString());
        localStorage.setItem('pulsefit_gdrive_connected', 'true');

        if (typeof gapi !== 'undefined' && gapi.client) {
          gapi.client.setToken({ access_token: gdriveAccessToken });
        }

        // Check access
        verifyUserAccess(gdriveAccessToken);
      },
      error_callback: (err) => {
        console.error('Access Sign In Error:', err);
        showAccessGateState('error', '', 'Google popup failed to open');
      }
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  } catch (err) {
    console.error('Access Sign In Error:', err);
    showAccessGateState('error', '', err.message || err);
  }
}
