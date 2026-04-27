const isFirefox = typeof browser !== "undefined";

const ext = isFirefox ? browser : chrome;
function removeIgnoredComments() {

    const ignored = document.querySelectorAll(
        ".comment--ignored, .comment--hidden, .comment-hidden"
    );

    ignored.forEach(comment => {
        comment.remove();
    });
}
const thresholds = {
    polityka: 2,
    transfery: 2,
    football: 2,          // 👈 important
    plotki: 2,
    inny_sport: 2,
    gry: 2,
    technologia: 2,
    film: 2,
    muzyka: 2
};
function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[ąćęłńóśżź]/g, c => ({
            'ą':'a','ć':'c','ę':'e','ł':'l',
            'ń':'n','ó':'o','ś':'s','ż':'z','ź':'z'
        }[c]));
}
const categories = {

    polityka: [
        "pis", "kpo", "wybor", "rzad", "ue",

        // 🔥 partie PL
        "platform",     // platforma obywatelska
        "obywatelsk",   // obywatelska
        "konfederacj",
        "lewica",
        "psl",
        "kukiz",
        "holown",
        "trzecdrog",    // trzecia droga

        // 🔥 zagraniczne / osoby
        "trump", "putin", "biden", "obama",

        // 🔥 polityka ogólna
        "polityk", "sejm", "senat",
        "prezydent", "minister",
        "parti", "opozycj", "koalicj",
        "parlament",

        // 🔥 system / państwo
        "ustaw", "glosowan", "posel", "senator",
        "kampan", "demokracj", "praworzadn",
        "trybunal", "sad", "konstytucj",

        // 🔥 gospodarka
        "podat", "budzet", "inflacj", "gospodark",

        // 🔥 świat
        "nato", "wojn", "sankcj", "dyplomacj",
        "imigracj", "uchodzc", "granica",
        "bezpieczenstw",
        // 🔥 ideologia / dyskurs
            "prawic", "lewactw", "liberal", "konserwat",
            "ideologi", "propagand", "narracj",

            // 🔥 media polityczne (bardzo ważne)
            "republik",     // TV Republika
            "tvp", "tvn",
            "media", "dziennikarz",

            // 🔥 postacie publiczne (PL kontekst)
            "owsiak",
            "kaczynsk", "tusk", "morawieck", "dud",
            "ziobr", "bosak", "mentzen",

            // 🔥 wydarzenia społeczne
            "protest", "strajk", "manifestacj",
            "marsz", "wyrok",

            // 🔥 emocjonalny język polityczny =
            "hejt", "atak", "podzial",
            "spoleczenstw", "polaryzacj",

            // 🔥 organizacje / inicjatywy
            "wosp",
            "fundacj",
            "zbio rk",
            "strajk", "protest",
            "marsz", "manifestacj"
    ],

transfery: [
    // 🔥 podstawowe
    "transfer", "kontrakt",
    "kup", "sprzed",
    "wypozycz",
    "okno",
    "ofert",
    "podpis",
    "negocjacj",
    "klauzul",
    "wykup",

    // 🔥 pieniądze / warunki
    "mln",            // 50 mln
    "milion",
    "kwot",
    "euro",
    "pensj",          // pensja
    "zarobk",
    "budzet",

    // 🔥 status transferu
    "finaliz",        // finalizacja
    "dogad",          // dogadany
    "porozumien",
    "ustal",          // ustalone warunki
    "potwierdz",      // potwierdzony
    "oficjaln",       // oficjalnie
    "testy",          // testy medyczne
    "medyczn",        // medyczne

    // 🔥 plotki transferowe
    "laczon",         // łączony z klubem
    "interesuj",      // interesuje się
    "celuj",          // cel transferowy
    "monitoruj",      // monitoruje zawodnika
    "scout",
    "agent",

    // 🔥 ruchy kadrowe
    "odejsc",         // odejście
    "przejsc",        // przejście
    "dolacz",         // dołącza
    "wrac",           // wraca z wypożyczenia
    "zostaj",         // zostaje
    "przedluz",       // przedłużenie kontraktu

    // 🔥 dokumenty / formalności
    "rejestracj",
    "zgłoszen",       // zgłoszony do ligi
],

football: [

    // 🔥 ogólne
    "mecz", "gol", "asyst", "wynik",
    "bramk", "strzel",
    "wygran", "przegran", "remis",
    "liga", "punkt", "pkt",
    "sklad", "trener", "sedzi",
"obron",        // obrona, obronę
"defensyw",     // defensywa
"atak",         // atak
"napastnik",
"pomocnik",
"bramkarz",
"strata",       // straty
"czystekont",   // clean sheet (optional)
"punkty",       // variation
"tabela",
"kolejk",       // kolejka
"sezon",
"pilkarz",     // piłkarz, piłkarze
"kartk",       // kartka, kartki
"czerwon",     // czerwona kartka
"zolt",        // żółta kartka
"puchar",      // puchar, pucharowy
"lm",          // Liga Mistrzów skrót
"champions",   // champions league
"barca",       // critical alias
    "barcelon", "barca",
    "realmadryt", "realmadrid", "real",
    "atleti",     // Atletico Madrid
"barca",      // Barcelona
"pomocnik",   // pomocnik, pomocnicy
"obronc",     // obrońca
"napastnik",
"skrzydl",    // skrzydłowy
"sklad",
"sezon",
"forma",
"kontuzj",    // kontuzja
"powrot",     // powrót
"lawk",       // ławka
"yamal",
"raphinh",    // Rapha / Raphinha
"pedri",
"gavi",
"dejong",
"araujo",
"lewandowsk",

    // 🔥 rozgrywki
    "laliga", "premierleague", "bundeslig",
    "seriea", "ligue1",
    "championsleague", "ucl",
    "europaleague",

    // 🔥 kluby (najważniejsze)
    "barcelon", "realmadryt", "realmadrid",
    "atletico", "chelsea",
    "arsenal", "liverpool",
    "manchester", "city", "united",
    "psg", "bayern", "dortmund",
    "juventus", "milan", "inter",
    "napoli", "roma",

    // 🔥 polskie kluby
    "legia", "lech", "wisla",
    "rakow", "pogon",

    // 🔥 piłkarze (top)
    "messi", "ronaldo", "mbappe",
    "haaland", "lewandowsk",
    "vinicius", "bellingham",
    "pedri", "gavi",
    "neymar", "modric",
    "kane", "salah",
    "debruyne",

    // 🔥 trenerzy
    "guardiol", "ancelotti",
    "klopp", "mourinho",
    "xavi", "arteta",
    "tenhag", "tuchel"
],

    plotki: [
        "plotk", "media", "donies",
        "poglosk",
        "info",
        "zrodl",
        "twitter",
        "przeciek",
        "spekulacj",
        "rumor"
    ],

    // 🆕 INNY SPORT
inny_sport: [

    // 🔥 already have (kept)
    "nba", "koszyk", "siatkowk",
    "tenis", "atp", "wta",
    "f1", "formula",
    "ufc", "mma", "boks",
    "olimpiad",
    "lekkoatlet",
    "narciarstw",
    "hokej",

    // 🔥 additional team sports
    "handball", "pilkarczn",   // piłka ręczna
    "rugby",
    "baseball",
    "softball",

    // 🔥 motorsport
    "motogp",
    "rajd",           // rajdy
    "wrc",
    "indycar",
    "lemans",

    // 🔥 winter sports
    "skok",           // skoki narciarskie
    "biathlon",
    "snowboard",
    "lyzwiarstw",     // łyżwiarstwo
    "curling",

    // 🔥 athletics / olympic disciplines
    "maraton",
    "biegan",         // bieganie
    "sprin",          // sprint
    "rzut",           // rzut oszczepem etc.
    "skokwzwyz",      // skok wzwyż (approx)
    "skokwdal",       // skok w dal

    // 🔥 combat sports
    "kickbox",
    "judo",
    "zapasy",
    "taekwondo",

    // 🔥 water sports
    "plywan",         // pływanie
    "wioslarstw",
    "zeglarstw",
    "kajak",

    // 🔥 cycling
    "kolarstw",
    "tour",           // Tour de France
    "tdf",

    // 🔥 general sports context
    "zawody",
    "turniej",
    "final",
    "medal",
    "rekord",
    "kwalifikacj",
    "ranking"
],

    // 🆕 GRY
gry: [
    // 🔥 podstawowe
    "gra", "gry", "gaming",

    // 🔥 gameplay
    "zapis", "save", "savegame",
    "checkpoint",
    "poziom", "level",
    "kamera",
    "fps", "rpg", "mmo", "moba",
    "bug", "patch", "update",
    "quest", "misj",        // misja
    "map", "mapa",
    "respawn",
    "loot", "drop",

    // 🔥 mechaniki
    "skill", "skil",        // skill
    "exp", "xp",
    "hp",
    "mana",
    "dmg",                 // damage
    "build",
    "perk",
    "craft", "crafting",
    "inventory", "ekwipunek",

    // 🔥 klimat / elementy gry
    "zombi", "zombie",
    "boss",
    "npc",
    "enemy",
    "cutscen",
    "dialog",
    "fabula",

    // 🔥 platformy
    "steam", "ps", "ps4", "ps5",
    "xbox",
    "playstation",
    "nintend", "switch",
    "pc",
    "konsol",

    // 🔥 studia / firmy
    "capcom", "cdprojekt", "cdpr",
    "riot", "blizzard",
    "ubisoft", "ea",
    "bethesda",

    // 🔥 popularne serie / gry
    "resident", "evil",
    "witcher", "cyberpunk",
    "gta", "fifa", "cod",
    "fortnite",
    "minecraft",
    "elden", "ring",
    "darksouls",
    "valorant",
    "league", "legends",
    "dota",

    // 🔥 tryby i styl gry
    "singleplayer", "multiplayer",
    "coop", "co-op",
    "online",
    "ranked",
    "matchmaking",

    // 🔥 slang / forum
    "grindow",        // grind
    "farm",           // farmienie
    "noob",
    "pro",
    "meta",           // meta build
    "nerf", "buff",

    // 🔥 sprzęt / techniczne
    "fps",            // duplicate OK (strong signal)
    "grafik",         // grafika
    "rozdzielcz",
    "optymalizacj",
    "lag",
    "ping"
],

technologia: [
    // 🔥 AI / software
    "ai", "sztuczn", "inteligen",
    "chatgpt", "openai",
    "model", "llm",
    "algorytm",
    "automat",        // automatyzacja
    "machinelearn",

    // 🔥 big tech
    "google", "apple", "microsoft",
    "meta", "facebook", "amazon",

    // 🔥 systems / platforms
    "android", "ios",
    "windows", "linux",
    "macos",

    // 🔥 devices
    "telefon", "smartfon",
    "komputer", "laptop",
    "tablet",
    "monitor",
    "klawiatur", "myszk",

    // 🔥 hardware
    "procesor", "cpu", "gpu",
    "ram",
    "dysk",          // SSD/HDD
    "ssd", "hdd",
    "karta",         // karta graficzna
    "chip",

    // 🔥 internet / web
    "internet",
    "stron",         // strona www
    "www",
    "przegladark",
    "chrome",
    "firefox",

    // 🔥 programming / dev
    "aplikacj",
    "program",
    "kod", "dev",
    "backend", "frontend",
    "api",
    "framework",
    "repo", "github",

    // 🔥 security
    "cyberbezpieczenstw",
    "haker", "hack",
    "phishing",
    "vpn",
    "haslo",

    // 🔥 buzzwords / common
    "cloud",
    "serwer",
    "hosting",
    "baza",          // baza danych
    "dane",
    "update", "aktualizacj",
    "bug", "blad"
],

film: [
    // 🔥 podstawowe
    "film", "serial",
    "odcink", "sezon",
    "kino",

    // 🔥 platformy
    "netflix", "hbo",
    "disney", "prime",
    "amazon", "appletv",

    // 🔥 osoby
    "aktor", "aktork",
    "rezyser",
    "scenarz",       // scenarzysta

    // 🔥 produkcja
    "premier",
    "zwiastun",      // trailer
    "trailer",
    "casting",
    "rola",

    // 🔥 gatunki
    "komedi",
    "dramat",
    "horror",
    "thriller",
    "animacj",
    "fantasy",
    "sci-fi",

    // 🔥 uniwersa
    "marvel", "dc",
    "starwars",
    "lotr",

    // 🔥 oceny / opinie
    "ocen",
    "recenzj",
    "opini",
    "rating",

    // 🔥 oglądanie
    "oglada",
    "obejrz",
    "watch",
    "stream",

    // 🔥 inne
    "boxoffice",
    "budzet",
    "produkcj"
],

muzyka: [
    // 🔥 podstawowe
    "muzyk", "piosenk",
    "album", "singl",
    "koncert",
    "artyst",
    "teledysk",

    // 🔥 gatunki
    "rap", "hiphop",
    "rock", "pop",
    "metal",
    "trap",
    "electro",
    "techno",
    "house",
    "jazz",

    // 🔥 platformy
    "spotify",
    "youtube",
    "soundcloud",
    "tidal",

    // 🔥 produkcja
    "bit",           // beat
    "produkcj",
    "mix",
    "master",

    // 🔥 wydarzenia
    "trasa",         // trasa koncertowa
    "tour",
    "festival",
    "festiwal",

    // 🔥 struktura muzyki
    "refren",
    "zwrotk",
    "tekst",

    // 🔥 slang / forum
    "feat",          // featuring
    "collab",
    "drop",          // drop utworu
    "hit",

    // 🔥 wykonanie
    "wokal",
    "instrument",
    "gitara",
    "perkusj",
    "pianin"
]
};
function categorizeText(text) {

    const normalized = normalize(text);

    const words = normalized
        .replace(/[^\w\s]/g, "")
        .split(/\s+/);

    let bestCategory = "inny";
    let bestScore = 0;

    for (const category in categories) {

        let matchCount = 0;

        for (const keyword of categories[category]) {

            let matched = keyword.length <= 3
                ? words.includes(keyword)
                : words.some(w => w.startsWith(keyword));

            if (matched) {
                matchCount++;
            }
        }

        const threshold = thresholds[category] || 2;

        if (matchCount >= threshold && matchCount > bestScore) {
            bestScore = matchCount;
            bestCategory = category;
        }
    }

    return bestCategory;
}
function getIgnoredCategories() {
    if (isFirefox) {
        return ext.storage.local.get("ignoredCategories")
            .then(result => result.ignoredCategories || []);
    } else {
        return new Promise(resolve => {
            ext.storage.local.get(["ignoredCategories"], result => {
                resolve(result.ignoredCategories || []);
            });
        });
    }
}

