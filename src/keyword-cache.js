// One shared, persistent refresh per browser per day; no realtime listeners.
(function (root) {
    const KEY = "categoryDictionaryCache";
    const DAY = 24 * 60 * 60 * 1000;
    const NAMES = ["polityka", "transfery", "football", "plotki", "inny_sport", "gry", "technologia", "film", "muzyka"];
    function valid(data) {
        return Boolean(data && typeof data.version === "string" && data.version.length > 0 && data.version.length <= 100 &&
            data.categories && Object.keys(data.categories).length === NAMES.length &&
            NAMES.every(name => Array.isArray(data.categories[name]) && data.categories[name].length > 0 &&
                data.categories[name].length <= 5000 && data.categories[name].every(word =>
                    typeof word === "string" && word.trim().length > 0 && word.length <= 100)));
    }
    function decode(document) {
        const fields = document.fields;
        return {
            version: fields?.version?.stringValue,
            categories: Object.fromEntries(Object.entries(fields?.categories?.mapValue?.fields || {}).map(([name, value]) =>
                [name, (value.arrayValue?.values || []).map(item => item.stringValue)]))
        };
    }
    function create({ storage, fetch, now = Date.now }) {
        let pending;
        async function refresh() {
            const cached = (await storage.get(KEY))[KEY];
            const data = valid(cached?.data) ? cached.data : null;
            const age = now() - cached?.checkedAt;
            if (Number.isFinite(age) && age >= 0 && age < DAY) return data;
            // Persist attempts too: offline/errors must not trigger requests on every page.
            await storage.set({ [KEY]: { checkedAt: now(), data } });
            try {
                const response = await fetch("https://firestore.googleapis.com/v1/projects/borneotranslator/databases/(default)/documents/categoryDictionaries/current", {
                    credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(10000)
                });
                if (!response.ok) throw new Error("Dictionary unavailable");
                const latest = decode(await response.json());
                if (!valid(latest)) throw new Error("Invalid dictionary");
                await storage.set({ [KEY]: { checkedAt: now(), data: latest } });
                return latest;
            } catch (_) { return data; }
        }
        return function get() {
            if (!pending) pending = refresh().finally(() => { pending = null; });
            return pending;
        };
    }
    root.CategoryDictionary = { create, valid, decode };
})(globalThis);
