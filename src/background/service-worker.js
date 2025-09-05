chrome.commands.onCommand.addListener((command) => {
  if (command === 'take-screenshot') {
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
});

async function takeScreenshotAndShowModal() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }

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
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showError,
        args: ['Failed to take screenshot. Please try again.']
      });
    } catch (e) {
      console.error('Failed to show error message:', e);
    }
  }
}

function showFeedbackModal(screenshotDataUrl) {
  if (window.gissuesModal) {
    window.gissuesModal.show(screenshotDataUrl);
  }
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