window.browser = window.browser.extension.getBackgroundPage().browser;

function saveOptions(e) {
    browser.storage.local.set({
        server: document.getElementById("server").value,
        prompt: document.getElementById("prompt").value
    });
    restoreOptions();
}

function restoreOptions() {
    var storageItem = browser.storage.local.get("server");
    storageItem.then((res) => {
        server_name = res.server;
        if (typeof server_name === "undefined") {
           saveOptions();
        } else {
    	   document.querySelector("#managed-server").innerText = server_name;
           document.querySelector("#server").value = server_name;
           browser.storage.local.get("prompt").then((res) => {
               document.querySelector("#prompt").value = res.prompt;
           });
    	}
    });
}

function testServer(e) {
    var storageItem = browser.storage.local.get("server");
    storageItem.then((res) => {
        server_name = res.server;
        const url_text = res.server.replace(/\/*$/, "") + "/api/generate";
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', url_text, true);
        console.log('requesting to: ' + url_text);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        var data = JSON.stringify({
           "model": "llama3",
           "prompt": "Respond with 'it is working!'.",
          "stream": false
        });
        document.querySelector("#resultText").innerText = "";
        document.querySelector("#resultStatus").innerText = "requesting...";
        // Handling received message
        xhttp.onreadystatechange = (e) => {
            document.querySelector("#resultStatus").innerText = xhttp.status + " " + xhttp.statusText;
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                document.querySelector("#resultText").innerText = JSON.parse(xhttp.responseText)["response"];
            }
        }
        xhttp.send(data);
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
document.getElementById("test").addEventListener("click", testServer);
