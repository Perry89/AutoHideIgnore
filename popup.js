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
    ext.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]) return;

        if (isFirefox) {
            ext.tabs.sendMessage(tabs[0].id, { type: "updateFilters" });
        } else {
            ext.tabs.sendMessage(tabs[0].id, { type: "updateFilters" });
        }
    });
}
function getIgnoredCategories() {
    return new Promise(resolve => {
        chrome.storage.local.get(["ignoredCategories"], result => {
            resolve(result.ignoredCategories || []);
        });
    });
}
ext.runtime.onMessage.addListener((msg) => {
    if (msg.type === "updateFilters") {
        processComments();
    }
});

function saveIgnoredCategories(categories) {
    chrome.storage.local.set({ ignoredCategories: categories });
}

async function render() {

    const container = document.getElementById("categories");
    const ignored = await getIgnoredCategories();

    categories.forEach(category => {

        const row = document.createElement("div");
        row.className = "category";

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

            saveIgnoredCategories(updated);
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "updateFilters" });
});
        };

        row.appendChild(label);
        row.appendChild(checkbox);

        container.appendChild(row);
    });
}

render();