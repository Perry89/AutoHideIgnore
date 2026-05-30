const isFirefox = typeof browser !== "undefined";
const ext = isFirefox ? browser : chrome;

const STORAGE_KEYS = {
    categories: "ignoredCategories",
    categorizationEnabled: "categorizationEnabled",
    mentionIgnoreEnabled: "mentionIgnoreEnabled",
    userIds: "ignoredUserIds",
    usernames: "ignoredUsernames"
};

let ignoredUserIdsCache = new Set();
let ignoredUsernamesCache = new Set();
let usernameToIdMap = new Map();

const SITE_IGNORED_COMMENT_SELECTOR = ".comment--ignored, .comment--hidden, .comment-hidden";
const HOT_DISCUSSION_SELECTOR = [
    "a.item[href*='/la-rambla/dyskusja-']",
    ".hot-discussions a[href*='/la-rambla/dyskusja-']",
    ".hot-discussions__item[href*='/la-rambla/dyskusja-']",
    ".hot-discussions__item a[href*='/la-rambla/dyskusja-']",
    ".hot-discussion[href*='/la-rambla/dyskusja-']",
    ".hot-discussion a[href*='/la-rambla/dyskusja-']"
].join(",");

const categoryOrder = [
    "polityka",
    "transfery",
    "football",
    "plotki",
    "inny_sport",
    "gry",
    "technologia",
    "film",
    "muzyka"
];

const thresholds = {
    polityka: 2,
    transfery: 2,
    football: 2,
    plotki: 2,
    inny_sport: 2,
    gry: 2,
    technologia: 2,
    film: 2,
    muzyka: 2
};

