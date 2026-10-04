if (typeof importScripts === "function") importScripts("translation-config.js");

const api = typeof browser !== "undefined" ? browser : chrome;
const requests = new Map();
let session;

async function requestJSON(url, options) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(70000) });
    const body = await response.json();
    if (!response.ok || body.error) throw new Error(body.error?.message || "Serwer jest niedostępny.");
    return body;
}

async function getToken(apiKey) {
    if (session && session.expires > Date.now()) return session.token;
    const body = await requestJSON(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true })
    });
    session = { token: body.idToken, expires: Date.now() + 50 * 60 * 1000 };
    return session.token;
}

async function translate(message) {
    const { apiKey, endpoint } = globalThis.BORNEO_TRANSLATION_CONFIG;
    if (!apiKey || !/^https:\/\/[a-z0-9-]+\.cloudfunctions\.net\/translateBorneo$/.test(endpoint)) {
        throw new Error("Tłumacz czeka na konfigurację Firebase.");
    }
    const token = await getToken(apiKey);
    for (let attempt = 0; attempt < 30; attempt++) {
        const body = await requestJSON(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ data: { commentId: message.commentId, text: message.text } })
        });
        const result = body.result || body.data;
        if (result?.translation) return result.translation;
        if (!result?.pending) throw new Error("Brak poprawionej wersji komentarza.");
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    throw new Error("Komentarz jest nadal przetwarzany. Spróbuj ponownie za chwilę.");
}

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== "translateBorneo") return;
    if (!sender.tab || !/^https?:\/\/www\.fcbarca\.com\//.test(sender.url || "") ||
        !/^comment-\d+$/.test(message.commentId || "") ||
        typeof message.text !== "string" || !message.text.trim() || message.text.length > 20000) {
        sendResponse({ error: "Nieprawidłowy komentarz." });
        return;
    }
    // Reuse requests across tabs in this browser; Firestore also coordinates all users.
    if (!requests.has(message.commentId)) {
        requests.set(message.commentId, translate(message).finally(() => requests.delete(message.commentId)));
    }
    requests.get(message.commentId).then(
        translation => sendResponse({ translation }),
        error => sendResponse({ error: error.message })
    );
    return true;
});
