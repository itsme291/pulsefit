// ==========================================================================
// PulseFit - Google Drive Integration & Auto-Sync Handlers
// ==========================================================================

let tokenClient = null;
let gdriveAccessToken = null;
let gdriveTokenExpiry = null;

// --- Initialize Google Libraries on Load ---
function initGoogleClient() {
  if (typeof gapi === 'undefined' || typeof google === 'undefined') {
    console.warn('Google scripts not loaded yet. Retrying in 1s...');
    setTimeout(initGoogleClient, 1000);
    return;
  }
  
  try {
    // 1. Load Google API Client
    gapi.load('client', async () => {
      await gapi.client.init({});
      await gapi.client.load('drive', 'v3');
      await gapi.client.load('docs', 'v1');
      console.log('Google APIs loaded successfully.');
      
      // Restore access token from session if available and valid
      restoreSessionToken();
    });
  } catch (err) {
    console.error('Error initializing Google APIs:', err);
  }
}

// Start client init
document.addEventListener('DOMContentLoaded', () => {
  // Let libraries load asynchronously first, then initialize
  setTimeout(initGoogleClient, 500);
});

// --- Restore Connection Token from Storage ---
function restoreSessionToken() {
  const token = localStorage.getItem('pulsefit_gdrive_token');
  const expiry = localStorage.getItem('pulsefit_gdrive_token_expires');
  
  if (token && expiry && parseInt(expiry) > Date.now()) {
    gdriveAccessToken = token;
    gdriveTokenExpiry = parseInt(expiry);
    
    // Register token with GAPI client
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    
    updateGDriveStatus('connected');
    
    // Pull and merge data in the background on startup
    pullAndMergeDataFromDrive().then(success => {
      if (success) {
        if (typeof renderNutritionTab === 'function') renderNutritionTab();
        if (typeof renderHistory === 'function') renderHistory();
        if (typeof renderRoutineTemplates === 'function') renderRoutineTemplates();
      }
    });
  } else {
    // Token expired or not found
    localStorage.removeItem('pulsefit_gdrive_token');
    localStorage.removeItem('pulsefit_gdrive_token_expires');
    
    if (localStorage.getItem('pulsefit_gdrive_connected') === 'true') {
      console.log('GDrive token expired. Attempting background token renewal...');
      autoRenewToken();
    } else {
      updateGDriveStatus('disconnected');
    }
  }
}

// --- Auto-Renew Google Drive Token Silently ---
function autoRenewToken() {
  if (!settings.googleClientId || settings.googleClientId.trim() === '') {
    updateGDriveStatus('disconnected');
    return;
  }
  
  updateGDriveStatus('connecting');
  
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: settings.googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          updateGDriveStatus('disconnected');
          console.error('Auto-renew Callback Error:', tokenResponse);
          return;
        }
        
        gdriveAccessToken = tokenResponse.access_token;
        gdriveTokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
        
        localStorage.setItem('pulsefit_gdrive_token', gdriveAccessToken);
        localStorage.setItem('pulsefit_gdrive_token_expires', gdriveTokenExpiry.toString());
        localStorage.setItem('pulsefit_gdrive_connected', 'true');
        
        if (typeof gapi !== 'undefined' && gapi.client) {
          gapi.client.setToken({ access_token: gdriveAccessToken });
        }
        
        updateGDriveStatus('connected');
        console.log('Google Drive auto-renewed token successfully!');
        
        pullAndMergeDataFromDrive().then(success => {
          if (success) {
            if (typeof renderNutritionTab === 'function') renderNutritionTab();
            if (typeof renderHistory === 'function') renderHistory();
            if (typeof renderRoutineTemplates === 'function') renderRoutineTemplates();
          }
        });
      },
      error_callback: (err) => {
        updateGDriveStatus('disconnected');
        console.error('Auto-renew OAuth Error:', err);
      }
    });
    
    // Request token silently without forcing consent prompt (silent renewal if already approved)
    tokenClient.requestAccessToken({ prompt: '' });
  } catch (err) {
    updateGDriveStatus('disconnected');
    console.error('Auto-renew failed to initiate:', err);
  }
}

