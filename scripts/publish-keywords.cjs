// Administrative publisher. Uses the existing Firebase CLI login; never prints tokens.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, "src/keyword-cache.js"), "utf8"), context);
const categories = JSON.parse(fs.readFileSync(path.join(root, "firebase/data/category-keywords.json"), "utf8"));
const version = crypto.createHash("sha256").update(JSON.stringify(categories)).digest("hex");
if (!context.CategoryDictionary.valid({ version, categories })) throw new Error("Invalid categories");
async function main() {
    const binary = fs.realpathSync(execFileSync("which", ["firebase"], { encoding: "utf8" }).trim());
    const auth = require(path.resolve(path.dirname(binary), "../auth.js"));
    const account = auth.getGlobalDefaultAccount();
    if (!account) throw new Error("Run firebase login first");
    const token = await auth.getAccessToken(account.tokens.refresh_token, ["https://www.googleapis.com/auth/cloud-platform"]);
    const headers = { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" };
    const project = "borneotranslator";
    const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/categoryDictionaries/current`;
    const previous = await fetch(url, { headers });
    if (!previous.ok && previous.status !== 404) throw new Error(`Read failed: ${previous.status}`);
    const old = previous.ok ? await previous.json() : null;
    if (old?.fields?.version?.stringValue === version) { console.log("Dictionary already current:", version); return; }
    const precondition = old ? `currentDocument.updateTime=${encodeURIComponent(old.updateTime)}` : "currentDocument.exists=false";
    const fields = {
        version: { stringValue: version },
        categories: { mapValue: { fields: Object.fromEntries(Object.entries(categories).map(([name, words]) =>
            [name, { arrayValue: { values: words.map(stringValue => ({ stringValue })) } }])) } }
    };
    const result = await fetch(`${url}?${precondition}`, { method: "PATCH", headers, body: JSON.stringify({ fields }) });
    if (!result.ok) throw new Error(`Publish failed: ${result.status}`);
    console.log("Published", Object.keys(categories).length, "categories; version:", version);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
