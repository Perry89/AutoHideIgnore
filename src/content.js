const isFirefox = typeof browser !== "undefined";
const ext = isFirefox ? browser : chrome;

const STORAGE_KEYS = {
    hideXPostsEnabled: "hideXPostsEnabled",
    borneoTranslatorEnabled: "borneoTranslatorEnabled",
    categories: "ignoredCategories",
    categorizationEnabled: "categorizationEnabled",
    mentionIgnoreEnabled: "mentionIgnoreEnabled",
    userIds: "ignoredUserIds",
    usernames: "ignoredUsernames"
};

let ignoredUserIdsCache = new Set();
let ignoredUsernamesCache = new Set();
let usernameToIdMap = new Map();

const SITE_IGNORED_COMMENT_SELECTOR = ".comment--ignored, .comment--hidden, .comment-hidden, .comment[class*='ignored']";
const HOT_DISCUSSION_SELECTOR = [
    "a.item[href*='/la-rambla/dyskusja-']",
    ".hot-discussions a[href*='/la-rambla/dyskusja-']",
    ".hot-discussions__item[href*='/la-rambla/dyskusja-']",
    ".hot-discussions__item a[href*='/la-rambla/dyskusja-']",
    ".hot-discussion[href*='/la-rambla/dyskusja-']",
    ".hot-discussion a[href*='/la-rambla/dyskusja-']"
].join(",");
const COMMENT_AUTHOR_SELECTOR = [
    ".comment__meta .author__name",
    ".comment__author .author__name",
    ".comment__author a[href*='/user/']",
    ".comment__meta a[href*='/user/']",
    ".author__name",
    ".comment__author"
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
        "pis", "ko", "kpo", "ue", "usa", "onz", "nato", "tk", "tsue", "sn", "nsa",
        "wybor", "rzad", "unia europejska", "bruksela", "platform", "obywatelsk",
        "konfederacj", "lewic", "psl", "kukiz", "holown", "trzecia droga", "polska 2050",
        "razem", "korona polska", "nowa nadzieja", "republikan", "demokrat",
        "trump", "putin", "biden", "obama", "zelensk", "orban", "medwiediew", "medvedev",
        "netanjahu", "netanyahu", "nataniahu", "lukaszenk", "macron", "merz", "scholz",
        "polityk", "politycz", "sejm", "senat", "prezydent", "minister", "premier",
        "posel", "poslow", "poslan", "senator", "parti", "opozycj", "koalicj", "parlament",
        "ustaw", "glosowan", "referend", "kampania wyborcza", "demokracj", "autokracj",
        "praworzadn", "trybunal", "konstytucj", "wet", "immunitet", "prokuratur",
        "sadown", "sedziowie tk", "neosedz", "krs", "nominacje sedziowskie", "ordynacj",
        "podat", "budzet panstwa", "deficyt", "inflacj", "akcyz", "vat", "pit", "cit",
        "nbp", "rpp", "glapinsk", "stopy procentowe", "skarbu panstwa", "samorzad",
        "wojn", "zbrojen", "wojsk", "sankcj", "dyplomacj", "ambasador", "kreml",
        "rosj", "ukrain", "iran", "izrael", "palestyn", "gaza", "hamas", "hezbollah",
        "imigracj", "migracj", "uchodzc", "deportacj", "prawic", "lewactw",
        "liberal", "konserwat", "ideologi", "propagand", "nacjonal", "faszy",
        "komuniz", "komunist", "socjaliz", "geopolity", "suwerenn",
        "kaczynsk", "tusk", "morawieck", "duda", "dudy", "dudzie", "ziobr", "bosak",
        "mentzen", "trzaskowsk", "nawrock", "braun", "korwin", "macierewicz",
        "pawlowicz", "piotrowicz", "swieczkowsk", "przylebsk", "czarzast", "zandberg",
        "biedron", "kosiniak", "kamysz", "sikorsk", "kierwinsk", "zurek", "sakiewicz",
        "protest", "strajk", "manifestacj", "polaryzacj", "dekomunizacj", "cenzur",
        "prawa czlowieka", "prawa kobiet", "aborcj", "lgbt", "zwiazki partnerskie",
        "nord stream", "zielony lad", "pakt migracyjny", "fundusz spojnosci", "ets"
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
        "fabrizio", "romano",
        "wolny agent", "free agent", "opcje wykupu", "opcja wykupu", "here we go", "salary cap", "posrednik", "odstepn", "prowizj", "amortyzacj", "deco", "laporta", "comunicado oficial"
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
        "klopp", "mourinho", "xavi", "arteta", "tenhag", "tuchel", "flick",
        "kounde", "cubarsi", "balde", "olmo", "fermin", "szczesn", "ter stegen", "cancelo", "rashford", "dani alves", "superpuchar", "ekstraklas", "dogrywk", "dwumecz", "el clasico", "rzut karny", "liga mistrzow", "liga europy", "czyste konto", "de jong", "real madryt", "premier league", "serie a"
    ],
    plotki: [
        "plotk", "media", "donies", "poglosk", "info", "zrodl", "twitter",
        "xcom", "przeciek", "spekulacj", "rumor", "insider", "leak",
        "nieoficjaln", "wedlug", "podobno", "rzekom", "sensacj", "temat",
        "drama",
        "dement", "potwierdzone zrodlo", "niepotwierdzon", "spekuluj", "rewelacj", "sensacyj"
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
        "padel", "snooker", "darts",
        "swiatek", "sabalenk", "hurkacz", "djokovic", "alcaraz", "sinner", "wimbledon", "roland garros", "grand slam", "verstappen", "hamilton", "norris", "leclerc", "grand prix", "paddock", "pit stop", "bolid", "sety", "tie-break", "zagryw", "rozgrywajacy", "trojskok", "diamentowa liga", "us open", "australian open"
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
        "lag", "ping", "dlc", "earlyaccess", "gamepass", "esport", "streamer",
        "wiedzmin", "baldur", "hollow knight", "silksong", "clair obscur", "expedition 33", "hades", "god of war", "red dead", "hogwarts", "assassin", "battlefield", "counter strike", "helldivers", "demon souls", "game pass", "steam deck", "dual sense", "dualsense", "gameplay", "ray tracing", "trofeum", "osiagniecia"
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
        "startup", "saas", "devops", "docker", "kubernetes", "git", "release",
        "gemini", "claude", "copilot", "deepseek", "grok", "perplexity", "sztuczna inteligencja", "uczenie maszynowe", "prompt", "token", "geforce", "radeon", "ryzen", "intel", "nvidia", "snapdragon", "bluetooth", "wi-fi", "router", "swiatlowod", "oled", "usb", "hdmi", "powerbank", "smartwatch", "prywatnosc", "szyfrowan", "rozszerzen", "wtyczk"
    ],
    film: [
        "film", "serial", "odcink", "sezon", "kino", "netflix", "hbo",
        "disney", "prime", "amazon", "appletv", "aktor", "aktork", "rezyser",
        "scenarz", "premier", "zwiastun", "trailer", "casting", "rola",
        "komedi", "dramat", "horror", "thriller", "animacj", "fantasy",
        "scifi", "marvel", "dc", "starwars", "lotr", "ocen", "recenzj",
        "opini", "rating", "oglada", "obejrz", "watch", "stream", "boxoffice",
        "produkcj", "oscary", "emmy", "kanal", "showrunner", "spin-off",
        "adaptacj", "dubbing", "lektor",
        "max", "skyshowtime", "canal+", "vod", "miniserial", "filmograf", "kinematograf", "scenariusz", "scenopis", "oscar", "zlote globy", "cannes", "villeneuve", "nolan", "tarantino", "scorsese", "diuna", "breaking bad", "better call saul", "gra o tron", "wladca pierscieni", "mroczny rycerz"
    ],
    muzyka: [
        "muzyk", "piosenk", "album", "singl", "koncert", "artyst", "teledysk",
        "rap", "hiphop", "rock", "pop", "metal", "trap", "electro", "techno",
        "house", "jazz", "spotify", "youtube", "soundcloud", "tidal", "bit",
        "produkcj", "mix", "master", "trasa", "tour", "festival", "festiwal",
        "refren", "zwrotk", "tekst", "feat", "collab", "drop", "hit", "wokal",
        "instrument", "gitara", "perkusj", "pianin", "playlist", "vinyl",
        "winyl", "dj", "remix", "sample", "epka", "label", "wytworn",
        "sluchaw", "slucham", "sluchac", "utwor", "plyta", "plyty", "dyskograf", "kompozyt", "spiew", "brzmien", "melodi", "gitarzyst", "basist", "open er", "opener", "eurowizj", "grammy", "sanah", "podsiadlo", "kwiat jabloni", "taco", "quebonafide", "kendrick", "eminem", "metallica", "radiohead", "linkin park"
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
    const username = normalize(value)
        .replace(/^@+/, "")
        .trim();
    const match = username.match(/[a-z0-9][\w.-]*/);
    return match ? match[0] : "";
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
    return usernameFromHref(el.getAttribute("href")) ||
        normalizeUsername(
            el.getAttribute("data-username") ||
            el.getAttribute("title") ||
            el.textContent
        );
}

