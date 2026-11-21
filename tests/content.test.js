const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

const source = fs.readFileSync("src/content.js", "utf8");
const context = vm.createContext({ URL });
vm.runInContext(
    source.slice(source.indexOf("function ownCommentNode("), source.indexOf("const borneoOriginalContents")) +
    source.slice(source.indexOf("function hasXPost("), source.indexOf("function renderBorneoCorrection(")),
    context
);

test("X post detection hides only the comment that owns the embed", () => {
    const parent = { querySelectorAll: selector => selector === "a[href]" ? [] : [embed] };
    const reply = { querySelectorAll: selector => selector === "a[href]" ? [] : [embed] };
    const embed = { closest: () => reply };
    assert.equal(context.hasXPost(parent), false);
    assert.equal(context.hasXPost(reply), true);
    assert.equal(context.hasXPost({ querySelectorAll: () => [] }), false);
});

test("detects X post permalinks when Firefox replaces the widget, without matching profiles or other hosts", () => {
    const comment = { querySelectorAll: selector => selector === "a[href]" ? [link] : [] };
    let href;
    const link = { closest: () => comment, getAttribute: () => href };
    for (href of ["https://x.com/MotoGP/status/123?ref_src=tfw", "https://twitter.com/user/status/456", "https://mobile.twitter.com/user/status/789", "https://x.com/i/web/status/123"]) {
        assert.equal(context.hasXPost(comment), true, href);
    }
    for (href of ["https://x.com/MotoGP", "https://example.com/user/status/123", "https://x.com.evil.test/user/status/123", "/user/MotoGP"]) {
        assert.equal(context.hasXPost(comment), false, href);
    }
});

const categoryContext = vm.createContext({});
vm.runInContext(
    source.slice(source.indexOf("const categoryOrder"), source.indexOf("function isExtensionAlive")) +
    source.slice(source.indexOf("function normalize(text)"), source.indexOf("function normalizeUsername")) +
    source.slice(source.indexOf("function categorizeText"), source.indexOf("async function getIgnoredCategories")),
    categoryContext
);

test("recognizes political institutions, names and Polish inflections", () => {
    for (const text of [
        "Braun i Mentzen spierają się o migrację.",
        "Święczkowski i Piotrowicz w Trybunale Konstytucyjnym.",
        "Nawrocki wetuje ustawę, koalicja zbiera głosy w Sejmie.",
        "KRS i neosędziowie, praworządność oraz środki z KPO.",
        "Kierwiński rozmawia z Żurkiem o prokuraturze.",
        "Nord Stream i pakt migracyjny w Unii Europejskiej."
    ]) assert.equal(categoryContext.categorizeText(text), "polityka", text);
});

test("ordinary football and usernames do not become politics", () => {
    for (const text of [
        "Po meczu atak Barcelony i obrona Realu wyglądają dobrze.",
        "Sędziowie pokazali kartki, liga ma problem z VAR.",
        "Media opisują podział punktów po meczu Flicka.",
        "@Tusk @Braun mecz Barcelony i gol Yamala."
    ]) assert.equal(categoryContext.categorizeText(text), "football", text);
});

test("recognizes new multiword topics across categories", () => {
    for (const [text, category] of [
        ["Wolny agent i opcja wykupu w nowym kontrakcie.", "transfery"],
        ["Świątek i Sabalenka zagrają na Wimbledonie.", "inny_sport"],
        ["Clair Obscur oraz Expedition 33 na Game Pass.", "gry"],
        ["Claude i Gemini pomagają pisać prompty.", "technologia"],
        ["Villeneuve i Nolan kręcą filmy, czekam na zwiastun.", "film"],
        ["Podsiadło i Sanah wydali nowe utwory.", "muzyka"]
    ]) assert.equal(categoryContext.categorizeText(text), category, text);
});
