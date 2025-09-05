document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const githubTokenInput = document.getElementById('githubToken');
  const defaultRepoInput = document.getElementById('defaultRepo');
  const testConnectionBtn = document.getElementById('testConnection');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const takeScreenshotBtn = document.getElementById('takeScreenshotNow');
  const statusDiv = document.getElementById('status');

  await loadSettings();
  await loadVersionInfo();

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
      showStatus('Erreur de chargement des paramètres : ' + error.message, 'error');
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    
    const token = githubTokenInput.value.trim();
    const repo = defaultRepoInput.value.trim();
    
    if (!token) {
      showStatus('Veuillez saisir un token GitHub', 'error');
      return;
    }
    
    if (!repo || !repo.includes('/')) {
      showStatus('Veuillez saisir un dépôt valide (propriétaire/nom-depot)', 'error');
      return;
    }

    try {
      saveSettingsBtn.disabled = true;
      saveSettingsBtn.textContent = 'Sauvegarde...';
      
      await chrome.storage.sync.set({
        githubToken: token,
        defaultRepo: repo
      });
      
      showStatus('Paramètres sauvegardés avec succès !', 'success');
      
      setTimeout(() => {
        hideStatus();
      }, 2000);
      
    } catch (error) {
      showStatus('Erreur de sauvegarde : ' + error.message, 'error');
    } finally {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Sauvegarder';
    }
  }

  async function handleTestConnection() {
    const token = githubTokenInput.value.trim();
    const repo = defaultRepoInput.value.trim();
    
    if (!token) {
      showStatus('Veuillez saisir un token GitHub', 'error');
      return;
    }
    
    if (!repo || !repo.includes('/')) {
      showStatus('Veuillez saisir un dépôt valide', 'error');
      return;
    }

    try {
      testConnectionBtn.disabled = true;
      testConnectionBtn.textContent = 'Test...';
      
      const [owner, repoName] = repo.split('/');
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const repoData = await response.json();
        showStatus(`✓ Connecté à ${repoData.full_name}`, 'success');
        
        const issuesResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
          method: 'GET',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (issuesResponse.ok) {
          showStatus(`✓ Connecté à ${repoData.full_name} avec permissions de création d'issues`, 'success');
        } else {
          showStatus(`⚠ Connecté au dépôt mais sans permissions de création d'issues`, 'error');
        }
      } else {
        const errorData = await response.json();
        let errorMessage = 'Échec de la connexion';
        
        if (response.status === 401) {
          errorMessage = 'Token GitHub invalide';
        } else if (response.status === 404) {
          errorMessage = 'Dépôt introuvable ou pas d\'accès';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        showStatus(errorMessage, 'error');
      }
      
    } catch (error) {
      showStatus('Erreur de connexion : ' + error.message, 'error');
    } finally {
      testConnectionBtn.disabled = false;
      testConnectionBtn.textContent = 'Tester la Connexion';
    }
  }

  async function handleTakeScreenshot() {
    try {
      const token = githubTokenInput.value.trim();
      const repo = defaultRepoInput.value.trim();
      
      if (!token || !repo) {
        showStatus('Veuillez configurer GitHub d\'abord', 'error');
        return;
      }
      
      takeScreenshotBtn.disabled = true;
      takeScreenshotBtn.textContent = '📸 Capture en cours...';
      
      await chrome.runtime.sendMessage({ action: 'takeScreenshot' });
      
      window.close();
      
    } catch (error) {
      showStatus('Erreur de capture : ' + error.message, 'error');
      takeScreenshotBtn.disabled = false;
      takeScreenshotBtn.textContent = '📸 Prendre Capture Maintenant';
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

  async function loadVersionInfo() {
    try {
      const manifest = chrome.runtime.getManifest();
      const version = manifest.version;
      const versionSpan = document.getElementById('version-info');
      
      if (versionSpan) {
        versionSpan.textContent = `v${version}`;
        versionSpan.title = `Gissues version ${version}`;
      }
    } catch (error) {
      console.error('Error loading version info:', error);
    }
  }
});