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
      await gapi.client.load('sheets', 'v4');
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
  
  // Attach event listener to header Google Drive status pill for easy one-click reconnect / sync
  const headerPill = document.getElementById('header-gdrive-status-pill');
  if (headerPill) {
    headerPill.addEventListener('click', () => {
      if (isGDriveConnected()) {
        console.log('Header GDrive status pill clicked: initiating manual sync...');
        syncEverythingNow();
      } else {
        console.log('Header GDrive status pill clicked: initiating re-connection popup...');
        connectGoogleDrive();
      }
    });
  }
  
  // Attach event listener to homepage Google Drive status banner button
  const homeActionBtn = document.getElementById('gdrive-home-action-btn');
  if (homeActionBtn) {
    homeActionBtn.addEventListener('click', () => {
      if (isGDriveConnected()) {
        console.log('Home GDrive action button clicked: initiating manual sync...');
        syncEverythingNow();
      } else {
        console.log('Home GDrive action button clicked: initiating connection popup...');
        connectGoogleDrive();
      }
    });
  }
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
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
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
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
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
  
  // Header pill elements
  const headerPill = document.getElementById('header-gdrive-status-pill');
  const headerText = document.getElementById('header-gdrive-status-text');
  
  // Home banner elements
  const homeIconBg = document.getElementById('gdrive-home-icon-bg');
  const homeIcon = document.getElementById('gdrive-home-icon');
  const homeStatusText = document.getElementById('gdrive-home-status-text');
  const homeActionBtn = document.getElementById('gdrive-home-action-btn');
  
  if (badge && connectBtn) {
    badge.className = `gdrive-status-badge ${status === 'syncing' ? 'connected' : status}`;
    
    if (viewLogBtn) {
      viewLogBtn.disabled = (status !== 'connected' && status !== 'syncing');
    }
    
    if (syncDataBtn) {
      syncDataBtn.disabled = (status !== 'connected' && status !== 'syncing');
    }
    
    if (status === 'connected') {
      badge.textContent = 'Connected';
      connectBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Reconnect';
      connectBtn.className = 'btn btn-outline-primary btn-sm';
      connectBtn.disabled = false;
    } else if (status === 'connecting') {
      badge.textContent = 'Connecting...';
      connectBtn.disabled = true;
    } else if (status === 'syncing') {
      badge.textContent = 'Syncing...';
      connectBtn.disabled = true;
    } else {
      badge.textContent = 'Disconnected';
      connectBtn.innerHTML = '<i data-lucide="log-in"></i> Connect Google Drive';
      connectBtn.className = 'btn btn-outline-secondary btn-sm';
      connectBtn.disabled = (!settings.googleClientId || settings.googleClientId.trim() === '');
    }
  }
  
  // Update header status pill
  if (headerPill && headerText) {
    if (status === 'connected') {
      headerPill.className = 'api-status-pill success';
      headerText.textContent = 'Drive: Connected';
      const icon = headerPill.querySelector('i, svg');
      if (icon) {
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', 'cloud');
        icon.parentNode.replaceChild(newIcon, icon);
      }
    } else if (status === 'syncing') {
      headerPill.className = 'api-status-pill success';
      headerText.textContent = 'Drive: Syncing...';
      const icon = headerPill.querySelector('i, svg');
      if (icon) {
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', 'refresh-cw');
        icon.parentNode.replaceChild(newIcon, icon);
      }
    } else if (status === 'connecting') {
      headerPill.className = 'api-status-pill success';
      headerText.textContent = 'Drive: Connecting...';
      const icon = headerPill.querySelector('i, svg');
      if (icon) {
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', 'refresh-cw');
        icon.parentNode.replaceChild(newIcon, icon);
      }
    } else {
      const previouslyConnected = localStorage.getItem('pulsefit_gdrive_connected') === 'true';
      headerPill.className = 'api-status-pill error';
      headerText.textContent = previouslyConnected ? 'Drive: Reconnect' : 'Drive: Disconnected';
      const icon = headerPill.querySelector('i, svg');
      if (icon) {
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', 'cloud-off');
        icon.parentNode.replaceChild(newIcon, icon);
      }
    }
  }
  
  // Update homepage status banner
  if (homeStatusText && homeActionBtn) {
    if (status === 'connected') {
      homeStatusText.textContent = 'Sync Status: Connected';
      
      if (homeIconBg) {
        homeIconBg.style.background = 'rgba(16, 185, 129, 0.1)';
        homeIconBg.style.color = 'var(--success)';
      }
      if (homeIcon) {
        const newIcon = document.createElement('i');
        newIcon.id = 'gdrive-home-icon';
        newIcon.setAttribute('data-lucide', 'cloud');
        homeIcon.parentNode.replaceChild(newIcon, homeIcon);
      }
      
      homeActionBtn.className = 'btn btn-outline-primary btn-sm';
      homeActionBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Sync Now';
      homeActionBtn.disabled = false;
    } else if (status === 'syncing') {
      homeStatusText.textContent = 'Sync Status: Syncing...';
      
      if (homeIconBg) {
        homeIconBg.style.background = 'rgba(16, 185, 129, 0.1)';
        homeIconBg.style.color = 'var(--success)';
      }
      if (homeIcon) {
        const newIcon = document.createElement('i');
        newIcon.id = 'gdrive-home-icon';
        newIcon.setAttribute('data-lucide', 'refresh-cw');
        homeIcon.parentNode.replaceChild(newIcon, homeIcon);
      }
      
      homeActionBtn.className = 'btn btn-outline-primary btn-sm';
      homeActionBtn.innerHTML = '<div class="loading-spinner" style="width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; margin-right: 6px;"></div> Syncing...';
      homeActionBtn.disabled = true;
    } else if (status === 'connecting') {
      homeStatusText.textContent = 'Sync Status: Connecting...';
      homeActionBtn.disabled = true;
    } else {
      const previouslyConnected = localStorage.getItem('pulsefit_gdrive_connected') === 'true';
      homeStatusText.textContent = previouslyConnected ? 'Sync Status: Reconnect Required' : 'Sync Status: Disconnected';
      
      if (homeIconBg) {
        homeIconBg.style.background = 'rgba(239, 68, 68, 0.1)';
        homeIconBg.style.color = 'var(--danger)';
      }
      if (homeIcon) {
        const newIcon = document.createElement('i');
        newIcon.id = 'gdrive-home-icon';
        newIcon.setAttribute('data-lucide', 'cloud-off');
        homeIcon.parentNode.replaceChild(newIcon, homeIcon);
      }
      
      homeActionBtn.className = 'btn btn-primary btn-sm';
      homeActionBtn.innerHTML = previouslyConnected ? '<i data-lucide="log-in"></i> Reconnect' : '<i data-lucide="log-in"></i> Connect Drive';
      homeActionBtn.disabled = false;
    }
  }
  
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// --- Check if Token is Valid ---
function isGDriveConnected() {
  return gdriveAccessToken && gdriveTokenExpiry && gdriveTokenExpiry > Date.now();
}

