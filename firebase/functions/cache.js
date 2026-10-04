const { randomUUID } = require("node:crypto");

// Transaction callbacks can run more than once; Gemini must stay outside them.
async function correctComment({ db, commentId, text, uid, generate, now = Date.now }) {
    const ref = db.collection("borneoTranslations").doc(commentId);
    const owner = randomUUID();
    const day = new Date(now()).toISOString().slice(0, 10);
    const userLimit = db.collection("borneoUsage").doc(`${day}_${uid}`);
    const globalLimit = db.collection("borneoUsage").doc(`${day}_global`);
    const claim = await db.runTransaction(async tx => {
        const snapshot = await tx.get(ref);
        const cached = snapshot.data();
        if (cached?.translation) return { translation: cached.translation, cached: true };
        if (cached?.leaseUntil > now()) return { pending: true };
        const [user, global] = await Promise.all([tx.get(userLimit), tx.get(globalLimit)]);
        if ((user.data()?.count || 0) >= 30 || (global.data()?.count || 0) >= 300) {
            throw new Error("DAILY_LIMIT");
        }
        tx.set(userLimit, { count: (user.data()?.count || 0) + 1 });
        tx.set(globalLimit, { count: (global.data()?.count || 0) + 1 });
        tx.set(ref, { owner, leaseUntil: now() + 120000, status: "processing" });
        return { claimed: true };
    });
    if (!claim.claimed) return claim;
    try {
        const translation = await generate(text);
        if (typeof translation !== "string" || !translation.trim()) throw new Error("EMPTY_TRANSLATION");
        return await db.runTransaction(async tx => {
            const current = (await tx.get(ref)).data();
            if (current?.owner !== owner) return current?.translation
                ? { translation: current.translation, cached: true } : { pending: true };
            tx.set(ref, { translation: translation.trim(), original: text, author: "Borneo", status: "ready", createdAt: now() });
            return { translation: translation.trim(), cached: false };
        });
    } catch (error) {
        await db.runTransaction(async tx => {
            if ((await tx.get(ref)).data()?.owner === owner) tx.delete(ref);
        });
        throw error;
    }
}

module.exports = { correctComment };
