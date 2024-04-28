================================
AI Grammar Thunderbird Extension
================================

Corrects grammar mistakes in your draft email, powered by AI.

Features
--------

Upon clicking the new "Grammar" button, sends your draft email to the
Llama3 large language model to rewrite it. The draft email text is replaced with the output.
You can always undo the change with "Undo" / Ctrl-Z.

**Privacy**: local server: all your emails stay with you and are not uploaded anywhere!
Ollama must first be installed locally. Installation instructions are in the extensions "Preferences" tab,
and in the options.html file here.

**Malleable**: Editable prompt for the LLM: You can make this add-on do different tasks.

Installation
------------

Easiest is to download from the official add-ons page.
Otherwise, download the latest .xpi of the add-on [from the GitHub releases](https://github.com/raulpardo/thunderbird-langtool-mailextension/releases/), then [install it in Thunderbird as usual](https://support.mozilla.org/en-US/kb/installing-addon-thunderbird).

Go into the add-ons manager, find "AI Grammar" and click on "Preferences".

To get the Ollama with  server

1. Install Docker (search online for "docker install " + Windows, MacOS or Linux to find install instructions).
2. Run the Ollama docker image, instructions are on the `Ollama github <https://hub.docker.com/r/ollama/ollama>`_. For me on Linux, I ran:: 

    docker run -d -v ollama:/root/.ollama -p 11434:11434 -e 'OLLAMA_ORIGINS=moz-extension://*' --name ollama ollama/ollama

   * If you get "command not found", then you do not have docker installed (step 1).
   * If you get "permission denied while trying to connect to the Docker daemon", see `this stackoverflow question <https://stackoverflow.com/questions/48957195/how-to-fix-docker-got-permission-denied-issue>`_
   * Note the OLLAMA_ORIGINS in addition to the official install command.
   * If you later want to stop and shutdown the server::

       docker stop ollama
       docker rm ollama

3. Pull llama3 LLM:

   * docker exec -i ollama ollama pull llama3

4. Go to the thunderbird add-ons panel, find "AI Grammar" and go to the "Preferences" tab
5. Set server url above to http://localhost:11434/ and press test.

   * If you get "403 Forbidden" then there is a CORS issue. You need to set the OLLAMA_ORIGINS.
   * If you get "404" or other could not connect error, the server is not running.
   * If you get "200 OK; It worked OK!", then everything is okay and llama3 responded!

6. Compose an email and press the Grammar button. Example:


Contributing and Developing
---------------------------

Contributions are more than welcome and encouraged in the form of pull requests.

Useful resources:
* What are all these files and how do they interact? --> https://developer.thunderbird.net/add-ons/mailextensions
* How can I install, play with the extension while developing, and debug it with the console? --> https://developer.thunderbird.net/add-ons/hello-world-add-on
* Thunderbird MailExtension API: https://webextension-api.thunderbird.net/en/latest/

Making a release
----------------

* run "make" which creates a .xpi file.
* upload to addons server.


Copyright
---------

Apache 2.0 license.

Created by Johannes Buchner based on https://github.com/raulpardo/thunderbird-langtool-mailextension/