// --- Proactive Token Renewal wrapped in a Promise ---
function renewTokenPromise() {
  return new Promise((resolve) => {
    if (isGDriveConnected()) {
      resolve(true);
      return;
    }
    
    if (localStorage.getItem('pulsefit_gdrive_connected') !== 'true') {
      resolve(false);
      return;
    }
    
    if (!settings.googleClientId || settings.googleClientId.trim() === '') {
      updateGDriveStatus('disconnected');
      resolve(false);
      return;
    }
    
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      console.warn('Google accounts library not loaded.');
      resolve(false);
      return;
    }
    
    updateGDriveStatus('connecting');
    
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: settings.googleClientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
        callback: (tokenResponse) => {
          if (tokenResponse.error !== undefined) {
            updateGDriveStatus('disconnected');
            console.error('Auto-renew Promise Callback Error:', tokenResponse);
            resolve(false);
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
          console.log('Google Drive auto-renewed token successfully via Promise!');
          resolve(true);
        },
        error_callback: (err) => {
          updateGDriveStatus('disconnected');
          console.error('Auto-renew Promise OAuth Error:', err);
          resolve(false);
        }
      });
      
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (err) {
      updateGDriveStatus('disconnected');
      console.error('Auto-renew Promise failed to initiate:', err);
      resolve(false);
    }
  });
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

