// Toggle overlay when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: "toggleOverlay" }).catch(() => {
        console.log("Content script not ready. Please refresh the page.");
    });
});

// Relay fetch requests from content script to bypass CORS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchData") {
        const API_URL = request.useNgrok
            ? 'http://54.206.105.0:5000/search'   // AWS EC2 public IP
            : 'http://localhost:5000/search';

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '1'
            },
            body: JSON.stringify({ keyword: request.keyword })
        })
        .then(res => res.text())
        .then(raw => {
            const data = JSON.parse(raw);
            sendResponse({ success: true, data: data });
        })
        .catch(err => sendResponse({ success: false, error: err.message }));

        return true;
    }
});