const categories = {
    polityka: [
        "pis", "po", "ko", "kpo", "wybor", "rzad", "ue", "unia", "bruksela",
        "platform", "obywatelsk", "konfederacj", "lewica", "psl", "kukiz",
        "holown", "trzeciadrog", "trzecdrog", "trump", "putin", "biden",
        "obama", "zelensk", "orban", "polityk", "sejm", "senat", "prezydent",
        "minister", "premier", "parti", "opozycj", "koalicj", "parlament",
        "ustaw", "glosowan", "posel", "senator", "kampan", "demokracj",
        "praworzadn", "trybunal", "sad", "konstytucj", "podat", "budzet",
        "inflacj", "gospodark", "nato", "wojn", "sankcj", "dyplomacj",
        "imigracj", "uchodzc", "granica", "bezpieczenstw", "prawic",
        "lewactw", "liberal", "konserwat", "ideologi", "propagand",
        "narracj", "republik", "tvp", "tvn", "media", "dziennikarz",
        "owsiak", "kaczynsk", "tusk", "morawieck", "dud", "ziobr", "bosak",
        "mentzen", "trzaskowsk", "nawrock", "protest", "strajk",
        "manifestacj", "marsz", "wyrok", "hejt", "atak", "podzial",
        "spoleczenstw", "polaryzacj", "wosp", "fundacj", "zbiork"
    ],
    transfery: [
        "transfer", "kontrakt", "kup", "sprzed", "wypozycz", "okno",
        "ofert", "podpis", "negocjacj", "klauzul", "wykup", "mln",
        "milion", "kwot", "euro", "pensj", "zarobk", "budzet", "finaliz",
        "dogad", "porozumien", "ustal", "potwierdz", "oficjaln", "testy",
        "medyczn", "laczon", "interesuj", "celuj", "monitoruj", "scout",
        "agent", "odejsc", "przejsc", "dolacz", "wrac", "zostaj",
        "przedluz", "rejestracj", "zgloszen", "wzmocn", "zakup", "sprzedaz",
        "wypozyczen", "wolnyagent", "freeagent", "deadline", "mercato",
        "fabrizio", "romano"
    ],
    football: [
        "mecz", "gol", "asyst", "wynik", "bramk", "strzel", "wygran",
        "przegran", "remis", "liga", "punkt", "pkt", "sklad", "trener",
        "sedzi", "var", "spalony", "rzutkarn", "karn", "rozn", "pressing",
        "posiadan", "obron", "defensyw", "atak", "napastnik", "pomocnik",
        "bramkarz", "strata", "czystekont", "punkty", "tabela", "kolejk",
        "sezon", "pilkarz", "kartk", "czerwon", "zolt", "puchar", "lm",
        "champions", "barca", "barcelon", "realmadryt", "realmadrid", "real",
        "atleti", "atletico", "obronc", "skrzydl", "forma", "kontuzj",
        "powrot", "lawk", "yamal", "raphinh", "pedri", "gavi", "dejong",
        "araujo", "lewandowsk", "laliga", "premierleague", "bundeslig",
        "seriea", "ligue1", "championsleague", "ucl", "europaleague",
        "chelsea", "arsenal", "liverpool", "manchester", "city", "united",
        "psg", "bayern", "dortmund", "juventus", "milan", "inter", "napoli",
        "roma", "legia", "lech", "wisla", "rakow", "pogon", "messi",
        "ronaldo", "mbappe", "haaland", "vinicius", "bellingham", "neymar",
        "modric", "kane", "salah", "debruyne", "guardiol", "ancelotti",
        "klopp", "mourinho", "xavi", "arteta", "tenhag", "tuchel", "flick"
    ],
    plotki: [
        "plotk", "media", "donies", "poglosk", "info", "zrodl", "twitter",
        "xcom", "przeciek", "spekulacj", "rumor", "insider", "leak",
        "nieoficjaln", "wedlug", "podobno", "rzekom", "sensacj", "temat",
        "drama"
    ],
    inny_sport: [
        "nba", "koszyk", "siatkowk", "tenis", "atp", "wta", "f1", "formula",
        "ufc", "mma", "boks", "olimpiad", "lekkoatlet", "narciarstw",
        "hokej", "handball", "pilkareczn", "reczn", "rugby", "baseball", "softball",
        "motogp", "rajd", "wrc", "indycar", "lemans", "skok", "biathlon",
        "snowboard", "lyzwiarstw", "curling", "maraton", "biegan", "sprint",
        "rzut", "skokwzwyz", "skokwdal", "kickbox", "judo", "zapasy",
        "taekwondo", "plywan", "wioslarstw", "zeglarstw", "kajak",
        "kolarstw", "tour", "tdf", "zawody", "turniej", "final", "medal",
        "rekord", "kwalifikacj", "ranking", "motorsport", "dakar", "nascar",
        "padel", "snooker", "darts"
    ],
    gry: [
        "gra", "gry", "gaming", "zapis", "save", "savegame", "checkpoint",
        "poziom", "level", "kamera", "fps", "rpg", "mmo", "moba", "bug",
        "patch", "update", "quest", "misj", "map", "mapa", "respawn",
        "loot", "drop", "skill", "skil", "exp", "xp", "hp", "mana", "dmg",
        "build", "perk", "craft", "crafting", "inventory", "ekwipunek",
        "zombi", "zombie", "boss", "npc", "enemy", "cutscen", "dialog",
        "fabula", "steam", "ps", "ps4", "ps5", "xbox", "playstation",
        "nintend", "switch", "pc", "konsol", "capcom", "cdprojekt", "cdpr",
        "riot", "blizzard", "ubisoft", "bethesda", "rockstar", "epic",
        "resident", "evil", "witcher", "cyberpunk", "gta", "fifa", "cod",
        "fortnite", "minecraft", "elden", "ring", "darksouls", "valorant",
        "league", "legends", "dota", "singleplayer", "multiplayer", "coop",
        "online", "ranked", "matchmaking", "grindow", "farm", "noob", "pro",
        "meta", "nerf", "buff", "grafik", "rozdzielcz", "optymalizacj",
        "lag", "ping", "dlc", "earlyaccess", "gamepass", "esport", "streamer"
    ],
    technologia: [
        "ai", "sztuczn", "inteligen", "chatgpt", "openai", "model", "llm",
        "algorytm", "automat", "machinelearn", "google", "apple", "microsoft",
        "meta", "facebook", "amazon", "android", "ios", "windows", "linux",
        "macos", "telefon", "smartfon", "komputer", "laptop", "tablet",
        "monitor", "klawiatur", "myszk", "procesor", "cpu", "gpu", "ram",
        "dysk", "ssd", "hdd", "karta", "chip", "internet", "stron", "www",
        "przegladark", "chrome", "firefox", "aplikacj", "program", "kod",
        "dev", "backend", "frontend", "api", "framework", "repo", "github",
        "cyberbezpieczenstw", "haker", "hack", "phishing", "vpn", "haslo",
        "cloud", "serwer", "hosting", "baza", "dane", "aktualizacj", "blad",
        "ios", "iphone", "samsung", "tesla", "crypto", "bitcoin", "blockchain",
        "startup", "saas", "devops", "docker", "kubernetes", "git", "release"
    ],
    film: [
        "film", "serial", "odcink", "sezon", "kino", "netflix", "hbo",
        "disney", "prime", "amazon", "appletv", "aktor", "aktork", "rezyser",
        "scenarz", "premier", "zwiastun", "trailer", "casting", "rola",
        "komedi", "dramat", "horror", "thriller", "animacj", "fantasy",
        "scifi", "marvel", "dc", "starwars", "lotr", "ocen", "recenzj",
        "opini", "rating", "oglada", "obejrz", "watch", "stream", "boxoffice",
        "produkcj", "oscary", "emmy", "kanal", "showrunner", "spin-off",
        "adaptacj", "dubbing", "lektor"
    ],
    muzyka: [
        "muzyk", "piosenk", "album", "singl", "koncert", "artyst", "teledysk",
        "rap", "hiphop", "rock", "pop", "metal", "trap", "electro", "techno",
        "house", "jazz", "spotify", "youtube", "soundcloud", "tidal", "bit",
        "produkcj", "mix", "master", "trasa", "tour", "festival", "festiwal",
        "refren", "zwrotk", "tekst", "feat", "collab", "drop", "hit", "wokal",
        "instrument", "gitara", "perkusj", "pianin", "playlist", "vinyl",
        "winyl", "dj", "remix", "sample", "epka", "label", "wytworn"
    ]
};

