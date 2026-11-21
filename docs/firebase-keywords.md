# Category dictionaries

Project: `borneotranslator` (same as Borneo). Public document:
`categoryDictionaries/current`. Fields: `version` (content hash), `categories`
(map of the nine existing category names to keyword arrays). GTA belongs to `gry`.

Edit `firebase/data/category-keywords.json`, then run:

```
node scripts/publish-keywords.cjs
```

The publisher uses your existing Firebase CLI login, validates all categories,
and atomically updates the document with a new content hash. A precondition
prevents overwriting concurrent changes. It never changes Borneo documents.
The initial seed and client reads were verified against production.

The extension background fetches one document at most once per 24 hours per
browser profile while FCBarca pages are being opened. Tabs share the persistent
cache and in-flight request. There are no listeners, per-comment reads or
separate version-document requests. The version and dictionaries arrive together.
Failures also record a daily attempt to avoid retry storms. The last valid data
survives outages/restarts; first-use offline falls back to bundled keywords.
Changes become available on a subsequent page load after the cache expires.
No comment content is sent for categorisation; dictionary reads need no login.

Firestore rules allow unauthenticated `get` of exactly this public document.
Collection listing, all client writes, and access to all other documents remain
denied. Administrative publishing uses Google IAM via the Firebase CLI.

## Cost

Firestore document reads are billable beyond the eligible daily free allowance
(50,000 reads, shared with Borneo and other database activity). A dictionary
refresh costs one document read, even when the version is unchanged. Ordinary
local filtering costs no database reads. 1,000 active profiles normally produce
about 1,000 dictionary reads/day. Network transfer and storage have their own
allowances. This reduces costs; it is not a hard spending cap, and clients that
clear storage or bypass the extension can make additional requests.

Reference: https://firebase.google.com/docs/firestore/pricing

Browser builds: Chrome 2.4.8, Firefox 2.4.9. Both require host access to
`https://firestore.googleapis.com/*`; they contain the same caching logic.