// --- Prepend text to a Google Doc just after the header or at the top ---
async function prependWorkoutLog(fileId, text) {
  try {
    const docResponse = await gapi.client.docs.documents.get({
      documentId: fileId
    });
    
    const bodyContent = docResponse.result.body.content;
    let insertIndex = 1;
    let foundEntry = false;
    
    for (const element of bodyContent) {
      if (element.paragraph) {
        const pText = element.paragraph.elements
          .map(el => el.textRun ? el.textRun.content : '')
          .join('');
        
        if (pText.includes('==================================================') || pText.includes('Workout Date:')) {
          insertIndex = element.startIndex;
          foundEntry = true;
          break;
        }
      }
    }
    
    if (!foundEntry) {
      // Fallback: insert at the end of the document (after the header)
      const lastElement = bodyContent[bodyContent.length - 1];
      insertIndex = Math.max(1, lastElement.endIndex - 1);
    }
    
    // Perform the batchUpdate to insert text at the calculated insertIndex
    await gapi.client.docs.documents.batchUpdate({
      documentId: fileId,
      resource: {
        requests: [
          {
            insertText: {
              location: {
                index: insertIndex
              },
              text: text + "\n"
            }
          }
        ]
      }
    });
    console.log('Prepended to Google Doc successfully!');
  } catch (err) {
    console.error('Error prepending to Google Doc:', err);
    throw err;
  }
}

// --- Sync Workout Log with Google Doc PulseFit_Workout_Log ---
async function syncWorkoutToDrive(workout) {
  if (!isGDriveConnected() && localStorage.getItem('pulsefit_gdrive_connected') === 'true') {
    console.log('Workout sync triggered but token expired. Attempting token renewal...');
    const renewed = await renewTokenPromise();
    if (!renewed) {
      console.warn('Silent token renewal failed during workout sync.');
      alert('Google Drive token expired. Workout sync failed. Please reconnect in Settings.');
      return false;
    }
  }

  if (!isGDriveConnected()) {
    console.warn('Google Drive not authorized or expired. Sync skipped.');
    return false;
  }
  
  updateGDriveStatus('syncing');
  
  try {
    // Ensure token is registered with GAPI client
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    const folderName = (settings.googleFolder || 'Pulsefit').trim();
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
      // Google Doc exists - prepend text
      fileId = files[0].id;
      console.log('Prepending log entry to existing Google Doc in GDrive...');
      await prependWorkoutLog(fileId, newLogEntry);
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
  } finally {
    updateGDriveStatus('connected');
  }
}

