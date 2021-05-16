// Obtain the tab that contains the email
browser.tabs.query({
    active: true,
    currentWindow: true,
}).then(tabs => {
    let tabId = tabs[0].id;
    browser.compose.getComposeDetails(tabId).then((details) => {
	// For now we only handle plain text emails
	if (details.isPlainText) {

	    // Add event listener for the reload button
	    document.getElementById("rld").addEventListener("click", function () {
		
		// Empty the current output if there is one
		emptyCurrentOutput();
		
		// Send request to the langtool server
		initSendRequest(details);
	    });
	    
	    // Retreive possible existing output
	    var previousOutput = browser.storage.local.get("tempOutput");
	    previousOutput.then((res) => {

		// If there was no existing output in the local storage send a request
		if (res.tempOutput == "empty") {
		    initSendRequest(details);
		    
		// Otherwise, print the previous output from local storage
		} else {
		    setOutput(res.tempOutput);
		    addOldOutputWarning();
		}	
	    });
	}
    });
});


// Initialize and send the request
function initSendRequest(details) {
		    
    // Retreive server from local storage
    var storageServer = browser.storage.local.get("server");
    storageServer.then((res) => {
	const url_text= res.server+"v2/check";
	
	// Send Request to Langtool Server
	sendRequest(details,url_text);
    });
}


// Send the request to Langtool server
function sendRequest(details,url_text) {
    // Add the loading icon
    document.getElementById("output").classList.add("loader");

    // Prepare & send request
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", url_text+
	       "?data="+
	       encodeURIComponent(JSON.stringify({"text": details.plainTextBody,
						  "marker": ">"}))+
	       "&language=auto"
	      );
    xhttp.send();

    // Handling received message
    xhttp.onreadystatechange = (e) => {
	// Remove loading icon
	document.getElementById("output").classList.remove("loader");
	
	// Empty the output
	emptyCurrentOutput();
	
	// If the server responded successfully, add response to the popup
	if (xhttp.readyState == 4 && xhttp.status == 200) {	    
	    resp = JSON.parse(xhttp.responseText);
	    setOutput(resp);
	    // remove the previous output warning
	    removeOldOutputWarning();

	// If the server cannot be successfully reached, add error message to the popup
	} else {	    
	    setErrorMessage();
	}
    }
}


// Set the output HTML with the text received from the server (or
// stored in the local storage)
function setOutput(resp) {
    if (resp === undefined) {
	setErrorMessage();	
    }
    else if (resp["matches"].length == 0) {
	setNoErrorsFoundMessage();
    }
    else {
	var ul = document.body.appendChild(document.createElement("ol"));
	resp["matches"].forEach(function (e) {
	    var li = document.createElement("li");
	    var str = createItem(e);
	    li.innerHTML = str;
	    ul.appendChild(li);
	});
	ul.setAttribute("id", "currentOutput");
	saveCurrentOutput(resp);
    }
}

function setErrorMessage() {
    p = document.body.appendChild(document.createElement("p"));
    p.innerHTML = "Server not found. <br><br>" +
	"Please start the server, or update the URL in the settings page of the extension."
    p.setAttribute("id", "currentOutput")
    saveCurrentOutput("empty");
}

function setNoErrorsFoundMessage() {
    p = document.body.appendChild(document.createElement("p"));
    p.innerHTML = "No errors found. Congrats!"
    p.setAttribute("id", "currentOutput");
    saveCurrentOutput("empty");
}

// In the following there are several functions to create the
// different entries of the langtool response
function createItem(e) {
    return "" +
	"<u>Sentence</u>: "     + createSentence(e)              +
	"<br>"                                                   +
	"<u>Description</u>: "  + e['rule'].description          +
	"<br>"                                                   +
	"<u>Type</u>: "         + e['rule'].issueType.italics()  +
	"<br>"                                                   +
	"<u>Replacements</u>: " + createReplacements(e)          +
	"<br><br>";
}

function createSentence(e) {
    return "" +
        e["context"].text.substring(0,e["context"].offset) +
        "<b>" + e["context"].text.substring(e["context"].offset,e["context"].offset+e["context"].length) + "</b> " +
        e["context"].text.substring(e["context"].offset+e["context"].length,e["context"].text.length);
}

function createReplacements(e) {
    return e['replacements'].slice(0, 7).map((x) => x.value).join(", ") + " ...";
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
    p.innerHTML="(previous output, click refresh to update)"
    p.setAttribute("id", "warning-old-output");
    document.getElementById("header-row").appendChild(p);
}

function removeOldOutputWarning() {
    document.getElementById("warning-old-output").remove();
}

// Save the current output in local storage
// (To avoid calling langtool everytime the user clicks on the button)
function saveCurrentOutput(resp) {
    browser.storage.local.set({tempOutput: resp});
}
