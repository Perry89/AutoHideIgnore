const categories = [
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
const ext = typeof browser !== "undefined" ? browser : chrome;
function notifyContentScript() {
    if (typeof browser !== "undefined") {
        // Firefox
        browser.tabs.query({ active: true, currentWindow: true })
            .then(tabs => {
                if (tabs[0]) {
                    browser.tabs.sendMessage(tabs[0].id, { type: "updateFilters" });
                }
            });
    } else {
        // Chrome
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "updateFilters" });
            }
        });
    }
}
function getIgnoredCategories() {
    return ext.storage.local.get("ignoredCategories")
        .then(res => res.ignoredCategories || []);
}

function saveIgnoredCategories(categories) {
    return ext.storage.local.set({ ignoredCategories: categories });
}

function getCategorizationEnabled() {
    return ext.storage.local.get("categorizationEnabled")
        .then(res => res.categorizationEnabled ?? true);
}

function setCategorizationEnabled(value) {
    return ext.storage.local.set({ categorizationEnabled: value });
}
ext.runtime.onMessage.addListener((msg) => {
    if (msg.type === "updateFilters") {
        processComments();
    }
});
function getMentionIgnoreEnabled() {
    return ext.storage.local.get("mentionIgnoreEnabled")
        .then(res => res.mentionIgnoreEnabled ?? false);
}

function setMentionIgnoreEnabled(value) {
    return ext.storage.local.set({ mentionIgnoreEnabled: value });
}
async function render() {

    const container = document.getElementById("categories");
    const toggle = document.getElementById("toggleCategorization");

    const ignored = await getIgnoredCategories();
    const enabled = await getCategorizationEnabled();
    const mentionToggle = document.getElementById("toggleMentionIgnore");
    const mentionEnabled = await getMentionIgnoreEnabled();

    mentionToggle.checked = mentionEnabled;

mentionToggle.onchange = async () => {
    await setMentionIgnoreEnabled(mentionToggle.checked);

    // 🔥 FORCE FULL REFRESH
    if (typeof browser !== "undefined") {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            browser.tabs.reload(tabs[0].id);
        }
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }
};
    toggle.checked = enabled;
    container.innerHTML = "";

    // show/hide category list
    container.style.display = enabled ? "block" : "none";

    toggle.onchange = async () => {
        await setCategorizationEnabled(toggle.checked);

        container.style.display = toggle.checked ? "block" : "none";

        notifyContentScript();
    };

    if (!enabled) return;

    categories.forEach(category => {

        const row = document.createElement("div");
        row.className = "category-row";
        const label = document.createElement("span");
        label.textContent = category;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = ignored.includes(category);

        checkbox.onchange = async () => {

            let updated = await getIgnoredCategories();

            if (checkbox.checked) {
                if (!updated.includes(category)) {
                    updated.push(category);
                }
            } else {
                updated = updated.filter(c => c !== category);
            }

            await saveIgnoredCategories(updated);
            notifyContentScript();
        };

        row.appendChild(label);
        row.appendChild(checkbox);
        container.appendChild(row);
    });
}
render();