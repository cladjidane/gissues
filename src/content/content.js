class GissuesModal {
  constructor() {
    this.isVisible = false;
    this.currentScreenshot = null;
    this.shadowRoot = null;
    this.init();
  }

  init() {
    this.createShadowDOM();
    this.setupEventListeners();
  }

  createShadowDOM() {
    this.container = document.createElement('div');
    this.container.id = 'gissues-modal-container';
    this.container.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
    `;
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    
    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .gissues-overlay { 
          position: fixed !important; top: 0 !important; left: 0 !important; 
          width: 100vw !important; height: 100vh !important; 
          background: rgba(0, 0, 0, 0.5) !important; z-index: 2147483647 !important; 
          display: none; align-items: center; justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          pointer-events: auto !important;
        }
        .gissues-overlay.show { display: flex; }
        .gissues-modal { 
          background: white !important; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
          max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; margin: 20px;
          position: relative !important; z-index: 2147483647 !important;
          pointer-events: auto !important;
        }
        .gissues-header { 
          display: flex; justify-content: space-between; align-items: center; 
          padding: 24px 24px 16px 24px; border-bottom: 1px solid #e5e7eb;
        }
        .gissues-header h2 { 
          font-size: 20px; font-weight: 700; color: #1f2937; margin: 0;
          display: flex; align-items: center;
        }
        .gissues-logo { 
          width: 32px; height: 32px; 
          background: linear-gradient(135deg, #6366F1, #8B5CF6); 
          border-radius: 8px; display: flex; align-items: center; justify-content: center; 
          margin-right: 12px; color: white; font-size: 16px;
        }
        .gissues-close { 
          font-size: 24px; color: #6b7280; cursor: pointer; 
          background: none; border: none; padding: 4px; line-height: 1;
        }
        .gissues-close:hover { color: #374151; }
        .gissues-content { padding: 24px; }
        .gissues-screenshot { 
          width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; 
          margin-bottom: 16px; max-height: 200px; object-fit: contain;
        }
        .gissues-form-group { margin-bottom: 16px; }
        .gissues-label { 
          display: block; font-size: 14px; margin-bottom: 6px; 
          font-weight: 500; color: #374151;
        }
        .gissues-input, .gissues-textarea { 
          width: 100%; padding: 8px 12px; border: 2px solid #e5e7eb; 
          border-radius: 6px; font-size: 14px; font-family: inherit;
          pointer-events: auto !important; position: relative !important;
        }
        .gissues-input:focus, .gissues-textarea:focus { 
          outline: none; border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .gissues-input.error { border-color: #ef4444; }
        .gissues-textarea { resize: vertical; min-height: 80px; }
        
        /* Voice Input Styles */
        .gissues-voice-container {
          margin-top: 12px;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .gissues-voice-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
        }
        
        .gissues-voice-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .gissues-voice-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .gissues-voice-btn.record {
          background: #ef4444;
          color: white;
        }
        
        .gissues-voice-btn.record:hover {
          background: #dc2626;
        }
        
        .gissues-voice-btn.recording {
          background: #dc2626;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .gissues-voice-btn.stop {
          background: #6b7280;
          color: white;
        }
        
        .gissues-voice-btn.processing {
          background: #3b82f6;
          color: white;
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .gissues-voice-status {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
        }
        
        .gissues-voice-duration {
          font-size: 12px;
          color: #3b82f6;
          font-weight: 500;
        }
        .gissues-metadata { 
          background: #f9fafb; padding: 12px; border-radius: 6px; 
          font-size: 12px; color: #6b7280; margin-bottom: 16px;
        }
        .gissues-metadata strong { color: #374151; }
        .gissues-actions { 
          display: flex; justify-content: flex-end; gap: 12px; 
          padding-top: 16px; border-top: 1px solid #e5e7eb;
        }
        .gissues-button { 
          padding: 10px 16px; border: none; border-radius: 6px; 
          font-size: 14px; font-weight: 500; cursor: pointer; 
          transition: background-color 0.2s;
        }
        .gissues-button.secondary { 
          background: #f3f4f6; color: #374151; 
        }
        .gissues-button.secondary:hover { background: #e5e7eb; }
        .gissues-button.primary { 
          background: #3b82f6; color: white; 
        }
        .gissues-button.primary:hover { background: #2563eb; }
        .gissues-button:disabled { 
          opacity: 0.5; cursor: not-allowed; 
        }
        .gissues-loading { 
          display: none; text-align: center; padding: 16px;
        }
        .gissues-loading.show { display: block; }
        .gissues-spinner { 
          display: inline-block; width: 32px; height: 32px; 
          border: 3px solid #e5e7eb; border-top: 3px solid #3b82f6; 
          border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .gissues-success { 
          text-align: center; padding: 32px; 
        }
        .gissues-success-icon { 
          width: 64px; height: 64px; background: #d1fae5; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 24px; color: #059669;
        }
        .gissues-footer {
          text-align: center; padding: 8px 16px; border-top: 1px solid #f3f4f6;
          font-size: 11px; color: #9ca3af;
        }
        .gissues-footer a {
          color: #6b7280; text-decoration: none;
        }
        .gissues-footer a:hover {
          color: #374151; text-decoration: underline;
        }
      </style>
      <div id="gissues-overlay" class="gissues-overlay">
        <div id="gissues-modal" class="gissues-modal">
          <div class="gissues-header">
            <h2>
              <div class="gissues-logo">🐛</div>
              Signaler un Bug Visuel
            </h2>
            <button id="gissues-close" class="gissues-close">&times;</button>
          </div>
          
          <div class="gissues-content">
            <div class="gissues-form-group">
              <img id="gissues-screenshot" class="gissues-screenshot" alt="Capture d'écran">
            </div>
            
            <div class="gissues-form-group">
              <label for="gissues-title" class="gissues-label">
                Titre du Bug *
              </label>
              <input 
                type="text" 
                id="gissues-title" 
                class="gissues-input"
                placeholder="Description brève du problème"
                required
              >
            </div>
            
            <div class="gissues-form-group">
              <label for="gissues-description" class="gissues-label">
                Description (optionnelle)
              </label>
              <textarea 
                id="gissues-description" 
                class="gissues-textarea"
                placeholder="Détails supplémentaires sur ce que vous attendiez vs ce que vous voyez..."
              ></textarea>
              
              <div class="gissues-voice-container">
                <div class="gissues-voice-header">
                  🎤 Dictée vocale
                </div>
                <div class="gissues-voice-controls">
                  <button id="gissues-voice-btn" class="gissues-voice-btn record" type="button">
                    🔴 Enregistrer
                  </button>
                  <span id="gissues-voice-status" class="gissues-voice-status">
                    Cliquez pour commencer l'enregistrement
                  </span>
                  <span id="gissues-voice-duration" class="gissues-voice-duration" style="display: none;">
                    0:00
                  </span>
                </div>
              </div>
            </div>
            
            <div id="gissues-metadata" class="gissues-metadata">
              <strong>Informations Techniques :</strong>
              <div id="gissues-tech-info"></div>
            </div>
            
            <div class="gissues-actions">
              <button id="gissues-cancel" class="gissues-button secondary">
                Annuler
              </button>
              <button id="gissues-submit" class="gissues-button primary">
                Créer l'Issue
              </button>
            </div>
            
            <div id="gissues-loading" class="gissues-loading">
              <div class="gissues-spinner"></div>
              <div>Création de l'issue GitHub...</div>
            </div>
          </div>
          
          <div class="gissues-footer">
            <a href="#" id="gissues-settings" title="Ouvrir les paramètres de l'extension">⚙️ Settings</a>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const closeBtn = this.shadowRoot.getElementById('gissues-close');
    const cancelBtn = this.shadowRoot.getElementById('gissues-cancel');
    const submitBtn = this.shadowRoot.getElementById('gissues-submit');
    const overlay = this.shadowRoot.getElementById('gissues-overlay');
    const titleInput = this.shadowRoot.getElementById('gissues-title');
    const settingsBtn = this.shadowRoot.getElementById('gissues-settings');

    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());
    submitBtn.addEventListener('click', () => this.submitReport());
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openExtensionSettings();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    titleInput.addEventListener('input', () => {
      submitBtn.disabled = !titleInput.value.trim();
    });

    // Focus trapping and keyboard handling
    this.shadowRoot.addEventListener('keydown', (e) => {
      if (!this.isVisible) return;
      
      if (e.key === 'Escape') {
        this.hide();
        return;
      }
      
      // Focus trapping with Tab
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      }
    });

    // Prevent page interactions when modal is open - AGGRESSIVE MODE
    const eventTypes = ['keydown', 'keyup', 'click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'focus', 'blur', 'input', 'change'];
    
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        if (this.isVisible && !this.container.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }, true);
    });
  }

  handleTabKey(e) {
    const focusableElements = this.shadowRoot.querySelectorAll(
      'input, textarea, button:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusableElements);
    const currentIndex = focusableArray.indexOf(this.shadowRoot.activeElement);
    
    if (e.shiftKey) {
      // Shift+Tab - go backwards
      if (currentIndex <= 0) {
        focusableArray[focusableArray.length - 1].focus();
      } else {
        focusableArray[currentIndex - 1].focus();
      }
    } else {
      // Tab - go forwards
      if (currentIndex >= focusableArray.length - 1) {
        focusableArray[0].focus();
      } else {
        focusableArray[currentIndex + 1].focus();
      }
    }
    
    e.preventDefault();
  }

  async show(screenshotDataUrl) {
    this.currentScreenshot = screenshotDataUrl;
    
    // Store currently focused element to restore later
    this.previousFocus = document.activeElement;
    
    // Recreate the container and shadow DOM if needed
    if (!this.container || !this.container.parentNode) {
      this.createShadowDOM();
      this.setupEventListeners();
    }
    
    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container);
    }

    const screenshot = this.shadowRoot.getElementById('gissues-screenshot');
    const overlay = this.shadowRoot.getElementById('gissues-overlay');
    const titleInput = this.shadowRoot.getElementById('gissues-title');
    const submitBtn = this.shadowRoot.getElementById('gissues-submit');

    if (!screenshot || !overlay || !titleInput || !submitBtn) {
      console.error('❌ Gissues: Éléments DOM manquants, recréation...');
      this.createShadowDOM();
      this.setupEventListeners();
      return this.show(screenshotDataUrl); // Retry
    }

    screenshot.src = screenshotDataUrl;
    
    // Generate URL prefix for title
    const urlPath = this.getUrlPath();
    titleInput.value = urlPath;
    titleInput.placeholder = `${urlPath}Décrivez le problème ici`;
    
    this.shadowRoot.getElementById('gissues-description').value = '';
    submitBtn.disabled = false; // Enable since we have a default title

    await this.updateTechnicalInfo();

    // Disable ALL page elements
    this.disablePageElements();
    
    // Block page scrolling and interactions
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';
    document.documentElement.style.pointerEvents = 'none';
    
    // Force container to be visible and interactive
    this.container.style.pointerEvents = 'auto';
    this.container.style.display = 'block';
    
    overlay.classList.add('show');
    this.isVisible = true;

    // Focus the title input after modal is visible
    setTimeout(() => {
      titleInput.focus();
      // Place cursor at the end of the prefix
      titleInput.setSelectionRange(titleInput.value.length, titleInput.value.length);
    }, 150);
  }

  hide() {
    console.log('🚪 Gissues: Fermeture de la modal');
    
    if (!this.shadowRoot) return;
    
    const overlay = this.shadowRoot.getElementById('gissues-overlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
    
    this.isVisible = false;
    this.currentScreenshot = null;
    
    // Restore ALL page elements
    this.restorePageElements();
    
    // Restore page scrolling and interactions
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.pointerEvents = '';
    document.documentElement.style.pointerEvents = '';
    
    if (this.container) {
      this.container.style.pointerEvents = 'none';
      this.container.style.display = 'none';
      
      // Keep container in DOM but hidden instead of removing it
      // This prevents the null reference issues
    }
    
    // Restore focus to previous element
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      setTimeout(() => {
        try {
          this.previousFocus.focus();
        } catch (e) {
          // Element might not be focusable anymore, ignore
        }
      }, 100);
    }
  }

  openExtensionSettings() {
    // Ouvre la page de gestion des extensions Chrome
    chrome.runtime.sendMessage({ 
      action: 'openExtensionSettings' 
    });
  }


  setupModalEventListeners() {
    const closeBtn = this.shadowRoot.getElementById('gissues-close');
    const cancelBtn = this.shadowRoot.getElementById('gissues-cancel');
    const submitBtn = this.shadowRoot.getElementById('gissues-submit');
    const settingsBtn = this.shadowRoot.getElementById('gissues-settings');
    const titleInput = this.shadowRoot.getElementById('gissues-title');

    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.hide());
    if (submitBtn) submitBtn.addEventListener('click', () => this.submitReport());
    if (settingsBtn) settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openExtensionSettings();
    });
    
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        if (submitBtn) submitBtn.disabled = !titleInput.value.trim();
      });
    }

    // Voice input functionality
    this.setupVoiceInput();
  }

  setupVoiceInput() {
    const voiceBtn = this.shadowRoot.getElementById('gissues-voice-btn');
    const voiceStatus = this.shadowRoot.getElementById('gissues-voice-status');
    const voiceDuration = this.shadowRoot.getElementById('gissues-voice-duration');
    const descriptionTextarea = this.shadowRoot.getElementById('gissues-description');
    
    if (!voiceBtn || !voiceStatus || !voiceDuration || !descriptionTextarea) return;

    // Check Web Speech API support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      voiceStatus.textContent = 'Reconnaissance vocale non supportée dans ce navigateur';
      voiceBtn.disabled = true;
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';
    
    // State variables
    this.isRecording = false;
    this.recordingStartTime = null;
    this.durationInterval = null;
    this.finalTranscript = '';
    
    // Event listeners
    voiceBtn.addEventListener('click', () => {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    });

    // Speech recognition events
    this.recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = this.finalTranscript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      this.finalTranscript = finalTranscript;
      
      // Update textarea with current transcription
      const currentText = descriptionTextarea.value;
      const newText = finalTranscript + interimTranscript;
      
      if (newText.trim() !== currentText.trim()) {
        descriptionTextarea.value = finalTranscript + interimTranscript;
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.stopRecording();
      voiceStatus.textContent = 'Erreur de reconnaissance: ' + event.error;
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
        // Restart if still in recording mode (for continuous recording)
        try {
          this.recognition.start();
        } catch (e) {
          console.log('Recognition restart failed:', e);
          this.stopRecording();
        }
      }
    };
  }

  startRecording() {
    const voiceBtn = this.shadowRoot.getElementById('gissues-voice-btn');
    const voiceStatus = this.shadowRoot.getElementById('gissues-voice-status');
    const voiceDuration = this.shadowRoot.getElementById('gissues-voice-duration');
    
    if (!this.recognition) return;

    try {
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.finalTranscript = '';
      
      // Update UI
      voiceBtn.className = 'gissues-voice-btn recording';
      voiceBtn.innerHTML = '⏹️ Arrêter';
      voiceStatus.textContent = 'Enregistrement en cours...';
      voiceDuration.style.display = 'inline';
      
      // Start duration timer
      this.durationInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        voiceDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }, 1000);
      
      // Start recognition
      this.recognition.start();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      this.stopRecording();
      voiceStatus.textContent = 'Erreur lors du démarrage de l\'enregistrement';
    }
  }

  stopRecording() {
    const voiceBtn = this.shadowRoot.getElementById('gissues-voice-btn');
    const voiceStatus = this.shadowRoot.getElementById('gissues-voice-status');
    const voiceDuration = this.shadowRoot.getElementById('gissues-voice-duration');
    const descriptionTextarea = this.shadowRoot.getElementById('gissues-description');
    
    this.isRecording = false;
    
    // Stop recognition
    if (this.recognition) {
      this.recognition.stop();
    }
    
    // Clear duration timer
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    
    // Update UI
    voiceBtn.className = 'gissues-voice-btn processing';
    voiceBtn.innerHTML = '⏳ Traitement...';
    voiceStatus.textContent = 'Finalisation de la transcription...';
    
    // Finalize transcription after a short delay
    setTimeout(() => {
      if (this.finalTranscript) {
        descriptionTextarea.value = this.finalTranscript.trim();
        voiceStatus.textContent = 'Transcription terminée avec succès';
      } else {
        voiceStatus.textContent = 'Aucun texte détecté';
      }
      
      // Reset button
      voiceBtn.className = 'gissues-voice-btn record';
      voiceBtn.innerHTML = '🔴 Enregistrer';
      voiceDuration.style.display = 'none';
      voiceDuration.textContent = '0:00';
      
      // Reset for next recording
      this.finalTranscript = '';
    }, 1000);
  }

  disablePageElements() {
    // Store original inert states and disable all page elements
    this.originalInertStates = new Map();
    
    // Get all elements except our container
    const allElements = document.body.querySelectorAll('*:not(#gissues-modal-container):not(#gissues-modal-container *)');
    
    allElements.forEach(element => {
      // Skip if it's our container or inside it
      if (element.id === 'gissues-modal-container' || element.closest('#gissues-modal-container')) {
        return;
      }
      
      // Store original inert state
      this.originalInertStates.set(element, element.inert);
      
      // Make element inert (disables all interactions)
      element.inert = true;
      
      // Also disable pointer events as backup
      if (!element.style.pointerEvents) {
        element.style.pointerEvents = 'none';
        element.setAttribute('data-gissues-disabled', 'true');
      }
    });
    
    // Also disable body level events
    document.body.setAttribute('data-gissues-modal-active', 'true');
  }

  restorePageElements() {
    if (!this.originalInertStates) return;
    
    // Restore all elements
    this.originalInertStates.forEach((originalInert, element) => {
      element.inert = originalInert;
      
      if (element.getAttribute('data-gissues-disabled')) {
        element.style.pointerEvents = '';
        element.removeAttribute('data-gissues-disabled');
      }
    });
    
    // Clear stored states
    this.originalInertStates.clear();
    this.originalInertStates = null;
    
    // Remove body attribute
    document.body.removeAttribute('data-gissues-modal-active');
  }

  getUrlPath() {
    const url = new URL(window.location.href);
    let path = url.pathname;
    
    // Add hash if it exists (for SPA routes) but ignore query parameters
    if (url.hash && url.hash !== '#') {
      // Only keep the hash path part, not query params in hash
      const hashPath = url.hash.split('?')[0];
      if (hashPath !== '#') {
        path += hashPath;
      }
    }
    
    // If path is just '/', use the hostname instead
    if (path === '/') {
      path = url.hostname;
    }
    
    return `[${path}] `;
  }

  async updateTechnicalInfo() {
    const techInfo = this.shadowRoot.getElementById('gissues-tech-info');
    const info = await this.collectMetadata();
    
    techInfo.innerHTML = `
      <div><strong>URL:</strong> ${info.url}</div>
      <div><strong>Browser:</strong> ${info.userAgent}</div>
      <div><strong>Screen:</strong> ${info.screenSize}</div>
      <div><strong>Viewport:</strong> ${info.viewportSize}</div>
      ${info.consoleErrors.length > 0 ? `<div><strong>Console Errors:</strong> ${info.consoleErrors.length} found</div>` : ''}
    `;
  }

  async collectMetadata() {
    const consoleErrors = window.gissuesConsoleErrors || [];
    
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
      consoleErrors: consoleErrors
    };
  }

  async submitReport() {
    const title = this.shadowRoot.getElementById('gissues-title').value.trim();
    const description = this.shadowRoot.getElementById('gissues-description').value.trim();
    
    if (!title) {
      alert('Please enter a title for the bug report.');
      return;
    }

    this.showLoading(true);

    try {
      const settings = await this.getSettings();
      if (!settings.githubToken || !settings.defaultRepo) {
        throw new Error('GitHub settings not configured. Please set up your token and repository in the extension popup.');
      }

      const [repoOwner, repoName] = settings.defaultRepo.split('/');
      const metadata = await this.collectMetadata();
      
      let issueBody = description || 'Visual bug reported via Gissues extension.';
      issueBody += '\n\n## Technical Information\n';
      issueBody += `- **URL**: ${metadata.url}\n`;
      issueBody += `- **User Agent**: ${metadata.userAgent}\n`;
      issueBody += `- **Screen Resolution**: ${metadata.screenSize}\n`;
      issueBody += `- **Viewport Size**: ${metadata.viewportSize}\n`;
      issueBody += `- **Timestamp**: ${metadata.timestamp}\n`;
      
      if (metadata.consoleErrors.length > 0) {
        issueBody += `\n## Console Errors (${metadata.consoleErrors.length})\n`;
        issueBody += '```\n' + metadata.consoleErrors.slice(0, 10).join('\n') + '\n```\n';
      }

      const response = await chrome.runtime.sendMessage({
        action: 'createGitHubIssue',
        data: {
          title,
          body: issueBody,
          screenshot: this.currentScreenshot,
          repoOwner,
          repoName,
          token: settings.githubToken
        }
      });

      if (response.success) {
        this.showSuccess(response.data.html_url);
      } else {
        throw new Error(response.error || 'Failed to create issue');
      }

    } catch (error) {
      console.error('Error submitting report:', error);
      alert(`Error: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const loading = this.shadowRoot.getElementById('gissues-loading');
    const submitBtn = this.shadowRoot.getElementById('gissues-submit');
    
    if (show) {
      loading.classList.add('show');
      submitBtn.disabled = true;
    } else {
      loading.classList.remove('show');
      submitBtn.disabled = false;
    }
  }

  showSuccess(issueUrl) {
    const successHtml = `
      <div class="gissues-success">
        <div class="gissues-success-icon">✓</div>
        <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">
          Rapport de Bug Créé avec Succès !
        </h3>
        <p style="color: #6b7280; margin-bottom: 20px;">
          Votre issue a été créée avec la capture d'écran et les détails techniques.
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="${issueUrl}" target="_blank" 
             class="gissues-button primary" 
             style="text-decoration: none; text-align: center; display: block;">
            Voir sur GitHub →
          </a>
          <button id="gissues-close-success" class="gissues-button secondary">
            Fermer
          </button>
        </div>
      </div>
    `;
    
    const modalContent = this.shadowRoot.querySelector('#gissues-modal');
    modalContent.innerHTML = successHtml;
    
    // Add close handler
    this.shadowRoot.getElementById('gissues-close-success').addEventListener('click', () => this.hide());
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      if (this.isVisible) this.hide();
    }, 10000);
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['githubToken', 'defaultRepo'], (result) => {
        resolve(result);
      });
    });
  }
}

console.log('🚀 Gissues: Content script chargé');

if (!window.gissuesModal) {
  console.log('✨ Gissues: Création de GissuesModal');
  window.gissuesModal = new GissuesModal();
} else {
  console.log('♻️ Gissues: GissuesModal existe déjà');
}

window.gissuesConsoleErrors = [];
const originalConsoleError = console.error;
console.error = function(...args) {
  window.gissuesConsoleErrors.push(args.join(' '));
  if (window.gissuesConsoleErrors.length > 50) {
    window.gissuesConsoleErrors = window.gissuesConsoleErrors.slice(-25);
  }
  originalConsoleError.apply(console, arguments);
};