function isExtensionAlive() {
    try {
        return Boolean(ext?.runtime?.id);
    } catch {
        return false;
    }
}

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[ąćęłńóśżź]/g, c => ({
            "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n",
            "ó": "o", "ś": "s", "ż": "z", "ź": "z"
        }[c]))
        .replace(/&nbsp;/g, " ");
}

function normalizeUsername(value) {
    return normalize(value)
        .replace(/^@+/, "")
        .replace(/[^\w.-]/g, "")
        .trim();
}

async function storageGet(key, fallback) {
    try {
        if (!ext?.storage?.local) return fallback;
        const res = await ext.storage.local.get(key);
        return res?.[key] ?? fallback;
    } catch (e) {
        console.warn(`${key} read failed:`, e);
        return fallback;
    }
}

async function storageSet(values) {
    try {
        if (ext?.storage?.local) await ext.storage.local.set(values);
    } catch (e) {
        console.warn("Storage write failed:", e);
    }
}

async function loadIgnoredUsersFromStorage() {
    const [ids, usernames] = await Promise.all([
        storageGet(STORAGE_KEYS.userIds, []),
        storageGet(STORAGE_KEYS.usernames, [])
    ]);

    ignoredUserIdsCache = new Set(ids.map(String));
    ignoredUsernamesCache = new Set(usernames.map(normalizeUsername).filter(Boolean));
}

function saveIgnoredUsersToStorage() {
    storageSet({
        [STORAGE_KEYS.userIds]: Array.from(ignoredUserIdsCache),
        [STORAGE_KEYS.usernames]: Array.from(ignoredUsernamesCache)
    });
}