function saveIgnoredCategories(categories) {
    if (isFirefox) {
        return ext.storage.local.set({ ignoredCategories: categories });
    } else {
        ext.storage.local.set({ ignoredCategories: categories });
    }
}
function addCategoryLabel(comment, category) {

    const meta = comment.querySelector(".comment__meta");
    if (!meta) return;

    // prevent duplicates
    if (meta.querySelector(".category-label")) return;

    const label = document.createElement("div");
    label.className = "category-label";
    label.textContent = category;

    label.style.marginLeft = "10px";
    label.style.fontWeight = "bold";
    label.style.color = "#a21d3d";

    const links = meta.querySelector(".links");

    if (links && links.parentNode) {
        links.parentNode.insertBefore(label, links.nextSibling);
    } else {
        meta.appendChild(label);
    }
}
async function processComments() {

    const ignoredCategories = await getIgnoredCategories();

    const comments = document.querySelectorAll(".comment");

    comments.forEach(comment => {

        const content = comment.querySelector(".comment__content");
        if (!content) return;

        const text = content.innerText || "";

        const category = categorizeText(text);

        comment.dataset.category = category;

        if (ignoredCategories.includes(category)) {
            comment.style.display = "none";
        } else {
            comment.style.display = ""; // 👈 restore
        }

        if (!comment.dataset.labeled) {
            addCategoryLabel(comment, category);
            comment.dataset.labeled = "true";
        }
    });
}
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "updateFilters") {
        location.reload(); // or re-run processComments()
    }
});
document.addEventListener("DOMContentLoaded", () => {
    removeIgnoredComments();
    processComments();
});

removeIgnoredComments();

const observer = new MutationObserver(() => {
    removeIgnoredComments();
    processComments();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});