// --- View current Google Doc contents by exporting it to plain text ---
async function viewDriveLog() {
  if (!isGDriveConnected() && localStorage.getItem('pulsefit_gdrive_connected') === 'true') {
    const renewed = await renewTokenPromise();
    if (!renewed) {
      alert('Google Drive token expired. Please reconnect in Settings.');
      return;
    }
  }

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
    
    const folderName = (settings.googleFolder || 'Pulsefit').trim();
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
  if (!isGDriveConnected() && localStorage.getItem('pulsefit_gdrive_connected') === 'true') {
    console.log('Nutrition sync triggered but token expired. Attempting token renewal...');
    const renewed = await renewTokenPromise();
    if (!renewed) {
      console.warn('Silent token renewal failed during nutrition sync.');
      updateMacrosSyncStatus('Sync Failed');
      alert('Google Drive token expired. Nutrition sync failed. Please reconnect in Settings.');
      return false;
    }
  }

  if (!isGDriveConnected()) {
    console.warn('Google Drive not authorized or expired. Macros sync skipped.');
    updateMacrosSyncStatus('Disconnected');
    return false;
  }
  
  updateGDriveStatus('syncing');
  
  try {
    updateMacrosSyncStatus('Syncing...');
    
    // Ensure token is registered with GAPI client
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    const folderName = (settings.googleFolder || 'Pulsefit').trim();
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
      
      if (endIndex > 1) {
        try {
          await gapi.client.docs.documents.batchUpdate({
            documentId: fileId,
            resource: {
              requests: [{
                deleteContentRange: {
                  range: {
                    startIndex: 1,
                    endIndex: endIndex
                  }
                }
              }]
            }
          });
        } catch (delErr) {
          console.warn('Google Doc clear request failed, will attempt to insert anyway:', delErr);
        }
      }
      
      // Now insert the new content
      await gapi.client.docs.documents.batchUpdate({
        documentId: fileId,
        resource: {
          requests: [{
            insertText: {
              location: {
                index: 1
              },
              text: ledger
            }
          }]
        }
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
  } finally {
    updateGDriveStatus('connected');
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
  if (!isGDriveConnected() && localStorage.getItem('pulsefit_gdrive_connected') === 'true') {
    const renewed = await renewTokenPromise();
    if (!renewed) return false;
  }
  if (!isGDriveConnected()) {
    console.log("Drive not connected. Backup skipped.");
    return false;
  }
  
  updateGDriveStatus('syncing');
  
  try {
    const folderName = (settings.googleFolder || 'Pulsefit').trim();
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
        activeModel: settings.activeModel,
        userName: settings.userName
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
      
      const response = await gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'media' },
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to update backup file content. Status: ${response.status}`);
      }
    } else {
      console.log('Creating new backup file in Google Drive...');
      
      const metadata = {
        name: 'pulsefit_backup.json',
        mimeType: 'application/json',
        parents: [folderId]
      };
      
      const boundary = 'pulsefit_backup_boundary';
      const multipartBody = 
        `--${boundary}\r\n` +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(backupData) +
        `\r\n--${boundary}--`;
        
      const response = await gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body: multipartBody
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to create backup file. Status: ${response.status}`);
      }
    }
    
    console.log('PulseFit data backup completed successfully!');
    return true;
  } catch (err) {
    console.error('PulseFit backup failed:', err);
    return false;
  } finally {
    updateGDriveStatus('connected');
  }
}

// --- Pull all PulseFit structured data from Google Drive and merge with local storage ---
async function pullAndMergeDataFromDrive() {
  if (!isGDriveConnected() && localStorage.getItem('pulsefit_gdrive_connected') === 'true') {
    const renewed = await renewTokenPromise();
    if (!renewed) return false;
  }
  if (!isGDriveConnected()) {
    console.log("Drive not connected. Sync/pull skipped.");
    return false;
  }
  
  updateGDriveStatus('syncing');
  
  try {
    const folderName = (settings.googleFolder || 'Pulsefit').trim();
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
      await backupDataToDrive();
      return true;
    }
    
    const fileId = files[0].id;
    console.log(`Downloading backup file content from Google Drive (ID: ${fileId})...`);
    
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    let backupData = response.result;
    if (typeof backupData === 'string') {
      backupData = JSON.parse(backupData);
    }
    
    console.log("Downloaded backup content successfully. Merging...", backupData);
    
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
  } finally {
    updateGDriveStatus('connected');
  }
}

