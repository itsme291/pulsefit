// ==========================================================================
// PulseFit - Gemini AI Integration & Response Streaming
// ==========================================================================

// --- System Prompt Definition ---
function getSystemPrompt() {
  return `You are "Pulse Coach", a highly skilled, supportive, and motivating AI personal trainer and fitness analyst integrated into the PulseFit workout logging app.
Your goal is to help the user optimize their workouts, track their strength and volume progression, design routines, and suggest weight/rep targets based on their historical workout log.

Guidelines:
1. Always base your feedback on their actual workout logs (which are provided in the context). If they have no history yet, welcome them, outline standard fitness benchmarks, and guide them on how to log their first session.
2. Be concise, actionable, and encouraging. Focus on progressive overload, proper recovery, and volume/frequency optimization.
3. Suggest weight increments using the 2-for-2 rule: if they completed 2 or more reps over their target in their last set for two consecutive workouts, suggest increasing the weight (usually 5-10 lbs/2-5 kg for upper body, 10-20 lbs/5-10 kg for lower body).
4. Present workout plans, routine tables, and schedules using clean, readable tables or bullet points. Use standard Markdown.
5. If the user asks about form, give short, cues-focused advice.
6. Address the user directly and keep responses engaging and professional.

User Preferred Weight Unit: ${settings.weightUnit}
Current local time is: ${new Date().toString()}
`;
}

// --- Format Workout Logs for Gemini ---
function compileWorkoutContext() {
  if (workoutHistory.length === 0) {
    return "User Workout History: No workouts logged yet. The database is empty.";
  }
  
  let context = "User Workout History (sorted from oldest to newest):\n\n";
  
  // Sort chronological for context reading
  const sorted = [...workoutHistory].sort((a, b) => a.startTime - b.startTime);
  
  sorted.forEach((workout, idx) => {
    const dateStr = new Date(workout.startTime).toLocaleDateString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const duration = Math.round((workout.endTime - workout.startTime) / 60000);
    
    context += `--- Workout #${idx + 1} ---\n`;
    context += `Name: ${workout.name}\n`;
    context += `Date: ${dateStr}\n`;
    context += `Duration: ${duration} minutes\n`;
    if (workout.notes) {
      context += `User Notes: ${workout.notes}\n`;
    }
    context += `Exercises:\n`;
    
    workout.exercises.forEach(ex => {
      const setsStr = ex.sets.map(s => `${s.weight} ${workout.weightUnit || settings.weightUnit} x ${s.reps}`).join(', ');
      context += `  * ${ex.name}: ${setsStr}\n`;
    });
    context += `\n`;
  });
  
  return context;
}

// --- Chat Log State (Persisted in Session/Memory) ---
let chatMessages = [];

// --- Initialize Coach UI ---
function initGeminiCoachUI() {
  const sendBtn = document.getElementById('chat-send-btn');
  const textarea = document.getElementById('chat-textarea');
  const clearBtn = document.getElementById('clear-chat-btn');
  
  // Enable/disable send button based on API key & textarea value
  function toggleSendBtn() {
    const hasKey = settings.apiKey && settings.apiKey.trim().length > 10;
    sendBtn.disabled = !hasKey || textarea.value.trim() === '';
  }
  
  textarea.oninput = () => {
    toggleSendBtn();
    // Auto grow height
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight - 10) + 'px';
  };
  
  // Setup key listeners
  textarea.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        handleUserMessageSend();
      }
    }
  };
  
  sendBtn.onclick = handleUserMessageSend;
  clearBtn.onclick = clearChatHistory;
  
  // Setup quick prompts
  document.querySelectorAll('.quick-prompt-card').forEach(card => {
    // Remove old listeners to avoid multiple triggers
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    
    newCard.addEventListener('click', () => {
      if (!settings.apiKey || settings.apiKey.trim().length < 10) {
        alert('Please enter a valid Gemini API Key in Settings first.');
        openSettingsModal();
        return;
      }
      const prompt = newCard.getAttribute('data-prompt');
      textarea.value = prompt;
      textarea.style.height = 'auto';
      toggleSendBtn();
      handleUserMessageSend();
    });
  });
  
  // Initial check
  toggleSendBtn();
  renderChatMessages();
}

