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
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    
    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .gissues-overlay { 
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
          background: rgba(0, 0, 0, 0.5); z-index: 999999; 
          display: none; align-items: center; justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .gissues-overlay.show { display: flex; }
        .gissues-modal { 
          background: white; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); 
          max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; margin: 20px;
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
        }
        .gissues-input:focus, .gissues-textarea:focus { 
          outline: none; border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .gissues-input.error { border-color: #ef4444; }
        .gissues-textarea { resize: vertical; min-height: 80px; }
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

    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());
    submitBtn.addEventListener('click', () => this.submitReport());
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    titleInput.addEventListener('input', () => {
      submitBtn.disabled = !titleInput.value.trim();
    });

    document.addEventListener('keydown', (e) => {
      if (this.isVisible && e.key === 'Escape') {
        this.hide();
      }
    });
  }

  async show(screenshotDataUrl) {
    this.currentScreenshot = screenshotDataUrl;
    
    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container);
    }

    const screenshot = this.shadowRoot.getElementById('gissues-screenshot');
    const overlay = this.shadowRoot.getElementById('gissues-overlay');
    const titleInput = this.shadowRoot.getElementById('gissues-title');
    const submitBtn = this.shadowRoot.getElementById('gissues-submit');

    screenshot.src = screenshotDataUrl;
    titleInput.value = '';
    this.shadowRoot.getElementById('gissues-description').value = '';
    submitBtn.disabled = true;

    await this.updateTechnicalInfo();

    overlay.classList.add('show');
    this.isVisible = true;

    setTimeout(() => titleInput.focus(), 100);
  }

  hide() {
    const overlay = this.shadowRoot.getElementById('gissues-overlay');
    overlay.classList.remove('show');
    this.isVisible = false;
    this.currentScreenshot = null;
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

if (!window.gissuesModal) {
  window.gissuesModal = new GissuesModal();
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