// --- Create Google Sheet for Access Control inside the 'Pulsefit' folder ---
async function createAccessControlSheet() {
  if (!isGDriveConnected()) {
    alert("Please connect Google Drive first to set up access control.");
    return;
  }

  const createBtn = document.getElementById('create-access-sheet-btn');
  const originalHtml = createBtn.innerHTML;
  createBtn.disabled = true;
  createBtn.innerHTML = '<div class="loading-spinner" style="width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; margin-right: 6px;"></div> Creating...';

  try {
    // Dynamically load sheets API if not already loaded
    if (!gapi.client.sheets) {
      console.log('Sheets API not loaded. Loading now...');
      await gapi.client.load('sheets', 'v4');
    }

    const folderName = (settings.googleFolder || 'Pulsefit').trim();
    const folderId = await getOrCreateFolder(folderName);

    // 1. Search if a file named 'Pulsefit_Access_Control' already exists in parents
    const searchResponse = await gapi.client.drive.files.list({
      q: `name = 'Pulsefit_Access_Control' and mimeType = 'application/vnd.google-apps.spreadsheet' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    let spreadsheetId = null;
    const files = searchResponse.result.files;

    if (files && files.length > 0) {
      spreadsheetId = files[0].id;
      console.log(`Access Control spreadsheet already exists with ID: ${spreadsheetId}`);
    } else {
      // 2. Create a new Spreadsheet
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: 'Pulsefit_Access_Control',
          mimeType: 'application/vnd.google-apps.spreadsheet',
          parents: [folderId]
        },
        fields: 'id'
      });
      spreadsheetId = createResponse.result.id;
      console.log(`Created new Access Control spreadsheet with ID: ${spreadsheetId}`);

      // 3. Populate spreadsheet with headers and first row containing admin email
      let adminEmail = 'Saurabh';
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { 'Authorization': `Bearer ${gdriveAccessToken}` }
        });
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          adminEmail = userInfo.email;
        }
      } catch (err) {
        console.warn('Failed to fetch admin email from UserInfo endpoint:', err);
      }

      const values = [
        ['Email', 'Status', 'Requested Date', 'Approved Date'],
        [adminEmail, 'Approved', new Date().toLocaleDateString(), new Date().toLocaleDateString()]
      ];

      // Update the values using sheets API
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1:D2',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: values
        }
      });
      console.log('Populated spreadsheet rows.');
    }

    // 4. Set permission to public read-only (anyone with the link can view)
    await gapi.client.drive.permissions.create({
      fileId: spreadsheetId,
      resource: {
        role: 'reader',
        type: 'anyone'
      }
    });
    console.log('Granted public read-only permission.');

    // 5. Update UI
    document.getElementById('settings-access-sheet-id').value = spreadsheetId;
    
    // Show a beautiful modal detailing the next steps
    alert(`Success!\n\nAccess Control Google Sheet has been successfully created in your 'Pulsefit' folder.\n\nSpreadsheet ID: ${spreadsheetId}\n\nTo activate it, please copy this Spreadsheet ID and send it in the chat so I can update the app's code!`);

  } catch (err) {
    console.error('Failed to create access control sheet:', err);
    let errMsg = '';
    if (err && err.result && err.result.error && err.result.error.message) {
      errMsg = err.result.error.message;
    } else if (err && err.message) {
      errMsg = err.message;
    } else if (typeof err === 'object') {
      errMsg = JSON.stringify(err);
    } else {
      errMsg = String(err);
    }
    alert(`Error setting up access control sheet: ${errMsg}\n\nTip: If you were already connected to Google Drive, try disconnecting (from Google settings or clearing cache) and signing in again to authorize the new email permission.`);
  } finally {
    createBtn.disabled = false;
    createBtn.innerHTML = originalHtml;
  }
}

// --- Overwrite Google Doc PulseFit_Workout_Log with entire local history (newest first) ---
async function regenerateWorkoutDocLog() {
  if (!isGDriveConnected() && localStorage.getItem('pulsefit_gdrive_connected') === 'true') {
    console.log('Workout doc regeneration triggered but token expired. Attempting renewal...');
    const renewed = await renewTokenPromise();
    if (!renewed) {
      alert('Google Drive token expired. Re-regeneration failed. Please connect Google Drive first.');
      return false;
    }
  }

  if (!isGDriveConnected()) {
    alert('Please connect Google Drive first.');
    return false;
  }

  try {
    // Ensure token is registered with GAPI client
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    const folderName = (settings.googleFolder || 'Pulsefit').trim();
    const folderId = await getOrCreateFolder(folderName);
    
    console.log(`Searching for Google Doc 'PulseFit_Workout_Log' in folder '${folderName}'...`);
    
    // 1. Search for existing Google Doc in parent folder
    const searchResponse = await gapi.client.drive.files.list({
      q: `name = 'PulseFit_Workout_Log' and mimeType = 'application/vnd.google-apps.document' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchResponse.result.files;
    let fileId = null;
    
    // Sort history by startTime descending (newest first)
    const sortedHistory = [...workoutHistory].sort((a, b) => b.startTime - a.startTime);
    
    let docContent = `PULSEFIT WORKOUT DATABASE\n=========================\nThis document stores your logged workouts. Your Gemini AI Workspace extension reads this file to analyze details.\n\n`;
    sortedHistory.forEach(workout => {
      docContent += formatWorkoutForFile(workout) + "\n";
    });
    
    if (files && files.length > 0) {
      fileId = files[0].id;
      console.log('Clearing and overwriting existing Google Doc PulseFit_Workout_Log...');
      
      // Clear Doc content first
      const docResponse = await gapi.client.docs.documents.get({ documentId: fileId });
      const bodyContent = docResponse.result.body.content;
      const lastElement = bodyContent[bodyContent.length - 1];
      const endIndex = Math.max(1, lastElement.endIndex - 1);
      
      if (endIndex > 1) {
        try {
          await gapi.client.docs.documents.batchUpdate({
            documentId: fileId,
            resource: {
              requests: [{
                deleteContentRange: {
                  range: {
                    startIndex: 1,
                    endIndex: endIndex
                  }
                }
              }]
            }
          });
        } catch (delErr) {
          console.warn('Google Doc clear request failed, will attempt to insert anyway:', delErr);
        }
      }
      
      // Now insert the new content
      await gapi.client.docs.documents.batchUpdate({
        documentId: fileId,
        resource: {
          requests: [{
            insertText: {
              location: {
                index: 1
              },
              text: docContent
            }
          }]
        }
      });
    } else {
      // Create Doc
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
      await appendDocContent(fileId, docContent);
    }
    
    console.log('Workout Doc regenerated successfully!');
    return true;
  } catch (err) {
    console.error('Workout Doc Regeneration Error:', err);
    return false;
  }
}

// --- Consolidated Manual Sync Action ---
async function syncEverythingNow() {
  updateGDriveStatus('syncing');
  
  let dbSuccess = false;
  let workoutSuccess = false;
  let nutritionSuccess = false;
  
  try {
    if (typeof pullAndMergeDataFromDrive === 'function') {
      dbSuccess = await pullAndMergeDataFromDrive();
    }
    if (typeof regenerateWorkoutDocLog === 'function') {
      workoutSuccess = await regenerateWorkoutDocLog();
    }
    if (typeof syncNutritionToDrive === 'function') {
      nutritionSuccess = await syncNutritionToDrive(nutritionLog);
    }
    
    if (dbSuccess || workoutSuccess || nutritionSuccess) {
      alert('Synchronization complete! Raw backup updated and Google Docs regenerated.');
      if (typeof renderNutritionTab === 'function') renderNutritionTab();
      if (typeof renderHistory === 'function') renderHistory();
      if (typeof renderRoutineTemplates === 'function') renderRoutineTemplates();
      return true;
    } else {
      alert('Synchronization failed. Please check your network and Google Drive connection.');
      return false;
    }
  } catch (err) {
    console.error("Consolidated sync failed:", err);
    alert(`Sync Error: ${err.message || err}`);
    return false;
  } finally {
    updateGDriveStatus('connected');
  }
}

// ==========================================================================
// Cardio / GPS Log Syncing
// ==========================================================================

function formatCardioForFile(cardio) {
  const dateStr = new Date(cardio.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const durationMins = Math.round(cardio.durationSeconds / 60);
  
  let log = `==================================================\n`;
  log += `Workout Date: ${dateStr}\n`;
  log += `Workout Name: ${cardio.name}\n`;
  log += `Duration: ${durationMins} minutes\n`;
  log += `Distance: ${cardio.distance} ${cardio.distanceUnit}\n`;
  log += `Average Pace: ${cardio.pace}\n`;
  log += `==================================================\n`;
  return log;
}

async function saveCardioToGoogleDrive(cardio) {
  if (!isGDriveConnected()) {
    console.warn('Google Drive not connected. Cannot save cardio log.');
    return false;
  }
  
  updateGDriveStatus('syncing');
  
  try {
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken({ access_token: gdriveAccessToken });
    }
    const folderName = (settings.googleFolder || 'Pulsefit').trim();
    const folderId = await getOrCreateFolder(folderName);
    
    // 1. Google Doc (PulseFit_Workout_Log)
    const searchDocResponse = await gapi.client.drive.files.list({
      q: `name = 'PulseFit_Workout_Log' and mimeType = 'application/vnd.google-apps.document' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const docFiles = searchDocResponse.result.files;
    const newLogEntry = formatCardioForFile(cardio);
    
    if (docFiles && docFiles.length > 0) {
      await prependWorkoutLog(docFiles[0].id, newLogEntry);
    } else {
      const createResponse = await gapi.client.drive.files.create({
        resource: { name: 'PulseFit_Workout_Log', mimeType: 'application/vnd.google-apps.document', parents: [folderId] },
        fields: 'id'
      });
      const fileHeader = `PULSEFIT WORKOUT DATABASE\n=========================\nThis document stores your logged workouts. Your Gemini AI Workspace extension reads this file to analyze details.\n\n`;
      await appendDocContent(createResponse.result.id, fileHeader + newLogEntry);
    }
    
    // 2. Google Sheet (PulseFit_Workout_Log_Sheet)
    const searchSheetResponse = await gapi.client.drive.files.list({
      q: `name = 'PulseFit_Workout_Log_Sheet' and mimeType = 'application/vnd.google-apps.spreadsheet' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    let sheetId = null;
    const sheetFiles = searchSheetResponse.result.files;
    
    if (sheetFiles && sheetFiles.length > 0) {
      sheetId = sheetFiles[0].id;
    } else {
      const createResponse = await gapi.client.sheets.spreadsheets.create({
        resource: {
          properties: { title: 'PulseFit_Workout_Log_Sheet' },
          sheets: [
            { properties: { title: "Workouts" } },
            { properties: { title: "Cardio" } }
          ]
        }
      });
      sheetId = createResponse.result.spreadsheetId;
      
      // Move spreadsheet to folder
      await gapi.client.drive.files.update({
        fileId: sheetId,
        addParents: folderId,
        fields: 'id, parents'
      });
      
      // Setup headers for Cardio sheet
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Cardio!A1:F1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [["Date", "Name", "Duration (Sec)", "Distance", "Unit", "Pace"]] }
      });
    }
    
    // Check if Cardio sheet exists, add if missing
    const sheetMeta = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const hasCardioSheet = sheetMeta.result.sheets.some(s => s.properties.title === 'Cardio');
    
    if (!hasCardioSheet) {
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: { requests: [{ addSheet: { properties: { title: "Cardio" } } }] }
      });
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Cardio!A1:F1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [["Date", "Name", "Duration (Sec)", "Distance", "Unit", "Pace"]] }
      });
    }
    
    // Append row
    const rowData = [
      new Date(cardio.date).toLocaleString(),
      cardio.name,
      cardio.durationSeconds,
      cardio.distance,
      cardio.distanceUnit,
      cardio.pace
    ];
    
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Cardio!A:F',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [rowData] }
    });
    
    console.log('Cardio successfully synced to Google Drive!');
    return true;
  } catch (err) {
    console.error('Google Drive Cardio Sync Error:', err);
    return false;
  } finally {
    updateGDriveStatus('connected');
  }
}