// --- Render Chat Bubble UI ---
function renderChatMessages() {
  const welcomeView = document.getElementById('coach-welcome');
  const chatArea = document.getElementById('coach-chat-area');
  const container = document.getElementById('chat-messages-container');
  
  if (chatMessages.length === 0) {
    welcomeView.classList.remove('hidden');
    chatArea.classList.add('hidden');
    return;
  }
  
  welcomeView.classList.add('hidden');
  chatArea.classList.remove('hidden');
  container.innerHTML = '';
  
  chatMessages.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${msg.role}`;
    
    const avatarIcon = msg.role === 'user' ? 'user' : 'sparkles';
    const parsedHTML = msg.role === 'user' ? escapeHTML(msg.content) : parseMarkdown(msg.content);
    
    bubble.innerHTML = `
      <div class="chat-bubble-avatar">
        <i data-lucide="${avatarIcon}"></i>
      </div>
      <div class="chat-bubble-content">
        ${parsedHTML}
      </div>
    `;
    container.appendChild(bubble);
  });
  
  lucide.createIcons();
  scrollToBottom();
}

function scrollToBottom() {
  const chatArea = document.getElementById('coach-chat-area');
  chatArea.scrollTo({
    top: chatArea.scrollHeight,
    behavior: 'smooth'
  });
}

function clearChatHistory() {
  if (chatMessages.length > 0 && confirm('Clear chat history?')) {
    chatMessages = [];
    renderChatMessages();
  }
}

// --- Send User Message & Trigger Gemini API Streaming ---
async function handleUserMessageSend() {
  const textarea = document.getElementById('chat-textarea');
  const userText = textarea.value.trim();
  if (userText === '') return;
  
  // Reset textarea
  textarea.value = '';
  textarea.style.height = 'auto';
  document.getElementById('chat-send-btn').disabled = true;
  
  // Add user bubble
  chatMessages.push({ role: 'user', content: userText });
  renderChatMessages();
  
  // Add temporary assistant bubble for streaming
  const container = document.getElementById('chat-messages-container');
  const assistantBubble = document.createElement('div');
  assistantBubble.className = 'chat-bubble assistant';
  assistantBubble.innerHTML = `
    <div class="chat-bubble-avatar">
      <i data-lucide="sparkles"></i>
    </div>
    <div class="chat-bubble-content streaming">
      <p>Thinking...</p>
    </div>
  `;
  container.appendChild(assistantBubble);
  lucide.createIcons();
  scrollToBottom();
  
  const contentElement = assistantBubble.querySelector('.chat-bubble-content');
  
  try {
    // Generate context and compile full prompt
    const systemPrompt = getSystemPrompt();
    const workoutContext = compileWorkoutContext();
    
    // Construct the conversations history payload
    const contents = [];
    
    // For single-turn context richness, we prefix the user's prompt with system details
    // We also provide previous chat turns for multi-turn conversational memory
    let systemInstruction = systemPrompt + "\n\n" + workoutContext;
    
    // Convert our message logs to Gemini API Format
    // Note: Gemini API standard format holds conversational turns in 'contents'
    chatMessages.forEach((msg, idx) => {
      // For the first user turn, we attach the instruction context to feed strength history
      if (idx === 0 && msg.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${msg.content}` }]
        });
      } else {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    });
    
    // Call Gemini API Stream Endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${settings.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': settings.apiKey
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.4
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }
    
    // Process the stream chunk by chunk
    let accumulatedResponse = '';
    contentElement.innerHTML = ''; // Clear "Thinking..."
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let streamBuffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      streamBuffer += decoder.decode(value, { stream: true });
      
      // Extract complete JSON objects using brace balancing
      let braceCount = 0;
      let inString = false;
      let startIdx = -1;
      
      for (let i = 0; i < streamBuffer.length; i++) {
        const char = streamBuffer[i];
        if (char === '"' && streamBuffer[i - 1] !== '\\') {
          inString = !inString;
        }
        
        if (!inString) {
          if (char === '{') {
            if (braceCount === 0) startIdx = i;
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0 && startIdx !== -1) {
              const jsonStr = streamBuffer.substring(startIdx, i + 1);
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
                  const chunkText = parsed.candidates[0].content.parts[0].text;
                  accumulatedResponse += chunkText;
                  
                  // Render progress
                  contentElement.innerHTML = parseMarkdown(accumulatedResponse);
                  scrollToBottom();
                }
              } catch (e) {
                // Ignore incomplete matches
              }
              // Advance buffer
              streamBuffer = streamBuffer.substring(i + 1);
              i = -1;
              startIdx = -1;
            }
          }
        }
      }
    }
    
    // Remove streaming visual cursor class
    contentElement.classList.remove('streaming');
    
    // Save assistant response to message logs
    chatMessages.push({ role: 'assistant', content: accumulatedResponse });
    
  } catch (err) {
    console.error("Gemini API stream error:", err);
    contentElement.classList.remove('streaming');
    contentElement.innerHTML = `
      <p style="color:var(--danger);font-weight:600;"><i data-lucide="alert-circle" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i> Error generating response</p>
      <p style="font-size:13px;color:var(--text-muted);">${err.message || 'Check your internet connection and API key in Settings.'}</p>
    `;
    // Remove failed user turn
    chatMessages.pop();
    lucide.createIcons();
  }
}

