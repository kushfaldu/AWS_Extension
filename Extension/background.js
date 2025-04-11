const TRANSLATE_API_URL = "https://ecqmg2u8t0.execute-api.us-east-1.amazonaws.com/prod/translate";
const POLLY_API_URL = "https://ecqmg2u8t0.execute-api.us-east-1.amazonaws.com/prod/speak";
const HISTORY_API_URL = "https://ecqmg2u8t0.execute-api.us-east-1.amazonaws.com/prod/history";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
        console.log("Sending translation request:", request.text);

        fetch(TRANSLATE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: request.text, targetLang: request.targetLang })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Translation response:", data);
            sendResponse({ translatedText: data.translatedText });
        })
        .catch(error => {
            console.error("Translation error:", error);
            sendResponse({ error: "Translation failed. Check console for details." });
        });

        return true;
    }

    if (request.action === "speak") {
        console.log("Sending TTS request:", request.text);

        fetch(POLLY_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: request.text })
        })
        .then(response => response.json())
        .then(data => {
            console.log("TTS response:", data);
            chrome.runtime.sendMessage({ action: "playAudio", audioBase64: data.audioBase64 });
        })
        .catch(error => {
            console.error("TTS error:", error);
        });

        return true;
    }

    if (request.action === "getHistory") {
        console.log("Fetching translation history...");

        fetch(HISTORY_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log("Translation history:", data);
            sendResponse({ history: data.history });
        })
        .catch(error => {
            console.error("History error:", error);
        });

        return true;
    }
});
