chrome.commands.onCommand.addListener((command) => {
  console.log('🎹 Gissues: Commande reçue:', command);
  if (command === 'take-screenshot') {
    console.log('📸 Gissues: Déclenchement de la capture d\'écran');
    takeScreenshotAndShowModal();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'takeScreenshot') {
    takeScreenshotAndShowModal();
  }
  
  if (request.action === 'createGitHubIssue') {
    createGitHubIssue(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'openExtensionSettings') {
    chrome.tabs.create({
      url: 'chrome://extensions/?id=' + chrome.runtime.id
    });
  }

  if (request.action === 'reloadExtension') {
    console.log('🔄 Gissues: Rechargement de l\'extension...');
    chrome.runtime.reload();
  }
});

async function takeScreenshotAndShowModal() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }

    // Check if it's a restricted URL
    if (isRestrictedUrl(tab.url)) {
      console.warn('🚫 Gissues: URL restreinte détectée:', tab.url);
      
      let message = '❌ Impossible de faire une capture sur cette page.\n\n';
      
      if (tab.url === 'chrome://newtab/' || tab.url.includes('newtab')) {
        message += 'La page d\'accueil Chrome (nouvel onglet) est protégée.\n\n' +
                   '💡 Solution: Naviguez vers n\'importe quel site web et utilisez Gissues.';
      } else {
        message += 'Les pages chrome://, extensions et pages système sont protégées.\n\n' +
                   '💡 Solution: Ouvrez un site web normal (google.com, github.com, etc.).';
      }
      
      alert(message);
      return;
    }

    console.log('📸 Gissues: Capture de', tab.url);
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showFeedbackModal,
      args: [dataUrl]
    });

  } catch (error) {
    console.error('Error taking screenshot:', error);
    
    // Show user-friendly error message
    if (error.message.includes('chrome://')) {
      alert('❌ Impossible de faire une capture sur cette page.\n\n' +
            'Les pages Chrome internes (chrome://) sont protégées.\n\n' +
            '💡 Naviguez vers un site web pour utiliser Gissues.');
    } else if (error.message.includes('Cannot access')) {
      alert('❌ Accès refusé à cette page.\n\n' +
            'Certaines pages sont protégées par le navigateur.\n\n' +
            '💡 Essayez sur un site web normal.');
    } else {
      alert('❌ Erreur lors de la capture d\'écran.\n\n' + error.message);
    }
  }
}

function isRestrictedUrl(url) {
  if (!url) return true;
  
  const restrictedPrefixes = [
    'chrome://',
    'chrome-extension://',
    'moz-extension://',
    'edge://',
    'about:',
    'file://',
    'data:',
    'javascript:'
  ];
  
  // Allow Chrome's new tab page (it has a special chrome-search:// URL internally 
  // but appears as chrome://newtab/ or similar)
  if (url === 'chrome://newtab/' || url.startsWith('chrome-search://')) {
    return false; // Allow new tab page
  }
  
  return restrictedPrefixes.some(prefix => url.startsWith(prefix));
}


function showFeedbackModal(screenshotDataUrl) {
  console.log('📋 Gissues: Tentative d\'affichage de la modal');
  
  // Use existing modal or create new one
  if (!window.gissuesModal) {
    console.log('✨ Gissues: Création nouvelle modal');
    window.gissuesModal = new GissuesModal();
  } else {
    console.log('🔄 Gissues: Utilisation modal existante');
  }
  
  window.gissuesModal.show(screenshotDataUrl);
}

function showError(message) {
  console.error('Gissues Error:', message);
  alert(`Gissues Error: ${message}`);
}

async function createGitHubIssue(data) {
  const { title, body, screenshot, repoOwner, repoName, token } = data;
  
  try {
    let issueBody = body;
    let screenshotNote = '';
    
    if (screenshot) {
      try {
        const imageResponse = await uploadImageToGitHub(screenshot, repoOwner, repoName, token);
        issueBody += `\n\n![Screenshot](${imageResponse.content.download_url})`;
      } catch (uploadError) {
        console.warn('Screenshot upload failed, creating issue without image:', uploadError);
        screenshotNote = '\n\n> ⚠️ Screenshot capture failed to upload. Please attach manually if needed.';
        issueBody += screenshotNote;
      }
    }
    
    const issueResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        title,
        body: issueBody
      })
    });

    if (!issueResponse.ok) {
      const errorData = await issueResponse.json();
      throw new Error(errorData.message || 'Failed to create issue');
    }

    const issueData = await issueResponse.json();
    
    if (screenshotNote) {
      issueData._screenshotWarning = 'Issue created successfully but screenshot upload failed';
    }

    return issueData;
    
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    throw error;
  }
}

async function uploadImageToGitHub(dataUrl, owner, repo, token) {
  const base64Data = dataUrl.split(',')[1];
  const fileName = `screenshot-${Date.now()}.png`;
  
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/screenshots/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `Add screenshot for issue ${Date.now()}`,
        content: base64Data
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to upload screenshot`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Image upload failed:', error);
    
    if (error.message.includes('422')) {
      throw new Error('Repository does not accept file uploads. The screenshot will be skipped.');
    }
    
    throw error;
  }
}