// ==========================================================================
// LINE-BY-LINE MARKDOWN PARSER
// ==========================================================================

function parseMarkdown(mdText) {
  const lines = mdText.split('\n');
  let html = '';
  let inList = false;
  let listType = ''; // 'ul' or 'ol'
  let inCodeBlock = false;
  let codeContent = '';
  
  for (let line of lines) {
    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre><code>${escapeHTML(codeContent)}</code></pre>`;
        codeContent = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }
    
    let processedLine = escapeHTML(line);
    
    // Inline text decorations
    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
    processedLine = processedLine.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Headers
    if (processedLine.startsWith('### ')) {
      html += `<h3>${processedLine.substring(4)}</h3>`;
      continue;
    } else if (processedLine.startsWith('## ')) {
      html += `<h2>${processedLine.substring(3)}</h2>`;
      continue;
    } else if (processedLine.startsWith('# ')) {
      html += `<h1>${processedLine.substring(2)}</h1>`;
      continue;
    }
    
    // Bullet list formatting
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) html += `</${listType}>`;
        html += '<ul>';
        inList = true;
        listType = 'ul';
      }
      let itemContent = escapeHTML(bulletMatch[2]);
      itemContent = itemContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      itemContent = itemContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
      itemContent = itemContent.replace(/`(.*?)`/g, '<code>$1</code>');
      html += `<li>${itemContent}</li>`;
      continue;
    }
    
    // Numbered list formatting
    const numMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) html += `</${listType}>`;
        html += '<ol>';
        inList = true;
        listType = 'ol';
      }
      let itemContent = escapeHTML(numMatch[2]);
      itemContent = itemContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      itemContent = itemContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
      itemContent = itemContent.replace(/`(.*?)`/g, '<code>$1</code>');
      html += `<li>${itemContent}</li>`;
      continue;
    }
    
    // Table parser (support simple markdown tables)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // check if it's separator line
      if (line.includes('---')) continue;
      
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length > 0) {
        // Render a basic row
        html += `<div style="display:flex;justify-content:space-between;padding:6px 12px;border-bottom:1px solid rgba(255,255,255,0.05);background-color:rgba(255,255,255,0.01);">
          ${cells.map(c => `<span style="font-size:13px;flex:1;">${c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>`).join('')}
        </div>`;
      }
      continue;
    }
    
    // Close active list structures if empty line
    if (inList && line.trim() === '') {
      html += `</${listType}>`;
      inList = false;
      listType = '';
      continue;
    }
    
    // Paragraph
    if (line.trim() !== '') {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = '';
      }
      html += `<p>${processedLine}</p>`;
    } else {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = '';
      }
    }
  }
  
  if (inList) html += `</${listType}>`;
  if (inCodeBlock) html += `<pre><code>${escapeHTML(codeContent)}</code></pre>`;
  
  return html;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// --- Parse Food Entry using Gemini API (supports Text & Photo) ---
async function parseFoodEntryWithGemini(textInput, base64Image, mimeType, sheetFoodsList) {
  if (!settings.apiKey || settings.apiKey.trim().length < 10) {
    throw new Error("Invalid or missing Gemini API Key. Please add it in Settings.");
  }
  
  // Convert sheetFoodsList to a compact CSV or JSON format for prompt context
  let sheetContext = "Food,Carb (gm),Protein (gm),Fat (gm),Calories,Unit\n";
  sheetFoodsList.forEach(f => {
    sheetContext += `${f.name},${f.carbs},${f.protein},${f.fat},${f.calories},${f.unit}\n`;
  });

  const systemInstruction = `You are a precise nutrition and macro calculator. Your job is to analyze the user's food log input (which may be a text description, a photo of the food, or both) and output a JSON array of the food items found.

Rules:
1. We have a reference database of foods from a Google Sheet with their macros. You must check this list first. If a food item matches (exact or fuzzy), you MUST use these exact macro ratios.
Here is the Google Sheet database (CSV format):
${sheetContext}

2. Scale the macros based on the quantity specified. 
   - If the unit in the sheet is empty or "1 gm", "1 gram", or similar cooked weights, the macros are listed per gram. For example, if Oats is 4.0 kcal/g and the user eats 50g, multiply by 50.
   - If the unit is "1 piece", "1 count", "1 slice", "1 scoop", "cup", etc., the macros are listed per that unit. For example, if Roti is 105.2 kcal and they eat 2, multiply by 2.
   - For items where the sheet has a specific weight unit (e.g. Almonds (weight) is per gram), match carefully.

3. If the food is NOT in the spreadsheet database, estimate its macros using your general nutrition knowledge (the internet). Mark the source as "Internet".
4. Calculate final macros: carbs (g), protein (g), fat (g), calories (kcal).
5. Your output must be a valid JSON array of objects representing the food items. Do not include markdown formatting or "json" wrap blocks. Return ONLY the raw JSON.

JSON Structure:
[
  {
    "name": "Food Item Name (e.g. 2 Roti or 100g Paneer)",
    "matchedFood": "Name of matched food from sheet, or null if from internet",
    "quantity": "Amount (e.g. 2 pieces, 100g, 1 scoop)",
    "source": "Sheet" or "Internet",
    "carbs": 36.0,
    "protein": 8.0,
    "fat": 4.0,
    "calories": 210.4
  }
]
`;

  const contents = [];
  const parts = [];
  
  if (textInput && textInput.trim()) {
    parts.push({ text: `User meal description: ${textInput}` });
  }
  
  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: base64Image
      }
    });
    if (!textInput || !textInput.trim()) {
      parts.push({ text: "Please identify and calculate the macros for the food items in this photo." });
    }
  }
  
  contents.push({
    role: 'user',
    parts: parts
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': settings.apiKey
    },
    body: JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned HTTP ${response.status}`);
  }

  const result = await response.json();
  const rawText = result.candidates[0].content.parts[0].text;
  
  try {
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", rawText);
    throw new Error("Failed to parse nutrition details. Please try again with clearer text or photo.");
  }
}