// --- Connect / Authorize Google Drive ---
function connectGoogleDrive() {
  if (!settings.googleClientId || settings.googleClientId.trim() === '') {
    alert('Please enter your Google Cloud Client ID in Settings first.');
    return;
  }
  
  updateGDriveStatus('connecting');
  
  try {
    // Initialize token client with user's client ID
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: settings.googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          updateGDriveStatus('disconnected');
          console.error('OAuth Callback Error:', tokenResponse);
          alert(`Google authentication failed: ${tokenResponse.error}`);
          return;
        }
        
        gdriveAccessToken = tokenResponse.access_token;
        gdriveTokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
        
        // Save to localStorage (valid across tab reloads)
        localStorage.setItem('pulsefit_gdrive_token', gdriveAccessToken);
        localStorage.setItem('pulsefit_gdrive_token_expires', gdriveTokenExpiry.toString());
        localStorage.setItem('pulsefit_gdrive_connected', 'true');
        
        // Register token with GAPI client
        if (typeof gapi !== 'undefined' && gapi.client) {
          gapi.client.setToken({ access_token: gdriveAccessToken });
        }
        
        updateGDriveStatus('connected');
        alert('Connected to Google Drive! Workouts and nutrition logs will now auto-sync.');
        closeSettingsModal();
        
        // Pull and merge data immediately
        pullAndMergeDataFromDrive().then(success => {
          if (success) {
            if (typeof renderNutritionTab === 'function') renderNutritionTab();
            if (typeof renderHistory === 'function') renderHistory();
            if (typeof renderRoutineTemplates === 'function') renderRoutineTemplates();
          }
        });
      },
      error_callback: (err) => {
        updateGDriveStatus('disconnected');
        console.error('OAuth Token Client Error:', err);
        alert('Error initializing Google Sign-in popup. Verify your Client ID and origins.');
      }
    });
    
    // Request access token (opens popup)
    tokenClient.requestAccessToken({ prompt: 'consent' });
    
  } catch (err) {
    updateGDriveStatus('disconnected');
    console.error('Failed to connect Google Drive:', err);
    alert('Google Login failed to start. Ensure your Client ID format is valid.');
  }
}

// --- Update UI Status Badge ---
function updateGDriveStatus(status) {
  const badge = document.getElementById('gdrive-status-badge');
  const connectBtn = document.getElementById('connect-gdrive-btn');
  const viewLogBtn = document.getElementById('view-gdrive-log-btn');
  const syncDataBtn = document.getElementById('sync-gdrive-data-btn');
  
  if (!badge || !connectBtn) return;
  
  badge.className = `gdrive-status-badge ${status}`;
  
  if (viewLogBtn) {
    viewLogBtn.disabled = (status !== 'connected');
  }
  
  if (syncDataBtn) {
    syncDataBtn.disabled = (status !== 'connected');
  }
  
  if (status === 'connected') {
    badge.textContent = 'Connected';
    connectBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Reconnect';
    connectBtn.className = 'btn btn-outline-primary btn-sm';
    connectBtn.disabled = false;
  } else if (status === 'connecting') {
    badge.textContent = 'Connecting...';
    connectBtn.disabled = true;
  } else {
    badge.textContent = 'Disconnected';
    connectBtn.innerHTML = '<i data-lucide="log-in"></i> Connect Google Drive';
    connectBtn.className = 'btn btn-outline-secondary btn-sm';
    connectBtn.disabled = (!settings.googleClientId || settings.googleClientId.trim() === '');
  }
  
  lucide.createIcons();
}

// --- Check if Token is Valid ---
function isGDriveConnected() {
  return gdriveAccessToken && gdriveTokenExpiry && gdriveTokenExpiry > Date.now();
}

// --- Compile Workout to Human-Readable Text ---
function formatWorkoutForFile(workout) {
  const dateStr = new Date(workout.startTime).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const duration = Math.round((workout.endTime - workout.startTime) / 60000);
  
  let log = `==================================================\n`;
  log += `Workout Date: ${dateStr}\n`;
  log += `Workout Name: ${workout.name}\n`;
  log += `Duration: ${duration} minutes\n`;
  if (workout.notes) {
    log += `Notes: ${workout.notes}\n`;
  }
  log += `Exercises:\n`;
  
  workout.exercises.forEach((ex, idx) => {
    const sets = ex.sets.map(s => `${s.weight} ${workout.weightUnit || settings.weightUnit} x ${s.reps}`).join(', ');
    log += `  ${idx + 1}. ${ex.name}: ${sets}\n`;
  });
  
  log += `==================================================\n`;
  return log;
}

