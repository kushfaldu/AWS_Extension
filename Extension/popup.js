document.addEventListener("DOMContentLoaded", function () {
    let inputText = document.getElementById("inputText");
    let translateBtn = document.getElementById("translateBtn");
    let listenBtn = document.getElementById("listenBtn");
    let translatedText = document.getElementById("translatedText");
    let historyBtn = document.getElementById("historyBtn");
    let historyList = document.getElementById("historyList");
    let themeToggle = document.getElementById("themeToggle");

    // Load saved theme
    chrome.storage.sync.get(['theme'], function(result) {
        if (result.theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = 'Light Mode';
        }
    });

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        chrome.storage.sync.set({ theme: isDark ? 'dark' : 'light' });
    });

    // Receive selected text from content script
    chrome.runtime.onMessage.addListener((request) => {
        console.log("Received message:", request);
        
        if (request.text) {
            inputText.value = request.text;
        }

        if (request.action === "playAudio") {
            console.log("Playing audio...");
            let audio = new Audio("data:audio/mp3;base64," + request.audioBase64);
            audio.play();
        }
    });

    // Send translation request
    translateBtn.addEventListener("click", () => {
        let text = inputText.value;
        let targetLang = document.getElementById("language").value;

        console.log("Sending translation request:", text, "Target Language:", targetLang);

        chrome.runtime.sendMessage({ action: "translate", text, targetLang }, (response) => {
            console.log("Received translation response:", response);
            translatedText.innerText = response.translatedText || "Error in translation!";
        });
    });

    // Send text-to-speech request
    listenBtn.addEventListener("click", () => {
        let text = translatedText.innerText;
        console.log("Sending TTS request:", text);
        chrome.runtime.sendMessage({ action: "speak", text });
    });

    // Fetch and display translation history
    historyBtn.addEventListener("click", () => {
        console.log("Fetching translation history...");

        chrome.runtime.sendMessage({ action: "getHistory" }, (response) => {
            historyList.innerHTML = ""; // Clear previous list

            if (!response.history || response.history.length === 0) {
                historyList.innerHTML = "<li>No translation history available.</li>";
                return;
            }

            // Reverse the history array to show newest entries first
            [...response.history].reverse().forEach(entry => {
                let listItem = document.createElement("li");
                listItem.textContent = `Original: ${entry.original} | Translated: ${entry.translated} (${entry.target_lang})`;
                historyList.appendChild(listItem);
            });
        });
    });
});
