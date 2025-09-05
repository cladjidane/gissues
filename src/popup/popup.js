document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const githubTokenInput = document.getElementById('githubToken');
  const defaultRepoInput = document.getElementById('defaultRepo');
  const testConnectionBtn = document.getElementById('testConnection');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const takeScreenshotBtn = document.getElementById('takeScreenshotNow');
  const statusDiv = document.getElementById('status');

  await loadSettings();

  form.addEventListener('submit', handleSaveSettings);
  testConnectionBtn.addEventListener('click', handleTestConnection);
  takeScreenshotBtn.addEventListener('click', handleTakeScreenshot);

  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(['githubToken', 'defaultRepo']);
      
      if (settings.githubToken) {
        githubTokenInput.value = settings.githubToken;
      }
      
      if (settings.defaultRepo) {
        defaultRepoInput.value = settings.defaultRepo;
      }
    } catch (error) {
      showStatus('Error loading settings: ' + error.message, 'error');
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    
    const token = githubTokenInput.value.trim();
    const repo = defaultRepoInput.value.trim();
    
    if (!token) {
      showStatus('Please enter a GitHub token', 'error');
      return;
    }
    
    if (!repo || !repo.includes('/')) {
      showStatus('Please enter a valid repository (owner/repo-name)', 'error');
      return;
    }

    try {
      saveSettingsBtn.disabled = true;
      saveSettingsBtn.textContent = 'Saving...';
      
      await chrome.storage.sync.set({
        githubToken: token,
        defaultRepo: repo
      });
      
      showStatus('Settings saved successfully!', 'success');
      
      setTimeout(() => {
        hideStatus();
      }, 2000);
      
    } catch (error) {
      showStatus('Error saving settings: ' + error.message, 'error');
    } finally {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Save Settings';
    }
  }

  async function handleTestConnection() {
    const token = githubTokenInput.value.trim();
    const repo = defaultRepoInput.value.trim();
    
    if (!token) {
      showStatus('Please enter a GitHub token', 'error');
      return;
    }
    
    if (!repo || !repo.includes('/')) {
      showStatus('Please enter a valid repository', 'error');
      return;
    }

    try {
      testConnectionBtn.disabled = true;
      testConnectionBtn.textContent = 'Testing...';
      
      const [owner, repoName] = repo.split('/');
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const repoData = await response.json();
        showStatus(`✓ Connected to ${repoData.full_name}`, 'success');
        
        const issuesResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
          method: 'GET',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (issuesResponse.ok) {
          showStatus(`✓ Connected to ${repoData.full_name} with issue creation permissions`, 'success');
        } else {
          showStatus(`⚠ Connected to repository but no issue creation permissions`, 'error');
        }
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
        
        showStatus(errorMessage, 'error');
      }
      
    } catch (error) {
      showStatus('Connection error: ' + error.message, 'error');
    } finally {
      testConnectionBtn.disabled = false;
      testConnectionBtn.textContent = 'Test Connection';
    }
  }

  async function handleTakeScreenshot() {
    try {
      const token = githubTokenInput.value.trim();
      const repo = defaultRepoInput.value.trim();
      
      if (!token || !repo) {
        showStatus('Please configure GitHub settings first', 'error');
        return;
      }
      
      takeScreenshotBtn.disabled = true;
      takeScreenshotBtn.textContent = '📸 Taking Screenshot...';
      
      await chrome.runtime.sendMessage({ action: 'takeScreenshot' });
      
      window.close();
      
    } catch (error) {
      showStatus('Error taking screenshot: ' + error.message, 'error');
      takeScreenshotBtn.disabled = false;
      takeScreenshotBtn.textContent = '📸 Take Screenshot Now';
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }

  function hideStatus() {
    statusDiv.style.display = 'none';
  }
});