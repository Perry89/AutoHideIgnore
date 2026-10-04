const { test } = require("node:test");
const assert = require("node:assert/strict");
const { correctComment } = require("../firebase/functions/cache");

function database(seed = {}) {
    const documents = new Map(Object.entries(seed));
    let queue = Promise.resolve();
    return {
        documents,
        collection: name => ({ doc: id => `${name}/${id}` }),
        runTransaction: callback => {
            const operation = queue.then(async () => {
                const writes = [];
                const result = await callback({
                    get: async ref => ({ data: () => documents.get(ref) }),
                    set: (ref, value) => writes.push(() => documents.set(ref, value)),
                    delete: ref => writes.push(() => documents.delete(ref))
                });
                writes.forEach(write => write());
                return result;
            });
            queue = operation.catch(() => {});
            return operation;
        }
    };
}

const input = { commentId: "comment-17382484", text: "zle napisany tekst", uid: "user-a", now: () => 1700000000000 };

test("cache hit returns shared correction without a Gemini call or quota charge", async () => {
    const db = database({ "borneoTranslations/comment-17382484": { translation: "Poprawiony tekst" } });
    const result = await correctComment({ ...input, db, generate: () => assert.fail("Gemini called") });
    assert.equal(result.translation, "Poprawiony tekst");
    assert.equal(db.documents.size, 1);
});

test("concurrent users make only one Gemini call", async () => {
    const db = database();
    let finish;
    let started;
    const signal = new Promise(resolve => { started = resolve; });
    let calls = 0;
    const generate = () => { calls++; started(); return new Promise(resolve => { finish = resolve; }); };
    const first = correctComment({ ...input, db, generate });
    await signal;
    const second = await correctComment({ ...input, uid: "user-b", db, generate });
    assert.equal(second.pending, true);
    finish("Poprawiony tekst");
    await first;
    const third = await correctComment({ ...input, uid: "user-c", db, generate });
    assert.equal(third.cached, true);
    assert.equal(calls, 1);
    assert.equal(db.documents.get(`borneoTranslations/${input.commentId}`).original, input.text);
});

test("failed or empty responses release the lock and can be retried", async () => {
    for (const generate of [async () => { throw new Error("offline"); }, async () => "  "]) {
        const db = database();
        await assert.rejects(correctComment({ ...input, db, generate }));
        assert.equal(db.documents.has(`borneoTranslations/${input.commentId}`), false);
        assert.equal((await correctComment({ ...input, db, generate: async () => "OK" })).translation, "OK");
    }
});

test("expired lease recovers after a crashed invocation", async () => {
    const db = database({ "borneoTranslations/comment-17382484": { leaseUntil: input.now() - 1 } });
    assert.equal((await correctComment({ ...input, db, generate: async () => "OK" })).translation, "OK");
});

test("global spending limit rejects new generations", async () => {
    const day = new Date(input.now()).toISOString().slice(0, 10);
    const db = database({ [`borneoUsage/${day}_global`]: { count: 300 } });
    await assert.rejects(correctComment({ ...input, db, generate: () => assert.fail("Gemini called") }), /DAILY_LIMIT/);
});
