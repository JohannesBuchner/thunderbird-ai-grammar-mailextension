window.browser = window.browser.extension.getBackgroundPage().browser;

function saveOptions(e) {
    browser.storage.local.set({server: document.getElementById("server").value});
    restoreOptions();
}

function restoreOptions() {
    var storageItem = browser.storage.local.get("server");
    storageItem.then((res) => {
    	document.querySelector("#managed-server").innerText = res.server;
    });    
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
