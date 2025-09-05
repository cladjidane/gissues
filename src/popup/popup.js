document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const githubTokenInput = document.getElementById('githubToken');
  const defaultRepoInput = document.getElementById('defaultRepo');
  const testConnectionBtn = document.getElementById('testConnection');
  const customizeShortcutBtn = document.getElementById('customize-shortcut');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const takeScreenshotBtn = document.getElementById('takeScreenshotNow');
  const statusDiv = document.getElementById('status');
  const extensionRefreshBtn = document.getElementById('extension-refresh');

  await loadSettings();
  await loadVersionInfo();
  updateShortcutDisplay();

  form.addEventListener('submit', handleSaveSettings);
  testConnectionBtn.addEventListener('click', handleTestConnection);
  takeScreenshotBtn.addEventListener('click', handleTakeScreenshot);
  extensionRefreshBtn.addEventListener('click', handleExtensionRefresh);
  customizeShortcutBtn.addEventListener('click', handleCustomizeShortcut);

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
      
      console.log('🔍 Debug version info:', { 
        manifest: !!manifest, 
        version, 
        versionSpan: !!versionSpan 
      });
      
      if (versionSpan) {
        versionSpan.textContent = `v${version}`;
        versionSpan.title = `Gissues version ${version}`;
      } else {
        console.warn('Element version-info not found');
      }
    } catch (error) {
      console.error('Error loading version info:', error);
    }
  }

  function updateShortcutDisplay() {
    const shortcutDisplay = document.getElementById('shortcut-display');
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (shortcutDisplay && isMac) {
      shortcutDisplay.innerHTML = `
        <span class="shortcut-key">⌥</span> + 
        <span class="shortcut-key">Shift</span> + 
        <span class="shortcut-key">G</span>
      `;
    }
  }

  function handleExtensionRefresh(e) {
    e.preventDefault();
    
    // Affiche un indicateur de rechargement
    const refreshBtn = document.getElementById('extension-refresh');
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '🔄 Reloading...';
    refreshBtn.style.color = '#3b82f6';
    
    // Envoie le message pour recharger l'extension
    chrome.runtime.sendMessage({ action: 'reloadExtension' });
    
    // Ferme le popup après un court délai
    setTimeout(() => {
      window.close();
    }, 500);
  }

  function handleCustomizeShortcut(e) {
    e.preventDefault();
    
    // Ouvre la page des raccourcis Chrome
    chrome.tabs.create({
      url: 'chrome://extensions/shortcuts'
    });
    
    // Affiche un message d'aide
    const statusEl = document.getElementById('shortcut-status');
    statusEl.innerHTML = '<span style="color: #059669;">📄 Page des raccourcis ouverte !</span>';
    statusEl.style.display = 'block';
    
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
    
    window.close();
  }

  // Diagnostic du raccourci au chargement
  checkShortcutStatus();

  async function checkShortcutStatus() {
    try {
      const commands = await chrome.commands.getAll();
      const takeScreenshotCommand = commands.find(cmd => cmd.name === 'take-screenshot');
      
      const statusEl = document.getElementById('shortcut-status');
      
      if (takeScreenshotCommand && takeScreenshotCommand.shortcut) {
        // Raccourci configuré
        statusEl.innerHTML = `✅ Raccourci actif: <strong>${takeScreenshotCommand.shortcut}</strong>`;
        statusEl.style.color = '#059669';
      } else {
        // Pas de raccourci configuré
        statusEl.innerHTML = '⚠️ <a href="#" id="fix-shortcut" style="color: #f59e0b;">Raccourci non configuré - Cliquez pour corriger</a>';
        statusEl.style.color = '#f59e0b';
        
        // Handler pour corriger le raccourci
        statusEl.querySelector('#fix-shortcut').addEventListener('click', (e) => {
          e.preventDefault();
          handleCustomizeShortcut(e);
        });
      }
      
      statusEl.style.display = 'block';
      
    } catch (error) {
      console.error('Error checking shortcut status:', error);
    }
  }
});