function usernameSearchText(value) {
    return normalize(value)
        .replace(/[^\w.-]+/g, " ")
        .trim();
}

function textContainsUsername(text, username) {
    if (!username) return false;
    return ` ${usernameSearchText(text)} `.includes(` ${username} `);
}

function userIdFromElement(el) {
    if (!el) return "";
    const source = el.closest("[data-user-id], [user-id]") || el;
    return String(source.getAttribute("data-user-id") || source.getAttribute("user-id") || "");
}

function commentContent(comment) {
    return Array.from(comment.children).find(child => child.classList?.contains("comment__content")) ||
        comment.querySelector(".comment__content");
}

function commentAuthor(comment) {
    return comment.querySelector(COMMENT_AUTHOR_SELECTOR);
}

function commentAuthorScope(comment) {
    return comment.querySelector(".comment__header, .comment__meta, .comment__author") || commentAuthor(comment);
}

function ignoredCommentMarkerText(comment) {
    // An authored comment can quote the site's ignored-user notice verbatim.
    // Read only its own header; never infer ignore state from message/reply text.
    const header = ownCommentNode(comment, ".comment__header");
    if (header) return normalize(header.textContent || "").trim();
    if (ownCommentNode(comment, ".comment__content")) return "";
    // Some site placeholders are bare cards without a header or content wrapper.
    const copy = comment.cloneNode(true);
    copy.querySelectorAll(".comment, .comment__content").forEach(node => node.remove());
    return normalize(copy.textContent || "").trim();
}

