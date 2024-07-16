// Obtain the tab that contains the email
browser.tabs.query({
    active: true,
    currentWindow: true,
}).then(tabs => {
    let tabId = tabs[0].id;
    browser.compose.getComposeDetails(tabId).then((details) => {
        // Add event listener for the reload button
        document.getElementById("rld").addEventListener("click", function () {
           initSendRequest(tabId, details);
        });
    
        initSendRequest(tabId, details);
    })
});

// Initialize and send the request
function initSendRequest(tabId, details) {
    // Retrieve server from local storage
    var storageItem = browser.storage.local.get("server");
    storageItem.then((res) => {
        if (typeof res.server === "undefined") {
           emptyCurrentOutput();
           p = document.body.appendChild(document.createElement("p"));
           p.textContent = "Visit the preferences page of the extension first!"
           p.setAttribute("id", "currentOutput")
           saveCurrentOutput("empty");
        } else {
           server_name = res.server;
           const url_text = res.server.replace(/\/*$/, "") + "/api/generate";

           var text = details.plainTextBody.split(/\n-- *\n|\n---*[^-]*.*\n/)[0].split("\n").filter(line => !line.startsWith('>')).join("\n").trim();
           if (text == "") {
               emptyCurrentOutput();
               p = document.body.appendChild(document.createElement("p"));
               p.textContent = "First write text into your draft email!"
               p.setAttribute("id", "currentOutput")
               saveCurrentOutput("empty");
               document.getElementById("output").classList.remove("loader");
           } else {
               // Send Request to ollama Server
               sendRequest(tabId, details, url_text, text);
           }
        }
    });
}


// Send the request to Langtool server
function sendRequest(tabId, details, url_text, text) {
    // Add the loading icon
    document.getElementById("output").classList.add("loader");

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', url_text, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    var data = JSON.stringify({
      "model": "llama3",
      "prompt": "Fix grammar mistakes in the following text. If no issues are found, reply with '> OK'." +
          "Otherwise only reply with the full new text without adding anything before or after to the reply such as 'Here is the corrected text:'.\n\n" + 
          text,
      "stream": false
    });
    // console.log('Requesting:' + data);
    // Handling received message
    xhttp.onreadystatechange = (e) => {
        // console.log('onreadystatechange:' + xhttp.statusText + " State:" + xhttp.readyState);
        // Remove loading icon
        document.getElementById("output").classList.remove("loader");
        
        // Empty the output
        emptyCurrentOutput();
    	
        // If the server responded successfully, add response to the popup
        if (xhttp.readyState == 4 && xhttp.status == 200) {        
            // console.log('Response:' + xhttp.responseText);
            resp = JSON.parse(xhttp.responseText);
            setOutput(tabId, details, resp, text);
            // remove the previous output warning
            removeOldOutputWarning();
        // If the server cannot be successfully reached, add error message to the popup
        } else {
            setErrorMessage();
        }
    }
    xhttp.send(data);
}


function uncommon_left(str1, str2) {
    let prefix = '';
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
        if (str1[i] === str2[i]) {
            prefix += str1[i];
        } else {
            break;
        }
    }
    return prefix.split(" ").slice(0, -1).join(" ").length;
}
function uncommon_right(str1, str2) {
    // Find the longest common suffix
    let suffix = '';
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
        if (str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
            suffix = str1[str1.length - 1 - i] + suffix;
        } else {
            break;
        }
    }
    return suffix.split(" ").slice(1).join(" ").length;
}

// Set the output HTML with the text received from the server (or
// stored in the local storage)
function setOutput(tabId, details, resp, text) {
    if (resp === undefined) {
       setErrorMessage();    
    }
    else if (resp["response"].length == 0 || resp["response"] == "> OK") {
       setNoErrorsFoundMessage();
    }
    else {
        var ul = document.body.appendChild(document.createElement("ol"));
        // take each line of the output
        var origchunks = details.plainTextBody.split("\n");
        var newchunks = resp["response"].split("\n");
        var i = 0;
        var j = 0;
        while (i < origchunks.length && j < newchunks.length) {
           // console.log(i + "/" + j + ": comparing: [" + origchunks[i] + "] with [" + newchunks[j] + "]");
           if (origchunks[i].startsWith('>')) {
              i++;
              continue;
           }
           if (origchunks[i].trim() == "") {
              i++;
              continue;
           }
           if (newchunks[j].trim() == "") {
              j++;
              continue;
           }
           if (origchunks[i] != newchunks[j]) {
              // find smallest change
		      var li = document.createElement("li");
		      var oldtext = document.createElement("div");
		      var prefix_length = uncommon_left(origchunks[i], newchunks[j]);
		      var suffix_length = uncommon_right(origchunks[i], newchunks[j]);
		      oldtext.classList.add("oldtext");
		      oldtext.textContent = origchunks[i].substring(prefix_length, origchunks[i].length - suffix_length);
		      var suggestedtext = document.createElement("div");
		      suggestedtext.classList.add("suggestedtext");
		      suggestedtext.textContent = newchunks[j].substring(prefix_length, newchunks[j].length - suffix_length);
		      li.appendChild(oldtext);
		      li.appendChild(suggestedtext);
		      ul.appendChild(li);
		      origchunks[i] = newchunks[j];
           }
           i++;
           j++;
        }
        ul.setAttribute("id", "currentOutput");
        saveCurrentOutput(resp["response"]);
        details.plainTextBody = origchunks.join("\n");
        details.body = "<p>" + origchunks.join("<p>");
        browser.compose.setComposeDetails(tabId, details);
    }
}

function insertParagraphs(plainText, htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const body = doc.querySelector('body');

    // Remove all existing <p> elements after <body>
    let nextNode = body.firstElementChild.nextSibling;
    while (nextNode) {
        const currentNode = nextNode;
        nextNode = nextNode.nextSibling;
        if (currentNode.tagName.toLowerCase() === 'p') {
            body.removeChild(currentNode);
        } else {
            break;
        }
    }

    // Split plaintext into lines and insert <p> elements for each line
    const lines = plainText.trim().split('\n');
    lines.forEach(line => {
        const paragraph = doc.createElement('p');
        paragraph.textContent = line.trim();
        body.appendChild(paragraph);
        body.parentNode.insertBefore(p, body.nextSibling);
    });

    return doc.documentElement.outerHTML;
}

function setErrorMessage() {
    p = document.body.appendChild(document.createElement("p"));
    p.textContent = "Server not found. " +
    "Start the server or update the URL in the preferences page of the extension."
    p.setAttribute("id", "currentOutput")
    saveCurrentOutput("empty");
}

function setNoErrorsFoundMessage() {
    p = document.body.appendChild(document.createElement("p"));
    p.textContent = "No errors found. Congrats!"
    p.setAttribute("id", "currentOutput");
    saveCurrentOutput("empty");
}

// Empty the current output in the popup window
function emptyCurrentOutput() {
    // Check whether there is a current output
    if (document.contains(document.getElementById("currentOutput"))) {
        // Remove the current output
        document.getElementById("currentOutput").remove();
    }
}

function addOldOutputWarning() {
    var p = document.createElement("p");
    p.textContent="(previous output, click refresh to update)"
    p.setAttribute("id", "warning-old-output");
    document.getElementById("header-row").appendChild(p);
}

function removeOldOutputWarning() {
    var oldel = document.getElementById("warning-old-output");
    if (oldel) oldel.remove();
}

// Save the current output in local storage
// (To avoid calling langtool everytime the user clicks on the button)
function saveCurrentOutput(resp) {
    browser.storage.local.set({tempOutput: resp});
}
