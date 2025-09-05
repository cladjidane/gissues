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
      <link href="https://cdn.tailwindcss.com/3.3.0/tailwind.min.css" rel="stylesheet">
      <div id="gissues-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-[999999] hidden items-center justify-center">
        <div id="gissues-modal" class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 text-white text-lg">🐛</div>
                <h2 class="text-xl font-bold text-gray-800">Report Visual Bug</h2>
              </div>
              <button id="gissues-close" class="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            
            <div class="mb-4">
              <img id="gissues-screenshot" class="w-full rounded border" alt="Screenshot">
            </div>
            
            <div class="space-y-4">
              <div>
                <label for="gissues-title" class="block text-sm font-medium text-gray-700 mb-1">
                  Bug Title *
                </label>
                <input 
                  type="text" 
                  id="gissues-title" 
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the issue"
                  required
                >
              </div>
              
              <div>
                <label for="gissues-description" class="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea 
                  id="gissues-description" 
                  rows="4" 
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details about what you expected vs what you see..."
                ></textarea>
              </div>
              
              <div id="gissues-metadata" class="bg-gray-50 p-3 rounded text-sm text-gray-600">
                <strong>Technical Info:</strong>
                <div id="gissues-tech-info"></div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button id="gissues-cancel" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button id="gissues-submit" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                Create Issue
              </button>
            </div>
            
            <div id="gissues-loading" class="hidden text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div class="mt-2 text-gray-600">Creating GitHub issue...</div>
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

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    this.isVisible = true;

    setTimeout(() => titleInput.focus(), 100);
  }

  hide() {
    const overlay = this.shadowRoot.getElementById('gissues-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
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
      loading.classList.remove('hidden');
      submitBtn.disabled = true;
    } else {
      loading.classList.add('hidden');
      submitBtn.disabled = false;
    }
  }

  showSuccess(issueUrl) {
    // Replace alert with elegant success notification
    const successHtml = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div class="text-green-600 text-2xl">✓</div>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">Bug Report Created Successfully!</h3>
        <p class="text-gray-600 mb-4">Your issue has been created with screenshot and technical details.</p>
        <div class="space-y-3">
          <a href="${issueUrl}" target="_blank" class="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
            View on GitHub →
          </a>
          <button id="gissues-close-success" class="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;
    
    const modalContent = this.shadowRoot.querySelector('#gissues-modal');
    modalContent.innerHTML = `<div class="p-6">${successHtml}</div>`;
    
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