function isSiteIgnoredComment(comment) {
    if (comment.matches(SITE_IGNORED_COMMENT_SELECTOR)) return true;
    return /^komentarz uzytkownika\s+.+?[,]?\s+ktorego ignorujesz\b/.test(ignoredCommentMarkerText(comment));
}

function ignoredUsernameFromCommentText(comment) {
    if (!isSiteIgnoredComment(comment)) return "";
    const match = ignoredCommentMarkerText(comment)
        .match(/^komentarz uzytkownika\s+([^,.\n]+?)\s*,?\s+ktorego ignorujesz/);
    return match ? normalizeUsername(match[1]) : "";
}

function normalCommentAuthorContainsUsername(comment, username) {
    if (!username || isSiteIgnoredComment(comment)) return false;

    const authorScope = commentAuthorScope(comment);
    return Boolean(authorScope && textContainsUsername(authorScope.textContent, username));
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

function pruneUnmappedIgnoredUserIds() {
    let changed = false;
    const mappedIds = new Set();

    ignoredUsernamesCache.forEach(username => {
        const id = usernameToIdMap.get(username);
        if (id) mappedIds.add(id);
    });

    Array.from(ignoredUserIdsCache).forEach(id => {
        if (!mappedIds.has(id)) {
            changed = deleteIgnoredUserId(id) || changed;
        }
    });

    return changed;
}

function collectCommentAuthor(comment, target) {
    const author = commentAuthor(comment);
    const username = usernameFromElement(author);
    const id = userIdFromElement(author);

    if (username) target.usernames.add(username);
    if (id) target.userIds.add(id);
    if (id && username) usernameToIdMap.set(username, id);
}

function removeVisibleCachedAuthor(comment, ignored) {
    const scope = commentAuthorScope(comment);
    if (!scope) return false;

    let changed = false;
    const author = commentAuthor(comment);
    const username = usernameFromElement(author) || usernameFromElement(scope);
    const id = userIdFromElement(author) || userIdFromElement(scope);

    if (username && !ignored.usernames.has(username)) {
        changed = deleteIgnoredUsername(username) || changed;
        changed = deleteIgnoredUserId(usernameToIdMap.get(username)) || changed;
    }

    if (id && !ignored.userIds.has(id)) {
        changed = deleteIgnoredUserId(id) || changed;
    }

    Array.from(ignoredUsernamesCache).forEach(cachedUsername => {
        if (!ignored.usernames.has(cachedUsername) && normalCommentAuthorContainsUsername(comment, cachedUsername)) {
            changed = deleteIgnoredUsername(cachedUsername) || changed;
            changed = deleteIgnoredUserId(usernameToIdMap.get(cachedUsername)) || changed;
        }
    });

    return changed;
}

function updateIgnoredUsersFromDOM() {
    let changed = false;
    const ignored = { userIds: new Set(), usernames: new Set() };
    const visible = { userIds: new Set(), usernames: new Set() };

    document.querySelectorAll(".comment").forEach(comment => {
        const ignoredUsername = ignoredUsernameFromCommentText(comment);
        const isIgnored = isSiteIgnoredComment(comment) || Boolean(ignoredUsername);
        if (isIgnored) {
            collectCommentAuthor(comment, ignored);
            if (ignoredUsername) ignored.usernames.add(ignoredUsername);
        } else {
            collectCommentAuthor(comment, visible);
        }
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

    document.querySelectorAll(".comment").forEach(comment => {
        if (isSiteIgnoredComment(comment)) return;
        changed = removeVisibleCachedAuthor(comment, ignored) || changed;
    });

    changed = pruneUnmappedIgnoredUserIds() || changed;

    if (changed) saveIgnoredUsersToStorage();
}

function removeIgnoredComments() {
    document
        .querySelectorAll(SITE_IGNORED_COMMENT_SELECTOR)
        .forEach(comment => comment.remove());

    document
        .querySelectorAll(".comment")
        .forEach(comment => {
            if (isSiteIgnoredComment(comment)) comment.remove();
        });
}

function categorizeText(text) {
    // Ignore links and mentions: classify the message, not a username or URL.
    const normalized = normalize(text).replace(/https?:\/\/\S+|www\.\S+|@[\w.-]+/g, " ");
    const words = normalized.replace(/[^\w\s-]/g, " ").split(/\s+/).filter(Boolean);
    const sentence = ` ${words.join(" ")} `;
    let bestCategory = "inny";
    let bestScore = 0;

    for (const category of categoryOrder) {
        let matchCount = 0;
        const uniqueKeywords = new Set(categories[category].map(normalize));

        uniqueKeywords.forEach(keyword => {
            const matched = keyword.includes(" ")
                ? sentence.includes(` ${keyword} `)
                : keyword.length <= 3
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

    const label = document.createElement("span");
    label.className = "la-rambla-cleaner-category-label";
    label.textContent = category;
    meta.classList.add("la-rambla-cleaner-meta");

    const links = meta.querySelector(".links");
    if (links?.parentNode) {
        links.parentNode.insertBefore(label, links.nextSibling);
    } else {
        meta.appendChild(label);
    }
}

function isIgnoredMention(el) {
    const link = el.matches("a[href*='/user/']") ? el : el.querySelector("a[href*='/user/']");
    const username = usernameFromHref(link?.getAttribute("href")) || usernameFromElement(el);
    const id = userIdFromElement(el);
    return ignoredUsernamesCache.has(username) || (id && ignoredUserIdsCache.has(id));
}

function hasIgnoredMention(content) {
    return Array.from(content.querySelectorAll(".mentioned-user, .mentioned-user a[href*='/user/']"))
        .some(isIgnoredMention);
}

function isIgnoredAuthorElement(el) {
    const username = usernameFromElement(el);
    const id = userIdFromElement(el);
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

// Only inspect nodes owned by this comment, never an author from a nested reply.
function ownCommentNode(comment, selector) {
    return Array.from(comment.querySelectorAll(selector))
        .find(node => node.closest(".comment") === comment);
}

const borneoOriginalContents = new WeakMap();

function hasXPost(comment) {
    const selectors = [
        ".twitter-tweet", ".twitter-tweet-rendered", "twitter-widget",
        'iframe[src^="https://platform.twitter.com/embed/"]',
        'iframe[src^="https://platform.x.com/embed/"]'
    ].join(",");
    // A post in a nested reply must not hide the parent comment.
    if (ownCommentNode(comment, selectors)) return true;
    // Firefox can replace the widget markup with its tracking-protection placeholder.
    // The post's permalink remains available, including before the widget loads.
    return Array.from(comment.querySelectorAll("a[href]")).some(link => {
        if (link.closest(".comment") !== comment) return false;
        try {
            const url = new URL(link.getAttribute("href"), "https://www.fcbarca.com");
            return /^(www\.|mobile\.)?(twitter\.com|x\.com)$/i.test(url.hostname) &&
                /^\/(?:[^/]+\/status|i\/web\/status)\/\d+(?:\/|$)/.test(url.pathname);
        } catch {
            return false;
        }
    });
}

function renderBorneoCorrection(content, translation) {
    const originalLinks = new Map();
    content.querySelectorAll("a[href]").forEach(link => {
        const href = link.getAttribute("href");
        if (!/^(https?:\/\/|\/user\/)/i.test(href || "")) return;
        originalLinks.set(link.textContent.trim().toLowerCase(), link);
        originalLinks.set(href, link);
    });
    const paragraph = document.createElement("p");
    paragraph.style.whiteSpace = "pre-wrap";
    // Build DOM nodes from plain text. Never interpret model output as HTML.
    const tokens = /(?:https?:\/\/|www\.)[^\s<>]+|@[\p{L}\p{N}_.-]+/gu;
    let offset = 0;
    for (const match of translation.matchAll(tokens)) {
        paragraph.append(document.createTextNode(translation.slice(offset, match.index)));
        let token = match[0];
        let suffix = "";
        if (/^(https?:|www\.)/i.test(token)) {
            const trimmed = token.replace(/[.,;:!?)}\]]+$/, "");
            suffix = token.slice(trimmed.length);
            token = trimmed;
        }
        const original = originalLinks.get(token.toLowerCase()) || originalLinks.get(token);
        let node;
        if (original) {
            const mention = original.closest(".mentioned-user");
            node = (mention && content.contains(mention) ? mention : original).cloneNode(true);
            const anchor = node.matches("a") ? node : node.querySelector("a");
            if (anchor) anchor.textContent = token;
        } else {
            node = document.createElement("a");
            node.textContent = token;
            if (token.startsWith("@")) {
                node.href = `/user/${encodeURIComponent(token.slice(1))}`;
                node.className = "mentioned-user";
            } else {
                node.href = token.startsWith("www.") ? `https://${token}` : token;
                node.target = "_blank";
                node.rel = "noopener noreferrer";
            }
        }
        paragraph.append(node, document.createTextNode(suffix));
        offset = match.index + match[0].length;
    }
    paragraph.append(document.createTextNode(translation.slice(offset)));
    if (!borneoOriginalContents.has(content)) {
        borneoOriginalContents.set(content, Array.from(content.childNodes));
    }
    content.replaceChildren(paragraph);
}

function updateBorneoTranslator(comment, enabled) {
    const existing = ownCommentNode(comment, ".borneo-translator");
    const author = ownCommentNode(comment, COMMENT_AUTHOR_SELECTOR);
    const content = ownCommentNode(comment, ".comment__content");
    if (!enabled || !/^comment-\d+$/.test(comment.id) ||
        usernameFromElement(author) !== "borneo" || !content) {
        existing?.remove();
        if (content && borneoOriginalContents.has(content)) {
            content.replaceChildren(...borneoOriginalContents.get(content));
            borneoOriginalContents.delete(content);
        }
        return;
    }
    if (existing) return;

    const panel = document.createElement("div");
    panel.className = "borneo-translator";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Przetłumacz";
    button.className = "button button--small";
    const output = document.createElement("div");
    output.setAttribute("role", "status");
    output.setAttribute("aria-live", "polite");
    output.style.whiteSpace = "pre-wrap";
    output.style.fontSize = "12px";
    panel.append(button, output);
    // Place the controls beside the category in this comment's header.
    const meta = ownCommentNode(comment, ".comment__meta");
    if (!meta) return;
    meta.classList.add("la-rambla-cleaner-meta");
    const category = meta.querySelector(".la-rambla-cleaner-category-label");
    const links = meta.querySelector(".links");
    if (category) category.after(panel);
    else if (links) links.after(panel);
    else meta.appendChild(panel);
    button.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();
        const copy = content.cloneNode(true);
        copy.querySelectorAll(".comment, script, style, .borneo-translator").forEach(node => node.remove());
        copy.querySelectorAll("br").forEach(node => node.replaceWith("\n"));
        const text = (copy.innerText || copy.textContent || "").trim();
        if (!text) return;
        button.disabled = true;
        output.textContent = "Poprawianie komentarza…";
        try {
            const result = await ext.runtime.sendMessage({ type: "translateBorneo", commentId: comment.id, text });
            if (result?.error) throw new Error(result.error);
            if (!result?.translation) throw new Error("Brak poprawionej wersji komentarza.");
            // A disabled feature must not apply an in-flight response.
            if (!panel.isConnected || !await storageGet(STORAGE_KEYS.borneoTranslatorEnabled, true)) return;
            renderBorneoCorrection(content, result.translation);
            output.textContent = "";
            button.textContent = "Przetłumaczono";
        } catch (error) {
            output.textContent = error.message || "Nie udało się poprawić komentarza. Spróbuj ponownie.";
            button.disabled = false;
        }
    });
}

async function processComments() {
    try {
        if (!isExtensionAlive()) return;

        updateUsernameMap();
        updateIgnoredUsersFromDOM();
        removeIgnoredComments();

        const [enabled, mentionEnabled, ignoredCategories, borneoEnabled, hideXPosts] = await Promise.all([
            getCategorizationEnabled(),
            getMentionIgnoreEnabled(),
            getIgnoredCategories(),
            storageGet(STORAGE_KEYS.borneoTranslatorEnabled, true),
            storageGet(STORAGE_KEYS.hideXPostsEnabled, false)
        ]);

        const comments = document.querySelectorAll(".comment");

        comments.forEach(comment => {
            if (hideXPosts && hasXPost(comment)) {
                comment.style.display = "none";
                return;
            }
            updateBorneoTranslator(comment, borneoEnabled);
            const content = commentContent(comment);
            if (!content) return;

            if (mentionEnabled && hasIgnoredMention(content)) {
                comment.style.display = "none";
                return;
            }

            if (!enabled) {
                comment.style.display = "";
                comment.querySelector(".la-rambla-cleaner-category-label")?.remove();
                return;
            }

            const category = categorizeText(content.innerText || "");
            comment.style.display = ignoredCategories.includes(category) ? "none" : "";

            const label = comment.querySelector(".la-rambla-cleaner-category-label");
            if (label) {
                if (label.textContent !== category) label.textContent = category;
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

ext.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes.borneoTranslatorEnabled || changes.hideXPostsEnabled)) processComments();
});

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
