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

async function storageGet(key, fallback) {
    try {
        const res = await ext.storage.local.get(key);
        return res?.[key] ?? fallback;
    } catch (e) {
        console.warn(`${key} read failed:`, e);
        return fallback;
    }
}

async function storageSet(values) {
    try {
        await ext.storage.local.set(values);
    } catch (e) {
        console.warn("Storage write failed:", e);
    }
}

async function getActiveTab() {
    if (typeof browser !== "undefined") {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        return tabs[0];
    }

    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0]));
    });
}

async function notifyContentScript() {
    const tab = await getActiveTab();
    if (!tab?.id) return;

    try {
        await ext.tabs.sendMessage(tab.id, { type: "updateFilters" });
    } catch {
        // The current tab may not be www.fcbarca.com.
    }
}

async function reloadActiveTab() {
    const tab = await getActiveTab();
    if (tab?.id) ext.tabs.reload(tab.id);
}

function getIgnoredCategories() {
    return storageGet("ignoredCategories", []);
}

function saveIgnoredCategories(value) {
    return storageSet({ ignoredCategories: value });
}

function getCategorizationEnabled() {
    return storageGet("categorizationEnabled", true);
}

function setCategorizationEnabled(value) {
    return storageSet({ categorizationEnabled: value });
}

function getMentionIgnoreEnabled() {
    return storageGet("mentionIgnoreEnabled", false);
}

function setMentionIgnoreEnabled(value) {
    return storageSet({ mentionIgnoreEnabled: value });
}

async function render() {
    const container = document.getElementById("categories");
    const categoryToggle = document.getElementById("toggleCategorization");
    const mentionToggle = document.getElementById("toggleMentionIgnore");

    const [ignored, enabled, mentionEnabled] = await Promise.all([
        getIgnoredCategories(),
        getCategorizationEnabled(),
        getMentionIgnoreEnabled()
    ]);

    categoryToggle.checked = enabled;
    mentionToggle.checked = mentionEnabled;
    container.innerHTML = "";
    container.style.display = enabled ? "block" : "none";

    mentionToggle.onchange = async () => {
        await setMentionIgnoreEnabled(mentionToggle.checked);
        await reloadActiveTab();
    };

    categoryToggle.onchange = async () => {
        await setCategorizationEnabled(categoryToggle.checked);
        container.style.display = categoryToggle.checked ? "block" : "none";
        await notifyContentScript();
    };

    categories.forEach(category => {
        const row = document.createElement("label");
        row.className = "category-row";

        const name = document.createElement("span");
        name.textContent = category;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = ignored.includes(category);

        checkbox.onchange = async () => {
            let updated = await getIgnoredCategories();

            if (checkbox.checked && !updated.includes(category)) {
                updated.push(category);
            } else if (!checkbox.checked) {
                updated = updated.filter(item => item !== category);
            }

            await saveIgnoredCategories(updated);
            await notifyContentScript();
        };

        row.append(name, checkbox);
        container.appendChild(row);
    });
}

render();
