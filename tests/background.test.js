const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

function background(config, fetch) {
    let handler;
    vm.runInNewContext(fs.readFileSync("src/background.js", "utf8"), {
        BORNEO_TRANSLATION_CONFIG: config,
        browser: { runtime: { onMessage: { addListener: callback => { handler = callback; } } } },
        fetch, AbortSignal, setTimeout, Date
    });
    return (message, sender = { tab: { id: 1 }, url: "https://www.fcbarca.com/la-rambla" }) =>
        new Promise(resolve => handler(message, sender, resolve));
}

const message = { type: "translateBorneo", commentId: "comment-17382484", text: "tekst" };
test("unconfigured installation shows an actionable error without network requests", async () => {
    const send = background({}, () => assert.fail("Network called"));
    assert.match((await send(message)).error, /konfigurację Firebase/);
});
test("other sites cannot invoke translation", async () => {
    const send = background({}, () => assert.fail("Network called"));
    assert.match((await send(message, { tab: { id: 1 }, url: "https://example.com/" })).error, /Nieprawidłowy/);
});
test("authenticates and unwraps the callable result", async () => {
    const calls = [];
    const send = background({ apiKey: "public-key", endpoint: "https://europe-west2-project.cloudfunctions.net/translateBorneo" }, async (url, options) => {
        calls.push({ url, options });
        return { ok: true, json: async () => calls.length === 1 ? { idToken: "token" } : { data: { translation: "Poprawiony tekst" } } };
    });
    assert.equal((await send(message)).translation, "Poprawiony tekst");
    assert.equal(calls[1].options.headers.Authorization, "Bearer token");
    assert.equal(JSON.parse(calls[1].options.body).data.commentId, message.commentId);
});
