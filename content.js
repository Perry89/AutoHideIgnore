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
        "bezpieczenstw"
    ],

    transfery: [
        "transfer", "kontrakt",
        "kup", "sprzed",
        "wypozycz",
        "okno",
        "ofert",
        "podpis",
        "negocjacj",
        "klauzul",
        "wykup"
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
        "nba", "koszyk", "siatkowk",
        "tenis", "atp", "wta",
        "f1", "formula",
        "ufc", "mma", "boks",
        "olimpiad",
        "lekkoatlet",
        "narciarstw",
        "hokej"
    ],

    // 🆕 GRY
gry: [
    "gra", "gry", "gaming",

    // 🔥 gameplay
    "zapis", "save", "savegame",
    "checkpoint",
    "poziom", "level",
    "kamera",
    "fps", "rpg",
    "bug", "patch", "update",

    // 🔥 klimat gry
    "zombi", "zombie",
    "boss",
    "npc",
    "map",
    "quest",

    // 🔥 platformy
    "steam", "ps", "ps5", "xbox",
    "playstation", "nintend",

    // 🔥 studia
    "capcom", "cdprojekt", "riot", "blizzard",

    // 🔥 popularne serie
    "resident", "evil",
    "witcher", "cyberpunk",
    "gta", "fifa", "cod"
],

    // 🆕 TECHNOLOGIA
    technologia: [
        "ai", "sztuczn", "inteligen",
        "chatgpt", "openai",
        "google", "apple", "microsoft",
        "android", "ios",
        "telefon", "smartfon",
        "komputer", "laptop",
        "procesor", "gpu",
        "internet", "aplikacj",
        "program", "kod", "dev",
        "cyberbezpieczenstw"
    ],

    // 🆕 FILM
    film: [
        "film", "serial",
        "netflix", "hbo",
        "disney", "prime",
        "odcink", "sezon",
        "aktor", "aktork",
        "rezyser",
        "kino",
        "marvel", "dc"
    ],

    // 🆕 MUZYKA
    muzyka: [
        "muzyk", "piosenk",
        "album", "singl",
        "koncert",
        "rap", "hiphop",
        "rock", "pop",
        "spotify",
        "artyst",
        "teledysk"
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
    return new Promise(resolve => {
        chrome.storage.local.get(["ignoredCategories"], result => {
            resolve(result.ignoredCategories || []);
        });
    });
}

function saveIgnoredCategories(categories) {
    chrome.storage.local.set({ ignoredCategories: categories });
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