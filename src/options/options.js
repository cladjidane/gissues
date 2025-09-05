document.addEventListener('DOMContentLoaded', async () => {
  const githubForm = document.getElementById('githubForm');
  const domainForm = document.getElementById('domainForm');
  const githubTokenInput = document.getElementById('githubToken');
  const defaultRepoInput = document.getElementById('defaultRepo');
  const domainNameInput = document.getElementById('domainName');
  const domainRepoInput = document.getElementById('domainRepo');
  const testConnectionBtn = document.getElementById('testConnection');
  const takeScreenshotBtn = document.getElementById('takeScreenshotTest');
  const exportBtn = document.getElementById('exportSettings');
  const clearDataBtn = document.getElementById('clearAllData');
  
  const githubStatusDiv = document.getElementById('githubStatus');
  const domainStatusDiv = document.getElementById('domainStatus');
  const dataStatusDiv = document.getElementById('dataStatus');
  const domainMappingsDiv = document.getElementById('domainMappings');

  await loadAllSettings();

  githubForm.addEventListener('submit', handleSaveGithubSettings);
  domainForm.addEventListener('submit', handleAddDomainMapping);
  testConnectionBtn.addEventListener('click', handleTestConnection);
  takeScreenshotBtn.addEventListener('click', handleTakeScreenshot);
  exportBtn.addEventListener('click', handleExportSettings);
  clearDataBtn.addEventListener('click', handleClearAllData);

  async function loadAllSettings() {
    try {
      const settings = await chrome.storage.sync.get(['githubToken', 'defaultRepo', 'domainMappings']);
      
      if (settings.githubToken) {
        githubTokenInput.value = settings.githubToken;
      }
      
      if (settings.defaultRepo) {
        defaultRepoInput.value = settings.defaultRepo;
      }
      
      if (settings.domainMappings) {
        renderDomainMappings(settings.domainMappings);
      }
    } catch (error) {
      showStatus(githubStatusDiv, 'Error loading settings: ' + error.message, 'error');
    }
  }

  async function handleSaveGithubSettings(e) {
    e.preventDefault();
    
    const token = githubTokenInput.value.trim();
    const repo = defaultRepoInput.value.trim();
    
    if (!token) {
      showStatus(githubStatusDiv, 'Please enter a GitHub token', 'error');
      return;
    }
    
    if (!repo || !repo.includes('/')) {
      showStatus(githubStatusDiv, 'Please enter a valid repository (owner/repo-name)', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({
        githubToken: token,
        defaultRepo: repo
      });
      
      showStatus(githubStatusDiv, 'GitHub settings saved successfully!', 'success');
      
    } catch (error) {
      showStatus(githubStatusDiv, 'Error saving settings: ' + error.message, 'error');
    }
  }

  async function handleTestConnection() {
    const token = githubTokenInput.value.trim();
    const repo = defaultRepoInput.value.trim();
    
    if (!token || !repo) {
      showStatus(githubStatusDiv, 'Please enter both token and repository', 'error');
      return;
    }

    const originalText = testConnectionBtn.textContent;
    testConnectionBtn.disabled = true;
    testConnectionBtn.textContent = 'Testing...';
    
    try {
      const [owner, repoName] = repo.split('/');
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const repoData = await response.json();
        showStatus(githubStatusDiv, `✓ Successfully connected to ${repoData.full_name}`, 'success');
      } else {
        const errorData = await response.json();
        let errorMessage = 'Connection failed';
        
        if (response.status === 401) {
          errorMessage = 'Invalid GitHub token';
        } else if (response.status === 404) {
          errorMessage = 'Repository not found or no access';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        showStatus(githubStatusDiv, errorMessage, 'error');
      }
      
    } catch (error) {
      showStatus(githubStatusDiv, 'Connection error: ' + error.message, 'error');
    } finally {
      testConnectionBtn.disabled = false;
      testConnectionBtn.textContent = originalText;
    }
  }

  async function handleAddDomainMapping(e) {
    e.preventDefault();
    
    const domain = domainNameInput.value.trim().toLowerCase();
    const repo = domainRepoInput.value.trim();
    
    if (!domain || !repo) {
      showStatus(domainStatusDiv, 'Please enter both domain and repository', 'error');
      return;
    }
    
    if (!repo.includes('/')) {
      showStatus(domainStatusDiv, 'Repository format should be: owner/repo-name', 'error');
      return;
    }

    try {
      const settings = await chrome.storage.sync.get(['domainMappings']);
      const mappings = settings.domainMappings || {};
      
      mappings[domain] = repo;
      
      await chrome.storage.sync.set({ domainMappings: mappings });
      
      domainNameInput.value = '';
      domainRepoInput.value = '';
      
      renderDomainMappings(mappings);
      showStatus(domainStatusDiv, `Domain mapping added: ${domain} → ${repo}`, 'success');
      
    } catch (error) {
      showStatus(domainStatusDiv, 'Error adding mapping: ' + error.message, 'error');
    }
  }

  async function removeDomainMapping(domain) {
    try {
      const settings = await chrome.storage.sync.get(['domainMappings']);
      const mappings = settings.domainMappings || {};
      
      delete mappings[domain];
      
      await chrome.storage.sync.set({ domainMappings: mappings });
      renderDomainMappings(mappings);
      
      showStatus(domainStatusDiv, `Removed mapping for ${domain}`, 'success');
      
    } catch (error) {
      showStatus(domainStatusDiv, 'Error removing mapping: ' + error.message, 'error');
    }
  }

  function renderDomainMappings(mappings) {
    if (!mappings || Object.keys(mappings).length === 0) {
      domainMappingsDiv.innerHTML = '<p style="color: #6b7280; font-style: italic;">No domain mappings configured</p>';
      return;
    }
    
    const html = Object.entries(mappings).map(([domain, repo]) => `
      <div class="domain-item">
        <div>
          <strong>${domain}</strong> → ${repo}
        </div>
        <button type="button" class="btn-danger" onclick="removeDomainMapping('${domain}')">
          Remove
        </button>
      </div>
    `).join('');
    
    domainMappingsDiv.innerHTML = html;
  }
  
  window.removeDomainMapping = removeDomainMapping;

  async function handleTakeScreenshot() {
    try {
      await chrome.runtime.sendMessage({ action: 'takeScreenshot' });
      showStatus(dataStatusDiv, 'Screenshot initiated! Check the current tab.', 'success');
    } catch (error) {
      showStatus(dataStatusDiv, 'Error taking screenshot: ' + error.message, 'error');
    }
  }

  async function handleExportSettings() {
    try {
      const settings = await chrome.storage.sync.get(null);
      
      const exportData = {
        ...settings,
        githubToken: settings.githubToken ? '***HIDDEN***' : undefined,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gissues-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showStatus(dataStatusDiv, 'Settings exported successfully', 'success');
      
    } catch (error) {
      showStatus(dataStatusDiv, 'Error exporting settings: ' + error.message, 'error');
    }
  }

  async function handleClearAllData() {
    if (!confirm('Are you sure you want to clear all Gissues data? This action cannot be undone.')) {
      return;
    }
    
    try {
      await chrome.storage.sync.clear();
      
      githubTokenInput.value = '';
      defaultRepoInput.value = '';
      domainNameInput.value = '';
      domainRepoInput.value = '';
      
      renderDomainMappings({});
      
      showStatus(dataStatusDiv, 'All data cleared successfully', 'success');
      
    } catch (error) {
      showStatus(dataStatusDiv, 'Error clearing data: ' + error.message, 'error');
    }
  }

  function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status ${type}`;
    element.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        element.style.display = 'none';
      }, 3000);
    }
  }
});