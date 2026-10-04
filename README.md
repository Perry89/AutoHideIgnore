# La Rambla Cleaner — Borneo translator

The Chrome and Firefox extension adds **Przetlumacz** beneath comments whose own
author is Borneo. It processes newly loaded replies too. **Borneo Tlumacz** in the
popup defaults to enabled; turning it off removes the controls and corrections
from every open FCBarca tab. Corrections replace the original comment text while
preserving clickable mentions and URLs. The translate button sits beside the
category label. Disabling the feature restores the original comment.

On click, the background script calls an authenticated Firebase Cloud Function.
The function first checks `borneoTranslations/comment-NUMBER` in Firestore. A
cached correction is returned without calling Gemini. A transaction claims an
uncached ID before the Gemini call, so concurrent users wait for the same result.
Failed calls release their claim; a crashed invocation's claim expires after two
minutes. Cache identity uses the entire div ID, including `comment-`.

## Connect the new Firebase project

1. Create the Firebase project and its default Cloud Firestore database. Enable
   Firebase Authentication's **Anonymous** provider. Cloud Functions deployment
   requires the project's billing plan to support Cloud Functions.
2. Install the Firebase CLI and sign in. Install the server dependencies with
   `npm install --prefix firebase/functions` (Node 22).
3. Set the server secret using `firebase functions:secrets:set GEMINI_API_KEY
   --project YOUR_PROJECT_ID`. Enter the Gemini key at the CLI prompt, never in
   extension source or chat.
4. Deploy from this directory with `firebase deploy --only
   functions:borneo-translator,firestore:rules --project YOUR_PROJECT_ID`.
   The function runs in `europe-west2`; `GEMINI_MODEL` is configurable through
   Firebase parameters and defaults to `gemini-3.8-flash`.
5. Create `translation-config.local.json` with `apiKey` and `endpoint` fields.
   Use the Firebase Web API key and the deployed callable URL:
   `https://europe-west2-YOUR_PROJECT_ID.cloudfunctions.net/translateBorneo`.
   This local file is ignored by Git. Never put keys into tracked source files.
6. Run `python3 scripts/build.py`. Load `dist/chrome` unpacked in Chrome, or
   `dist/firefox/manifest.json` as a temporary add-on in Firefox. Upload archives
   are generated in `dist` and ignored by Git. Firefox requires signing for normal
   installation. Firefox desktop 140+ and Android 142+ are supported.

The repository contains configuration placeholders only. Keep the Gemini key
in Firebase Secret Manager; local Firebase config and dotenv files are ignored.
Analytics is not used. The deployed service has passed a live correction and
cache-hit check; automated tests do not call external services.

## Cost controls and deployment limits

Generation attempts are limited to 30 per anonymous authenticated session and
300 globally per UTC day. Cache hits do not consume these limits. Failed Gemini
attempts still count. Change those constants in `firebase/functions/cache.js` if
needed. These limits bound generation attempts, not total Firebase costs.

Firestore client reads and writes are denied; the function accesses it through
the Admin SDK. Anonymous authentication is not a guarantee that a caller is the
extension. The function currently trusts the submitted comment ID and text; a
public caller can submit forged content or exhaust the daily generation allowance.
For a wider public rollout, add authoritative server verification of FCBarca
comments and stronger abuse protection. A previously cached ID retains its first
correction even if FCBarca later edits that comment, matching the ID-based cache.

The Firefox manifest declares website-content transmission. Update marketplace
privacy disclosures to explain that clicking sends the selected public comment
to Firebase and, on a cache miss, Gemini; Firebase stores the original and its
correction. No transmission occurs simply from enabling the checkbox.

## Verification

Run `npm run check` and `npm test`. Tests use an in-memory transaction adapter and
mock network responses; they do not connect to Firebase or spend Gemini tokens.
After deployment, check a real Borneo reply, a non-Borneo parent containing a
Borneo reply, newly loaded comments, two simultaneous clicks in separate browsers,
toggle changes, and a repeated click that returns the cached correction.

References: [Firebase callable protocol](https://firebase.google.com/docs/functions/callable-reference),
[Gemini text generation](https://ai.google.dev/gemini-api/docs/text-generation),
[Firefox data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/).
