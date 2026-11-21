const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const ctx = vm.createContext({ AbortSignal });
vm.runInContext(fs.readFileSync("src/keyword-cache.js", "utf8"), ctx);
const { create, valid } = ctx.CategoryDictionary;
const categories = JSON.parse(fs.readFileSync("firebase/data/category-keywords.json", "utf8"));
const day = 86400000;
const doc = version => ({ fields: { version: { stringValue: version }, categories: { mapValue: { fields:
    Object.fromEntries(Object.entries(categories).map(([name, words]) => [name, { arrayValue: { values: words.map(stringValue => ({ stringValue })) } }]))
} } } });
function setup() {
    let value = {}, time = day * 100, calls = 0, broken = false, version = "v1";
    const storage = { get: async () => structuredClone(value), set: async data => { value = structuredClone(data); } };
    const fetch = async () => { calls++; if (broken) throw Error("offline"); return { ok: true, json: async () => doc(version) }; };
    const options = { storage, fetch, now: () => time };
    return { options, get: create(options), advance: () => { time += day; }, fail: () => { broken = true; },
        update: () => { version = "v2"; }, calls: () => calls };
}
test("all tabs and background restarts share one daily fetch", async () => {
    const s = setup();
    const result = await Promise.all(Array.from({ length: 20 }, () => s.get()));
    assert.equal(s.calls(), 1); assert.equal(result[0].version, "v1");
    await create(s.options)(); assert.equal(s.calls(), 1);
    s.advance(); s.update(); assert.equal((await s.get()).version, "v2"); assert.equal(s.calls(), 2);
});
test("offline retains last good data and suppresses repeated attempts for 24 hours", async () => {
    const s = setup(); await s.get(); s.advance(); s.fail();
    assert.equal((await s.get()).version, "v1"); await create(s.options)(); assert.equal(s.calls(), 2);
});
test("first use offline returns fallback signal without a retry storm", async () => {
    const s = setup(); s.fail(); assert.equal(await s.get(), null); await create(s.options)(); assert.equal(s.calls(), 1);
});
test("rejects partial or malformed dictionaries and keeps GTA in Games", () => {
    assert.equal(valid({ version: "v1", categories }), true);
    assert.equal(valid({ version: "v1", categories: { gry: ["gta"] } }), false);
    assert.equal(valid({ version: "v1", categories: { ...categories, gta: ["gta"] } }), false);
    assert.ok(categories.gry.includes("grand theft auto"));
});
test("invalid remote data cannot replace a valid cached dictionary", async () => {
    let saved = { categoryDictionaryCache: { checkedAt: 0, data: { version: "good", categories } } };
    const get = create({ storage: { get: async () => saved, set: async value => { saved = value; } },
        fetch: async () => ({ ok: true, json: async () => ({ fields: {} }) }), now: () => day * 100 });
    assert.equal((await get()).version, "good");
    assert.equal(saved.categoryDictionaryCache.data.version, "good");
});
test("background serves remote dictionaries only to FCBarca tabs", async () => {
    let handler, calls = 0, saved = {};
    const context = vm.createContext({ AbortSignal, Date, setTimeout,
        BORNEO_TRANSLATION_CONFIG: {},
        browser: { storage: { local: { get: async () => saved, set: async data => { saved = data; } } },
            runtime: { onMessage: { addListener: fn => { handler = fn; } } } },
        fetch: async () => { calls++; return { ok: true, json: async () => doc("live") }; }
    });
    vm.runInContext(fs.readFileSync("src/keyword-cache.js", "utf8"), context);
    vm.runInContext(fs.readFileSync("src/background.js", "utf8"), context);
    const send = url => new Promise(resolve => handler({ type: "getCategoryDictionary" }, { tab: { id: 1 }, url }, resolve));
    assert.ok((await send("https://example.com/")).error);
    assert.equal(calls, 0);
    assert.equal((await send("https://www.fcbarca.com/la-rambla")).dictionary.version, "live");
    assert.equal(calls, 1);
});
