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
      console.log('Google Drive API client loaded successfully.');
      
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

// --- Restore Connection Token from Session Storage ---
function restoreSessionToken() {
  const token = sessionStorage.getItem('pulsefit_gdrive_token');
  const expiry = sessionStorage.getItem('pulsefit_gdrive_token_expires');
  
  if (token && expiry && parseInt(expiry) > Date.now()) {
    gdriveAccessToken = token;
    gdriveTokenExpiry = parseInt(expiry);
    updateGDriveStatus('connected');
  } else {
    // Token expired or not found
    sessionStorage.removeItem('pulsefit_gdrive_token');
    sessionStorage.removeItem('pulsefit_gdrive_token_expires');
    updateGDriveStatus('disconnected');
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
        
        // Save to sessionStorage (valid for browser tab life)
        sessionStorage.setItem('pulsefit_gdrive_token', gdriveAccessToken);
        sessionStorage.setItem('pulsefit_gdrive_token_expires', gdriveTokenExpiry.toString());
        
        updateGDriveStatus('connected');
        alert('Connected to Google Drive! Workouts will now auto-sync.');
        closeSettingsModal();
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
  
  if (!badge || !connectBtn) return;
  
  badge.className = `gdrive-status-badge ${status}`;
  
  if (status === 'connected') {
    badge.textContent = 'Connected';
    connectBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Reconnect';
    connectBtn.className = 'btn btn-outline-primary btn-sm';
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

// --- Sync Workout Log with PulseFit_Workout_Log.txt ---
async function syncWorkoutToDrive(workout) {
  if (!isGDriveConnected()) {
    console.warn('Google Drive not authorized or expired. Sync skipped.');
    return false;
  }
  
  try {
    console.log('Searching for PulseFit_Workout_Log.txt...');
    
    // 1. Search for existing file
    const searchResponse = await gapi.client.drive.files.list({
      q: "name = 'PulseFit_Workout_Log.txt' and trashed = false",
      fields: 'files(id, name)',
      spaces: 'drive'
    });
    
    const files = searchResponse.result.files;
    const newLogEntry = formatWorkoutForFile(workout);
    let fileId = null;
    let fileContent = '';
    
    if (files.length > 0) {
      // File exists - fetch it and append
      fileId = files[0].id;
      const fileFetch = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${gdriveAccessToken}`
        }
      });
      
      if (fileFetch.ok) {
        fileContent = await fileFetch.text();
        fileContent += "\n\n" + newLogEntry;
      } else {
        throw new Error('Failed to retrieve existing workout file content.');
      }
      
      console.log('Appending log entry to existing file in GDrive...');
    } else {
      // File does not exist - create it
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: 'PulseFit_Workout_Log.txt',
          mimeType: 'text/plain'
        },
        fields: 'id'
      });
      
      fileId = createResponse.result.id;
      
      const fileHeader = `PULSEFIT WORKOUT DATABASE\n=========================\nThis document stores your logged workouts. Your Gemini AI Workspace extension reads this file to analyze details.\n\n`;
      fileContent = fileHeader + newLogEntry;
      
      console.log('Created new PulseFit_Workout_Log.txt file in GDrive...');
    }
    
    // 2. Upload/Update the file media content
    const uploadResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${gdriveAccessToken}`,
        'Content-Type': 'text/plain'
      },
      body: fileContent
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload returned status ${uploadResponse.status}`);
    }
    
    console.log('Workout successfully synced to Google Drive!');
    return true;
    
  } catch (err) {
    console.error('Google Drive Sync Error:', err);
    return false;
  }
}