// --- Get or Create custom sync folder inside Google Drive ---
async function getOrCreateFolder(folderName) {
  try {
    console.log(`Searching for folder '${folderName}'...`);
    const escapedName = folderName.replace(/'/g, "\\'");
    const searchResponse = await gapi.client.drive.files.list({
      q: `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchResponse.result.files;
    if (files && files.length > 0) {
      console.log(`Found folder '${folderName}' with ID: ${files[0].id}`);
      return files[0].id;
    }
    
    console.log(`Folder '${folderName}' not found. Creating it...`);
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });
    
    console.log(`Created folder '${folderName}' with ID: ${createResponse.result.id}`);
    return createResponse.result.id;
  } catch (err) {
    console.error(`Error in getOrCreateFolder for '${folderName}':`, err);
    throw err;
  }
}

// --- Append text to a Google Doc using the Docs API ---
async function appendDocContent(fileId, text) {
  try {
    // 1. Get the document metadata to find the body's end index
    const docResponse = await gapi.client.docs.documents.get({
      documentId: fileId
    });
    
    const bodyContent = docResponse.result.body.content;
    const lastElement = bodyContent[bodyContent.length - 1];
    const endIndex = Math.max(1, lastElement.endIndex - 1);
    
    // 2. Perform the batchUpdate to insert text at the end index
    await gapi.client.docs.documents.batchUpdate({
      documentId: fileId,
      resource: {
        requests: [
          {
            insertText: {
              location: {
                index: endIndex
              },
              text: text
            }
          }
        ]
      }
    });
    console.log('Appended to Google Doc successfully!');
  } catch (err) {
    console.error('Error appending to Google Doc:', err);
    throw err;
  }
}

// --- Sync Workout Log with Google Doc PulseFit_Workout_Log ---
async function syncWorkoutToDrive(workout) {
  if (!isGDriveConnected()) {
    console.warn('Google Drive not authorized or expired. Sync skipped.');
    return false;
  }
  
  try {
    // Ensure token is registered with GAPI client
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    const folderName = (settings.googleFolder || 'PulseFit Workouts').trim();
    const folderId = await getOrCreateFolder(folderName);
    
    console.log(`Searching for Google Doc 'PulseFit_Workout_Log' in folder '${folderName}'...`);
    
    // 1. Search for existing Google Doc in parent folder
    const searchResponse = await gapi.client.drive.files.list({
      q: `name = 'PulseFit_Workout_Log' and mimeType = 'application/vnd.google-apps.document' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchResponse.result.files;
    const newLogEntry = formatWorkoutForFile(workout);
    let fileId = null;
    
    if (files && files.length > 0) {
      // Google Doc exists - append text
      fileId = files[0].id;
      console.log('Appending log entry to existing Google Doc in GDrive...');
      await appendDocContent(fileId, "\n\n" + newLogEntry);
    } else {
      // Doc does not exist - create it
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: 'PulseFit_Workout_Log',
          mimeType: 'application/vnd.google-apps.document',
          parents: [folderId]
        },
        fields: 'id'
      });
      
      fileId = createResponse.result.id;
      console.log('Created new Google Doc PulseFit_Workout_Log in GDrive folder...');
      
      const fileHeader = `PULSEFIT WORKOUT DATABASE\n=========================\nThis document stores your logged workouts. Your Gemini AI Workspace extension reads this file to analyze details.\n\n`;
      await appendDocContent(fileId, fileHeader + newLogEntry);
    }
    
    console.log('Workout successfully synced to Google Doc!');
    return true;
    
  } catch (err) {
    console.error('Google Doc Sync Error:', err);
    return false;
  }
}

// --- View current Google Doc contents by exporting it to plain text ---
async function viewDriveLog() {
  if (!isGDriveConnected()) {
    alert('Please connect Google Drive first.');
    return;
  }
  
  const modal = document.getElementById('log-viewer-modal');
  const contentEl = document.getElementById('log-viewer-content');
  if (!modal || !contentEl) return;
  
  contentEl.textContent = 'Loading log file from Google Drive...';
  modal.classList.remove('hidden');
  
  try {
    // Ensure token is registered
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    
    const folderName = (settings.googleFolder || 'PulseFit Workouts').trim();
    console.log(`Searching for Google Doc 'PulseFit_Workout_Log' in folder '${folderName}'...`);
    
    // 1. Find the parent folder
    const searchFolderResponse = await gapi.client.drive.files.list({
      q: `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const folders = searchFolderResponse.result.files;
    if (!folders || folders.length === 0) {
      contentEl.textContent = `Error: Folder '${folderName}' not found in your Google Drive. Try saving a workout first to initialize it.`;
      return;
    }
    
    const folderId = folders[0].id;
    
    // 2. Find the Google Doc inside the folder
    const searchFileResponse = await gapi.client.drive.files.list({
      q: `name = 'PulseFit_Workout_Log' and mimeType = 'application/vnd.google-apps.document' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchFileResponse.result.files;
    if (!files || files.length === 0) {
      contentEl.textContent = `No logged workouts found. The Google Doc 'PulseFit_Workout_Log' does not exist in your Google Drive yet. Try completing and saving a workout first!`;
      return;
    }
    
    const fileId = files[0].id;
    
    // 3. Export the Google Doc content as plain text
    const fileFetch = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
      headers: {
        'Authorization': `Bearer ${gdriveAccessToken}`
      }
    });
    
    if (fileFetch.ok) {
      const logText = await fileFetch.text();
      contentEl.textContent = logText || '(Google Doc is empty)';
    } else {
      throw new Error(`Failed to export Google Doc to text. Status: ${fileFetch.status}`);
    }
  } catch (err) {
    console.error('Error fetching Google Doc log:', err);
    contentEl.textContent = `Failed to retrieve Google Doc log from Google Drive.\n\nDetails:\n${err.message || err}`;
  }
}

