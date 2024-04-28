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

* Quoted text, signatures and forwarded email portions are skipped. Only text emails are supported.

Demo
----

.. image:: https://github.com/JohannesBuchner/thunderbird-ai-grammar-mailextension/raw/main/doc/run.gif
   :alt: Example of usage of this extension
   :target: https://github.com/JohannesBuchner/thunderbird-ai-grammar-mailextension/raw/main/doc/run.webm


Installation
------------

1. Easiest is to download from the official thunderbird add-ons page: https://addons.thunderbird.net/en-US/thunderbird/addon/ai-grammar/
   Otherwise go down to "Help contributing" for manual installation.

2. Go into the add-ons manager, find "AI Grammar" and click on "Preferences".


Installing the Ollama large language model server
--------------------------------------------------

These installation instructions are provided on a best-effort basis. If
they do not work or are outdated, please do not complain here but look up the official instructions
and ask for help there. Suggestions for improved instructions are welcome!

To get the Ollama large language model server:

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

6. Compose an email and press the Grammar button. Should look like the demo above!


Making changes
---------------

Contributions are more than welcome and encouraged in the form of pull requests.

It is not too hard to create your own modified extension to suit your workflow!

Useful resources:

* What are all these files and how do they interact? --> https://developer.thunderbird.net/add-ons/mailextensions
* How can I install, play with the extension while developing, and debug it with the console? --> https://developer.thunderbird.net/add-ons/hello-world-add-on
* Thunderbird MailExtension API: https://webextension-api.thunderbird.net/en/latest/

Manual installation (allows modifying the extension):

1. Download this repository folder `as a zip <https://github.com/JohannesBuchner/thunderbird-ai-grammar-mailextension/archive/refs/heads/main.zip>`_ and extract it into a folder.
   Alternatively, get a full copy of the code repository with::

      git clone https://github.com/JohannesBuchner/thunderbird-ai-grammar-mailextension`

2. follow instructions on https://developer.thunderbird.net/add-ons/hello-world-add-on to select and load manifest.json as a temporary extension.

.. image:: https://github.com/JohannesBuchner/thunderbird-ai-grammar-mailextension/raw/main/doc/debug-install.gif
   :alt: Example of usage of this extension
   :target: https://github.com/JohannesBuchner/thunderbird-ai-grammar-mailextension/raw/main/doc/debug-install.webm

3. Go to the thunderbird add-ons panel, find "AI Grammar" and go to the "Preferences" tab
4. Set server url above to http://localhost:11434/ and press test.

   * If you get "403 Forbidden" then there is a CORS issue. You need to set the OLLAMA_ORIGINS.
   * If you get "404" or other could not connect error, the server is not running.
   * If you get "200 OK; It worked OK!", then everything is okay and llama3 responded!

5. Compose an email and press the Grammar button. Should look like the demo above!



Making a release
----------------

* run "make" which creates a .xpi file.
* upload to addons server.


Copyright
---------

Apache 2.0 license.

Created by Johannes Buchner based on https://github.com/raulpardo/thunderbird-langtool-mailextension/