function usernameFromHref(href) {
    const match = String(href || "").match(/\/user\/([^/?#]+)/i);
    return match ? normalizeUsername(decodeURIComponent(match[1])) : "";
}

function usernameFromElement(el) {
    if (!el) return "";
    return normalizeUsername(
        el.getAttribute("data-username") ||
        el.getAttribute("title") ||
        el.textContent ||
        usernameFromHref(el.getAttribute("href"))
    );
}

function updateUsernameMap() {
    document.querySelectorAll(".mentioned-user").forEach(el => {
        const id = el.getAttribute("user-id");
        const username = normalizeUsername(el.textContent);
        if (id && username) usernameToIdMap.set(username, String(id));
    });
}

function addIgnoredUsername(username) {
    if (!username || ignoredUsernamesCache.has(username)) return false;
    ignoredUsernamesCache.add(username);
    return true;
}

function addIgnoredUserId(id) {
    if (!id || ignoredUserIdsCache.has(String(id))) return false;
    ignoredUserIdsCache.add(String(id));
    return true;
}

function deleteIgnoredUsername(username) {
    if (!username || !ignoredUsernamesCache.has(username)) return false;
    ignoredUsernamesCache.delete(username);
    return true;
}

function deleteIgnoredUserId(id) {
    const normalizedId = String(id || "");
    if (!normalizedId || !ignoredUserIdsCache.has(normalizedId)) return false;
    ignoredUserIdsCache.delete(normalizedId);
    return true;
}

function collectCommentUsers(comment, target, includeMentions = true) {
    const author = comment.querySelector(".author__name, .comment__author, a[href*='/user/']");
    const username = usernameFromHref(author?.getAttribute("href")) || usernameFromElement(author);
    if (username) target.usernames.add(username);

    if (!includeMentions) return;

    comment.querySelectorAll(".mentioned-user").forEach(el => {
        const id = el.getAttribute("user-id");
        const mentionedUsername = usernameFromElement(el);

        if (id) target.userIds.add(String(id));
        if (mentionedUsername) target.usernames.add(mentionedUsername);
        if (id && mentionedUsername) usernameToIdMap.set(mentionedUsername, String(id));
    });
}

function updateIgnoredUsersFromDOM() {
    let changed = false;
    const ignored = { userIds: new Set(), usernames: new Set() };
    const visible = { userIds: new Set(), usernames: new Set() };

    document.querySelectorAll(".comment").forEach(comment => {
        const isIgnored = comment.matches(SITE_IGNORED_COMMENT_SELECTOR);
        collectCommentUsers(comment, isIgnored ? ignored : visible, isIgnored);
    });

    ignored.usernames.forEach(username => {
        changed = addIgnoredUsername(username) || changed;
    });

    ignored.userIds.forEach(id => {
        changed = addIgnoredUserId(id) || changed;
    });

    visible.usernames.forEach(username => {
        if (!ignored.usernames.has(username)) {
            changed = deleteIgnoredUsername(username) || changed;
            changed = deleteIgnoredUserId(usernameToIdMap.get(username)) || changed;
        }
    });

    visible.userIds.forEach(id => {
        if (!ignored.userIds.has(id)) {
            changed = deleteIgnoredUserId(id) || changed;
        }
    });

    if (changed) saveIgnoredUsersToStorage();
}

function removeIgnoredComments() {
    document
        .querySelectorAll(SITE_IGNORED_COMMENT_SELECTOR)
        .forEach(comment => comment.remove());
}

function categorizeText(text) {
    const normalized = normalize(text);
    const words = normalized.replace(/[^\w\s-]/g, " ").split(/\s+/).filter(Boolean);
    let bestCategory = "inny";
    let bestScore = 0;

    for (const category of categoryOrder) {
        let matchCount = 0;
        const uniqueKeywords = new Set(categories[category].map(normalize));

        uniqueKeywords.forEach(keyword => {
            const matched = keyword.length <= 3
                ? words.includes(keyword)
                : words.some(word => word.startsWith(keyword));

            if (matched) matchCount++;
        });

        if (matchCount >= (thresholds[category] || 2) && matchCount > bestScore) {
            bestScore = matchCount;
            bestCategory = category;
        }
    }

    return bestCategory;
}

async function getIgnoredCategories() {
    return storageGet(STORAGE_KEYS.categories, []);
}

async function getCategorizationEnabled() {
    return storageGet(STORAGE_KEYS.categorizationEnabled, true);
}

async function getMentionIgnoreEnabled() {
    return storageGet(STORAGE_KEYS.mentionIgnoreEnabled, false);
}

function addCategoryLabel(comment, category) {
    const meta = comment.querySelector(".comment__meta");
    if (!meta || meta.querySelector(".la-rambla-cleaner-category-label")) return;

    const label = document.createElement("div");
    label.className = "la-rambla-cleaner-category-label";
    label.textContent = category;
    label.style.marginLeft = "10px";
    label.style.fontWeight = "bold";
    label.style.color = "#a21d3d";

    const links = meta.querySelector(".links");
    if (links?.parentNode) {
        links.parentNode.insertBefore(label, links.nextSibling);
    } else {
        meta.appendChild(label);
    }
}

function isIgnoredMention(el) {
    const id = el.getAttribute("user-id");
    const username = usernameFromElement(el);
    return (id && ignoredUserIdsCache.has(String(id))) || ignoredUsernamesCache.has(username);
}

function isIgnoredAuthorElement(el) {
    const username = usernameFromHref(el?.getAttribute("href")) || usernameFromElement(el);
    const id = usernameToIdMap.get(username);
    return ignoredUsernamesCache.has(username) || (id && ignoredUserIdsCache.has(id));
}

function hideHotDiscussionsFromIgnoredUsers() {
    const hotItems = document.querySelectorAll(HOT_DISCUSSION_SELECTOR);

    hotItems.forEach(item => {
        const card = item.matches("a.item, .hot-discussions__item, .hot-discussion")
            ? item
            : item.closest("a.item, .hot-discussions__item, .hot-discussion") || item;
        const author =
            card.querySelector(".item__author .meta, .author__name, a[href*='/user/'], [href*='/user/']") ||
            card.querySelector(".item__author");

        if (isIgnoredAuthorElement(author)) {
            card.remove();
        }
    });
}

async function processComments() {
    try {
        if (!isExtensionAlive()) return;

        updateUsernameMap();
        removeIgnoredComments();

        const [enabled, mentionEnabled, ignoredCategories] = await Promise.all([
            getCategorizationEnabled(),
            getMentionIgnoreEnabled(),
            getIgnoredCategories()
        ]);

        const comments = document.querySelectorAll(".comment");

        if (!enabled) {
            comments.forEach(comment => {
                comment.style.display = "";
                comment.querySelector(".la-rambla-cleaner-category-label")?.remove();
            });
            hideHotDiscussionsFromIgnoredUsers();
            return;
        }

        comments.forEach(comment => {
            const content = comment.querySelector(".comment__content");
            if (!content) return;

            if (mentionEnabled && Array.from(comment.querySelectorAll(".mentioned-user")).some(isIgnoredMention)) {
                comment.style.display = "none";
                return;
            }

            const category = categorizeText(content.innerText || "");
            comment.style.display = ignoredCategories.includes(category) ? "none" : "";

            const label = comment.querySelector(".la-rambla-cleaner-category-label");
            if (label) {
                label.textContent = category;
            } else {
                addCategoryLabel(comment, category);
            }
        });

        hideHotDiscussionsFromIgnoredUsers();
    } catch (e) {
        console.warn("processComments crashed:", e);
    }
}

async function init() {
    await loadIgnoredUsersFromStorage();
    updateUsernameMap();
    updateIgnoredUsersFromDOM();
    removeIgnoredComments();
    processComments();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

ext.runtime.onMessage.addListener(msg => {
    if (msg.type === "updateFilters") processComments();
});

let observerTimeout = null;
const observer = new MutationObserver(() => {
    if (!isExtensionAlive()) return;

    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
        updateIgnoredUsersFromDOM();
        removeIgnoredComments();
        processComments();
    }, 100);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