// --- Sync Daily Macros Log with Google Doc PulseFit_macros ---
async function syncNutritionToDrive(nutritionLog) {
  if (!isGDriveConnected()) {
    console.warn('Google Drive not authorized or expired. Macros sync skipped.');
    updateMacrosSyncStatus('Disconnected');
    return false;
  }
  
  try {
    updateMacrosSyncStatus('Syncing...');
    
    // Ensure token is registered with GAPI client
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    const folderName = (settings.googleFolder || 'PulseFit Workouts').trim();
    const folderId = await getOrCreateFolder(folderName);
    
    console.log(`Searching for Google Doc 'PulseFit_macros' in folder '${folderName}'...`);
    
    // 1. Search for existing Google Doc in parent folder
    const searchResponse = await gapi.client.drive.files.list({
      q: `name = 'PulseFit_macros' and mimeType = 'application/vnd.google-apps.document' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchResponse.result.files;
    let fileId = null;
    
    // 2. Format the entire nutrition logs ledger
    let ledger = `PULSEFIT NUTRITION & MACROS LOG\n`;
    ledger += `===============================\n`;
    ledger += `This document stores your daily nutrition and macro logs. Your Gemini AI Workspace extension reads this file to analyze your diet.\n\n`;
    ledger += `Daily Logs:\n\n`;
    
    // Sort dates descending (newest first)
    const dates = Object.keys(nutritionLog).sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) {
      ledger += `No food logs recorded yet.\n`;
    } else {
      dates.forEach(date => {
        const dayLog = nutritionLog[date];
        const displayDate = new Date(date + "T00:00:00").toLocaleDateString(undefined, {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        
        ledger += `--------------------------------------------------\n`;
        ledger += `Date: ${displayDate} (${date})\n`;
        ledger += `Daily Totals: Carbs: ${dayLog.totals.carbs.toFixed(1)}g | Protein: ${dayLog.totals.protein.toFixed(1)}g | Fat: ${dayLog.totals.fat.toFixed(1)}g | Calories: ${dayLog.totals.calories.toFixed(1)} kcal\n`;
        ledger += `Foods Logged:\n`;
        
        if (dayLog.items && dayLog.items.length > 0) {
          dayLog.items.forEach(item => {
            ledger += `  * ${item.name}: ${item.carbs.toFixed(1)}g C, ${item.protein.toFixed(1)}g P, ${item.fat.toFixed(1)}g F, ${item.calories.toFixed(1)} kcal (Source: ${item.source || 'Internet'})\n`;
          });
        } else {
          ledger += `  (No items recorded for this day)\n`;
        }
        ledger += `--------------------------------------------------\n\n`;
      });
    }
    
    if (files && files.length > 0) {
      fileId = files[0].id;
      console.log('Clearing and updating existing Google Doc PulseFit_macros...');
      
      // Clear Doc content first
      const docResponse = await gapi.client.docs.documents.get({ documentId: fileId });
      const bodyContent = docResponse.result.body.content;
      const lastElement = bodyContent[bodyContent.length - 1];
      const endIndex = Math.max(1, lastElement.endIndex - 1);
      
      const requests = [];
      if (endIndex > 1) {
        requests.push({
          deleteContentRange: {
            range: {
              startIndex: 1,
              endIndex: endIndex
            }
          }
        });
      }
      requests.push({
        insertText: {
          location: {
            index: 1
          },
          text: ledger
        }
      });
      
      await gapi.client.docs.documents.batchUpdate({
        documentId: fileId,
        resource: { requests }
      });
      
    } else {
      // Create Doc
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: 'PulseFit_macros',
          mimeType: 'application/vnd.google-apps.document',
          parents: [folderId]
        },
        fields: 'id'
      });
      
      fileId = createResponse.result.id;
      console.log('Created new Google Doc PulseFit_macros in GDrive folder...');
      
      await appendDocContent(fileId, ledger);
    }
    
    console.log('Macros successfully synced to Google Doc!');
    updateMacrosSyncStatus('Synced');
    return true;
    
  } catch (err) {
    console.error('Macros Doc Sync Error:', err);
    updateMacrosSyncStatus('Sync Failed');
    return false;
  }
}

function updateMacrosSyncStatus(statusText) {
  const pill = document.getElementById('macros-doc-sync-pill');
  const textEl = document.getElementById('macros-doc-sync-text');
  if (!pill || !textEl) return;
  
  textEl.textContent = `Sync: ${statusText}`;
  
  if (statusText === 'Synced') {
    pill.className = 'api-status-pill success';
  } else if (statusText === 'Syncing...') {
    pill.className = 'api-status-pill success';
  } else {
    pill.className = 'api-status-pill error';
  }
}

// --- Backup all PulseFit structured data to Google Drive as JSON ---
async function backupDataToDrive() {
  if (!isGDriveConnected()) {
    console.log("Drive not connected. Backup skipped.");
    return false;
  }
  
  try {
    const folderName = (settings.googleFolder || 'PulseFit Workouts').trim();
    const folderId = await getOrCreateFolder(folderName);
    
    // Compile all local data to sync
    const backupData = {
      workoutHistory: workoutHistory,
      exercises: exercises,
      nutritionLog: nutritionLog,
      nutritionTargets: nutritionTargets,
      settings: {
        weightUnit: settings.weightUnit,
        defaultRest: settings.defaultRest,
        timerSound: settings.timerSound,
        activeModel: settings.activeModel
      },
      lastSynced: Date.now()
    };
    
    // Search if pulsefit_backup.json already exists in parent folder
    const searchResponse = await gapi.client.drive.files.list({
      q: `name = 'pulsefit_backup.json' and mimeType = 'application/json' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchResponse.result.files;
    let fileId = null;
    
    if (files && files.length > 0) {
      fileId = files[0].id;
      console.log(`Updating existing backup file in Google Drive (ID: ${fileId})...`);
      
      // PATCH file content via media upload
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${gdriveAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backupData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update backup file content. Status: ${response.status}`);
      }
    } else {
      console.log('Creating new backup file in Google Drive...');
      
      // Multipart POST request to create file with metadata and media content
      const metadata = {
        name: 'pulsefit_backup.json',
        mimeType: 'application/json',
        parents: [folderId]
      };
      
      const boundary = 'pulsefit_backup_boundary';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;
      
      const multipartBody = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(backupData) +
        close_delim;
        
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gdriveAccessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create backup file. Status: ${response.status}`);
      }
    }
    
    console.log('PulseFit data backup completed successfully!');
    return true;
  } catch (err) {
    console.error('PulseFit backup failed:', err);
    return false;
  }
}

// --- Pull all PulseFit structured data from Google Drive and merge with local storage ---
async function pullAndMergeDataFromDrive() {
  if (!isGDriveConnected()) {
    console.log("Drive not connected. Sync/pull skipped.");
    return false;
  }
  
  try {
    const folderName = (settings.googleFolder || 'PulseFit Workouts').trim();
    const folderId = await getOrCreateFolder(folderName);
    
    // Search for existing backup file
    const searchResponse = await gapi.client.drive.files.list({
      q: `name = 'pulsefit_backup.json' and mimeType = 'application/json' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchResponse.result.files;
    if (!files || files.length === 0) {
      console.log("No backup file found in Google Drive yet. Uploading local state as first backup...");
      // Save current local data to Drive
      await backupDataToDrive();
      return true;
    }
    
    const fileId = files[0].id;
    console.log(`Downloading backup file content from Google Drive (ID: ${fileId})...`);
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${gdriveAccessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download backup file content. Status: ${response.status}`);
    }
    
    const backupData = await response.json();
    console.log("Downloaded backup content successfully. Merging...", backupData);
    
    // Call merge function in app.js
    let merged = false;
    if (typeof mergePulseFitData === 'function') {
      merged = mergePulseFitData(backupData);
    }
    
    if (merged) {
      console.log("Local data updated with backup data. Uploading merged state back to Drive...");
      await backupDataToDrive();
    } else {
      console.log("No new data to merge. Local state is up to date.");
    }
    
    return true;
  } catch (err) {
    console.error('PulseFit sync/pull failed:', err);
    return false;
  }
}
