// Auxiliary function to reset the temporal output
function resetTemporalOutput() {
    browser.storage.local.set({tempOutput: "empty"});
}

// Initialize the temporal output as empty
resetTemporalOutput();

// Everytime a window is closed we reset the temporal output as empty
browser.tabs.onRemoved.addListener(function (tabId, removedInfo) {
    resetTemporalOutput();
});

